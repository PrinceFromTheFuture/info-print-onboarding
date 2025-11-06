"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Paperclip, Send, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/trpc";
import { useMutation } from "@tanstack/react-query";
import { activeTicketSelector } from "@/lib/redux/ticketsSlice/ticketsSlice";
import { useAppSelector } from "@/lib/redux/hooks";

interface MessageInputProps {
  onSendMessage: (message: string, files?: File[]) => void;
  onAttachFile?: () => void;
}

interface MediaPreview {
  file: File;
  previewUrl: string;
  id: string;
}

export function MessageInput({ onSendMessage, onAttachFile }: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [mediaPreviews, setMediaPreviews] = useState<MediaPreview[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaPreviewsRef = useRef<MediaPreview[]>([]);
  const trpc = useTRPC();
  const selectedTicket = useAppSelector(activeTicketSelector);
  const { mutateAsync: sendMessage } = useMutation(trpc.ticketsRouter.sendTicketMessage.mutationOptions());
  const MAX_MEDIA = 5;

  // Keep ref in sync with state
  useEffect(() => {
    mediaPreviewsRef.current = mediaPreviews;
  }, [mediaPreviews]);

  // Cleanup blob URLs on unmount only
  useEffect(() => {
    return () => {
      mediaPreviewsRef.current.forEach((preview) => {
        URL.revokeObjectURL(preview.previewUrl);
      });
    };
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    // Filter for image files only
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    // Calculate how many more we can add
    const remainingSlots = MAX_MEDIA - mediaPreviews.length;
    const filesToAdd = imageFiles.slice(0, remainingSlots);

    if (filesToAdd.length === 0) {
      if (imageFiles.length > remainingSlots) {
        alert(`Maximum ${MAX_MEDIA} images allowed`);
      }
      return;
    }

    // Create preview URLs for selected images
    const newPreviews: MediaPreview[] = filesToAdd.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
      id: `${Date.now()}-${Math.random()}`,
    }));

    setMediaPreviews((prev) => [...prev, ...newPreviews]);

    // Reset input to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    onAttachFile?.();
  };

  const handleRemoveMedia = (id: string) => {
    setMediaPreviews((prev) => {
      const previewToRemove = prev.find((p) => p.id === id);
      if (previewToRemove) {
        URL.revokeObjectURL(previewToRemove.previewUrl);
      }
      return prev.filter((p) => p.id !== id);
    });
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = (e: React.FormEvent) => {
    sendMessage({ ticketId: selectedTicket?.id || "", content: message.trim() });
    e.preventDefault();
    const hasContent = message.trim() || mediaPreviews.length > 0;

    if (hasContent) {
      const files = mediaPreviews.map((preview) => preview.file);
      onSendMessage(message.trim(), files.length > 0 ? files : undefined);
      setMessage("");

      // Cleanup and clear media previews
      mediaPreviews.forEach((preview) => {
        URL.revokeObjectURL(preview.previewUrl);
      });
      setMediaPreviews([]);
    }
  };

  return (
    <div className="absolute bottom-0 left-0 right-0">
      {/* Media Preview Grid */}

      {/* Input Form */}
      <div className={"flex gap-2 z-20 relative p-4 items-end"}>
        <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileSelect} />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="p-0 h-14 w-11 rounded-xl"
          onClick={handleAttachClick}
          disabled={mediaPreviews.length >= MAX_MEDIA}
        >
          <Paperclip className="h-4 w-4" />
        </Button>
        <label
          className={cn(
            "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input min-h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            "focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]",
            "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive group pt-2 bg-background"
          )}
        >
          {mediaPreviews.length > 0 && (
            <div className="mb-2 mt-2 pb-2 z-20 relative">
              <div className="flex gap-2  items-end">
                {mediaPreviews.map((preview) => (
                  <div key={preview.id} className="relative aspect-square w-20 h-20 rounded-lg overflow-hidden border border-border bg-muted group">
                    <img src={preview.previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveMedia(preview.id)}
                      className="absolute top-1 right-1 bg-background/80 hover:bg-background rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          <textarea
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={message.split("\n").length}
            className="w-full outline-none  resize-none h-full my-2  "
          />
        </label>
        <Button
          type="button"
          disabled={!message.trim() && mediaPreviews.length === 0}
          onClick={handleSubmit}
          className="h-14 w-11 text-sm rounded-xl"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
      <div className="absolute bg-linear-to-b from-transparent z-0 to-background to-60% left-0 right-0 h-16 bottom-0" />
    </div>
  );
}
