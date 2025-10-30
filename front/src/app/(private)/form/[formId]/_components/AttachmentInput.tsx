"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import type { Question } from "./types";

interface AttachmentInputProps {
  question: Question;
  value?: any;
  onChange?: (value: any) => void;
  isInvalid?: boolean;
}

/**
 * Extracts YouTube video ID from various YouTube URL formats
 * Supports: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/embed/ID
 */
function extractYouTubeId(url: string): string | null {
  if (!url) return null;

  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\?\/]+)/,
    /^([a-zA-Z0-9_-]{11})$/, // Direct video ID
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

export default function AttachmentInput({ question }: AttachmentInputProps) {
  const youtubeUrl = question.defaultValue || "";
  const videoId = extractYouTubeId(youtubeUrl);

  if (!videoId) {
    return (
      <div className="space-y-2">
        <Label className="text-sm sm:text-base">{question.label || question.title}</Label>
        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
          <p className="text-sm text-muted-foreground">No valid YouTube URL provided</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label className="text-sm sm:text-base">{question.label || question.title}</Label>
      <div className="relative w-full overflow-hidden rounded-lg border bg-background shadow-sm">
        <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
          <iframe
            className="absolute top-0 left-0 w-full h-full"
            src={`https://www.youtube.com/embed/${videoId}`}
            title={question.label || question.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}
