"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/trpc";
import { ROUTES } from "@/lib/routes";
import { Download, FileIcon, AlertCircle, FileImage, FileText, File, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";

export const dynamic = "force-dynamic";

export default function Uploads() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { data: media, isLoading, isError, error } = useQuery(trpc.getUserMedia.queryOptions());
  const { mutateAsync: deleteMedia, isPending: isDeleting } = useMutation(trpc.customerRouter.deleteMedia.mutationOptions());

  const handleDelete = async (id: string) => {
    try {
      await deleteMedia({ id });
      queryClient.invalidateQueries({ queryKey: trpc.getUserMedia.queryKey() });
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleDownload = async (url: string, fileName: string) => {
    try {
      const response = await fetch(ROUTES.api.baseUrl + url, {
        method: "GET",
        headers: {
          // add auth headers if needed
        },
      });

      if (!response.ok) throw new Error("Network response was not ok");

      const blob = await response.blob();
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // free memory
      window.URL.revokeObjectURL(link.href);
    } catch (err) {
      console.error("Download failed:", err);
    }
  };

  const getFileIcon = (mimeType: string | null) => {
    if (!mimeType) return File;
    if (mimeType.startsWith("image/")) return FileImage;
    if (mimeType.startsWith("text/") || mimeType.includes("pdf")) return FileText;
    return FileIcon;
  };

  const getFileColor = (mimeType: string | null) => {
    if (!mimeType) return "bg-slate-500/10 text-slate-600 dark:text-slate-400";
    if (mimeType.startsWith("image/")) return "bg-purple-500/10 text-purple-600 dark:text-purple-400";
    if (mimeType.startsWith("text/") || mimeType.includes("pdf")) return "bg-blue-500/10 text-blue-600 dark:text-blue-400";
    return "bg-orange-500/10 text-orange-600 dark:text-orange-400";
  };

  const isImageFile = (mimeType: string | null) => {
    return mimeType?.startsWith("image/") || false;
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Uploads</h1>
        <p className="text-muted-foreground mt-1">Manage your uploaded files</p>
      </div>

      {/* Error State */}
      {isError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Files</AlertTitle>
          <AlertDescription>{error?.message || "Please try again later."}</AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-1.5">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardContent className="py-2.5 px-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="h-8 w-16 shrink-0" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Success State */}
      {!isLoading && !isError && (
        <>
          {media && media.length > 0 ? (
            <div className="space-y-1.5">
              {media.map((m) => {
                const FileIconComponent = getFileIcon(m.mimeType ?? null);
                const colorClass = getFileColor(m.mimeType ?? null);
                const isImage = isImageFile(m.mimeType ?? null);

                return (
                  <Card key={m.id} className="hover:shadow-md transition-all duration-200 hover:border-primary/50">
                    <CardContent className="py-2.5 px-3">
                      <div className="flex items-center gap-3">
                        {/* File Preview/Icon */}
                        {isImage && m.url ? (
                          <div className="h-10 w-10 rounded-lg overflow-hidden bg-muted shrink-0">
                            <Image
                              src={ROUTES.api.baseUrl + m.url}
                              alt={m.filename || "File preview"}
                              width={40}
                              height={40}
                              className="w-full h-full object-cover"
                              unoptimized
                            />
                          </div>
                        ) : (
                          <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${colorClass} shrink-0`}>
                            <FileIconComponent className="h-5 w-5" />
                          </div>
                        )}

                        {/* File Name */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate" title={m.filename || "Unknown"}>
                            {m.filename || "Unknown file"}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 shrink-0">
                          {m.url && (
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDownload(m.url!, m.filename!)}>
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(m.id)} disabled={isDeleting}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="py-12 border-dashed">
              <CardContent className="text-center">
                <p className="text-muted-foreground">No files uploaded yet</p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
