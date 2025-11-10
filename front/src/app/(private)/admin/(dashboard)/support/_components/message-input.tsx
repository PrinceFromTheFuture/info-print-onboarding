"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Paperclip, Send, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/trpc";
import { useMutation } from "@tanstack/react-query";
import { useAppSelector } from "@/lib/redux/hooks";
import { activeTicketSelector } from "@/lib/redux/ticketsSlice/ticketsSlice";
import { ROUTES } from "@/lib/routes";

interface MediaPreview {
  file: File;
  previewUrl: string;
  id: string;
  type: string;
}

const MAX_MEDIA = 5;

export function MessageInput() {
  const [message, setMessage] = useState("");
  const [mediaPreviews, setMediaPreviews] = useState<MediaPreview[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const trpc = useTRPC();
  const selectedTicket = useAppSelector(activeTicketSelector);
  const { mutateAsync: sendMessage, isPending } = useMutation({
    ...trpc.ticketsRouter.sendTicketMessage.mutationOptions(),
  });

  const uploadedFilesUrls = useRef<string[]>([]);
  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      mediaPreviews.forEach((preview) => {
        URL.revokeObjectURL(preview.previewUrl);
      });
    };
  }, []);

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);

      const remainingSlots = MAX_MEDIA - mediaPreviews.length;
      const filesToAdd = files.slice(0, remainingSlots);

      if (filesToAdd.length === 0) {
        if (files.length > remainingSlots) {
          alert(`Maximum ${MAX_MEDIA} media files allowed`);
        }
        return;
      }

      const newPreviews: MediaPreview[] = filesToAdd.map((file) => ({
        file,
        previewUrl: URL.createObjectURL(file),
        id: `${Date.now()}-${Math.random()}`,
        type: file.type,
      }));

      setMediaPreviews((prev) => [...prev, ...newPreviews]);

      await Promise.all(
        newPreviews.map(async (preview) => {
          const formData = new FormData();
          formData.append("file", preview.file);
          const response = await fetch(ROUTES.api.baseUrl + ROUTES.api.media.upload, {
            method: "POST",
            body: formData,
            credentials: "include",
          });
          if (response.ok) {
            const data = await response.json();
            uploadedFilesUrls.current.push(data.mediaId);
          }
        })
      );

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [mediaPreviews.length]
  );

  const handleRemoveMedia = useCallback((id: string) => {
    uploadedFilesUrls.current = uploadedFilesUrls.current.filter((url) => url !== id);
    setMediaPreviews((prev) => {
      const previewToRemove = prev.find((p) => p.id === id);
      if (previewToRemove) {
        URL.revokeObjectURL(previewToRemove.previewUrl);
      }
      return prev.filter((p) => p.id !== id);
    });
  }, []);

  const handleAttachClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!selectedTicket || selectedTicket.status === "closed") return;

      const trimmedMessage = message.trim();
      const hasContent = trimmedMessage || mediaPreviews.length > 0;

      if (!hasContent || isPending) return;

      try {
        // Send message via tRPC mutation
        await sendMessage({
          ticketId: selectedTicket.id,
          content: trimmedMessage,
          attachments: uploadedFilesUrls.current,
        });

        setMessage("");
        mediaPreviews.forEach((preview) => {
          URL.revokeObjectURL(preview.previewUrl);
        });

        setMediaPreviews([]);
        uploadedFilesUrls.current = [];
      } catch (error) {
        console.error("Failed to send message:", error);
        // TODO: Show error toast notification
      }
    },
    [message, mediaPreviews, selectedTicket, sendMessage, isPending]
  );

  useEffect(() => {
    return () => {
      mediaPreviews.forEach((preview) => {
        URL.revokeObjectURL(preview.previewUrl);
      });
    };
  }, []);

  const isClosed = selectedTicket?.status === "closed";
  const canSend = Boolean(message.trim() || mediaPreviews.length > 0) && !isPending && !isClosed;

  const acceptedFiles =
    ".pdf, .csv, .txt, .doc, .docx, .xls, .xlsx, .ppt, .pptx, .odt, .ods, .odp, .rtf, .md, .json, .zip, .rar, image/*, audio/*, video/*";
  return (
    <div className="sticky bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border z-20">
      {/* Media Previews */}
      {mediaPreviews.length > 0 && (
        <div className="px-4 pt-4 pb-2">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {mediaPreviews.map((preview) => (
              <div
                key={preview.id}
                className="relative aspect-square w-24 h-24 rounded-xl overflow-hidden border-2 border-border bg-muted shrink-0 group"
              >
                {preview.type === "video" ? (
                  <video src={preview.previewUrl} className="w-full h-full object-cover" muted playsInline />
                ) : (
                  <img src={preview.previewUrl} alt="Preview" className="w-full h-full object-cover" />
                )}
                <button
                  type="button"
                  onClick={() => handleRemoveMedia(preview.id)}
                  className="absolute top-1.5 right-1.5 bg-background/90 hover:bg-background rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex gap-2 p-4 items-start">
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedFiles}
          multiple
          className="hidden"
          onChange={handleFileSelect}
          disabled={isClosed}
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-11 w-11 rounded-xl shrink-0 border-border/50 hover:bg-muted/50"
          onClick={handleAttachClick}
          disabled={mediaPreviews.length >= MAX_MEDIA || isClosed}
          title="Attach media"
        >
          <Paperclip className="h-4 w-4" />
        </Button>

        <div className="flex-1 relative">
          <textarea
            placeholder={
              isClosed ? "This ticket is closed. You cannot send messages." : "Type your message..."
            }
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !isClosed) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            rows={Math.min(Math.max(message.split("\n").length, 1), 5)}
            disabled={isClosed}
            className="w-full min-h-[44px] max-h-[132px] px-4 py-3 rounded-xl border border-border/50 bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring resize-none transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-muted/50"
          />
        </div>

        <Button
          type="submit"
          disabled={!canSend}
          size="icon"
          className="h-11 w-11 rounded-xl shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Send message"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
