"use client";

import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/trpc";
import { ROUTES } from "@/lib/routes";
import { Download, FileIcon, AlertCircle, Loader2, FileImage, FileText, File, Calendar, HardDrive, ExternalLink, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";

export const dynamic = "force-dynamic";

export default function Uploads() {
  const trpc = useTRPC();
  const { data: media, isLoading, isError, error } = useQuery(trpc.getUserMedia.queryOptions());

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
    if (mimeType.includes("video")) return "bg-pink-500/10 text-pink-600 dark:text-pink-400";
    return "bg-orange-500/10 text-orange-600 dark:text-orange-400";
  };

  const formatFileSize = (bytes: number | undefined) => {
    if (!bytes) return "Unknown";
    const sizes = ["B", "KB", "MB", "GB"];
    if (bytes === 0) return "0 B";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  };

  const formatDate = (date: string | Date | undefined) => {
    if (!date) return "Unknown";
    const d = new Date(date);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - d.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;

    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const isImageFile = (mimeType: string | null) => {
    return mimeType?.startsWith("image/") || false;
  };

  const totalSize = media?.reduce((acc, m) => acc + (m.filesize || 0), 0) || 0;

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-8 max-w-6xl mx-auto">
      {/* Header Section with Stats */}
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            File Library
          </h1>
          <p className="text-muted-foreground mt-2">Manage and access all your uploaded files in one place</p>
        </div>

        {/* Stats Cards */}
        {!isLoading && !isError && media && media.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20 border-blue-200 dark:border-blue-800">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Archive className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <div>
                    <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{media.length}</p>
                    <p className="text-xs text-blue-700 dark:text-blue-300">Total Files</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/30 dark:to-purple-900/20 border-purple-200 dark:border-purple-800">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <FileImage className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  <div>
                    <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{media.filter((m) => isImageFile(m.mimeType)).length}</p>
                    <p className="text-xs text-purple-700 dark:text-purple-300">Images</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/30 dark:to-green-900/20 border-green-200 dark:border-green-800">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <HardDrive className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <div>
                    <p className="text-2xl font-bold text-green-900 dark:text-green-100">{formatFileSize(totalSize)}</p>
                    <p className="text-xs text-green-700 dark:text-green-300">Total Size</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/30 dark:to-orange-900/20 border-orange-200 dark:border-orange-800">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  <div>
                    <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                      {
                        media.filter((m) => {
                          const uploadDate = new Date(m.createdAt || "");
                          const today = new Date();
                          return uploadDate.toDateString() === today.toDateString();
                        }).length
                      }
                    </p>
                    <p className="text-xs text-orange-700 dark:text-orange-300">Today</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Error State */}
      {isError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Files</AlertTitle>
          <AlertDescription>Failed to load your media files. {error?.message || "Please try again later."}</AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-16 w-16 md:h-20 md:w-20 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-2/3" />
                    <Skeleton className="h-4 w-1/3" />
                  </div>
                  <Skeleton className="h-10 w-28 rounded-lg" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Success State - List View */}
      {!isLoading && !isError && (
        <>
          {media && media.length > 0 ? (
            <div className="space-y-3">
              {media.map((m) => {
                const FileIconComponent = getFileIcon(m.mimeType);
                const colorClass = getFileColor(m.mimeType);
                const isImage = isImageFile(m.mimeType);
                const fileExtension = m.mimeType?.split("/")[1]?.toUpperCase() || "FILE";

                return (
                  <Card key={m.id} className="group hover:shadow-lg transition-all duration-300 hover:border-primary/50 overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex flex-col md:flex-row md:items-center gap-4 p-4 md:p-6">
                        {/* File Preview/Icon */}
                        <div className="flex items-start md:items-center gap-4 flex-1 min-w-0">
                          <div className="relative">
                            {isImage && m.url ? (
                              <div className="h-16 w-16 md:h-20 md:w-20 rounded-xl overflow-hidden bg-muted border-2 border-border shadow-sm">
                                <Image
                                  src={ROUTES.api.baseUrl + m.url}
                                  alt={m.filename || "File preview"}
                                  width={80}
                                  height={80}
                                  className="w-full h-full object-cover"
                                  unoptimized
                                />
                              </div>
                            ) : (
                              <div
                                className={`h-16 w-16 md:h-20 md:w-20 rounded-xl flex items-center justify-center ${colorClass} border-2 border-current/20 shadow-sm`}
                              >
                                <FileIconComponent className="h-8 w-8 md:h-10 md:w-10" />
                              </div>
                            )}
                          </div>

                          {/* File Info */}
                          <div className="flex-1 min-w-0 space-y-2">
                            <div className="flex items-start gap-2 flex-wrap">
                              <h3 className="font-semibold text-base md:text-lg truncate max-w-xs md:max-w-md" title={m.filename || "Unknown"}>
                                {m.filename || "Unknown file"}
                              </h3>
                              <Badge variant="outline" className="text-xs">
                                {fileExtension}
                              </Badge>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1.5">
                                <HardDrive className="h-3.5 w-3.5" />
                                <span>{formatFileSize(m.filesize)}</span>
                              </div>
                              <Separator orientation="vertical" className="h-4" />
                              <div className="flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5" />
                                <span>{formatDate(m.createdAt)}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 md:flex-shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 md:flex-none cursor-pointer group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                            onClick={() => handleDownload(m.url!, m.filename!)}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                          {m.url && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="cursor-pointer"
                              onClick={() => window.open(ROUTES.api.baseUrl + m.url, "_blank")}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="py-16 border-dashed">
              <CardContent className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-4">
                  <Archive className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Your file library is empty</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Files you upload through form submissions will appear here. Start completing your workflows to see your files.
                </p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
