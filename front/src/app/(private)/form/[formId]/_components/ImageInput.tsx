"use client";

import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ImageIcon, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Question } from "./types";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { uploadImageAsyncThunk, setFieldValue } from "@/lib/redux/formSlice/formSlice";
import { toast } from "sonner";
import { useSession } from "@/lib/auth/auth-client";

interface ImageInputProps {
  question: Question;
  value?: string;
  onChange?: (value: string) => void;
  isInvalid?: boolean;
}

export default function ImageInput({ question, value, onChange }: ImageInputProps) {
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector((state) => state.form.questionLoadingStates[question.id]);
  const error = useAppSelector((state) => state.form.questionErrors[question.id]);
  const { data: session } = useSession();

  // Preview is either the value (URL from server) or null
  const [preview, setPreview] = useState<string | null>(value || null);

  // Update preview when value changes from Redux
  useEffect(() => {
    setPreview(value || null);
  }, [value]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Show local preview immediately
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreview(result);
      };
      reader.readAsDataURL(file);

      // Upload to server using FormData
      try {
        if (!session?.user?.id) {
          toast.error("You must be logged in to upload images");
          setPreview(null);
          return;
        }

        const resultAction = await dispatch(
          uploadImageAsyncThunk({
            questionId: question.id,
            file: file,
            userId: session.user.id,
          })
        );

        if (uploadImageAsyncThunk.fulfilled.match(resultAction)) {
          // The fileUrl is now stored in Redux formData
          const fileUrl = resultAction.payload.fileUrl;
          onChange?.(fileUrl);
          toast.success("Image uploaded successfully");

          // Also save the submission with the image URL
          const { updateOrCreateSubmissionAsyncThunk } = await import("@/lib/redux/formSlice/formSlice");
          dispatch(updateOrCreateSubmissionAsyncThunk({ questionId: question.id, value: fileUrl }));
        } else {
          toast.error("Failed to upload image");
          setPreview(null);
        }
      } catch (err) {
        console.error("Upload error:", err);
        toast.error("Failed to upload image");
        setPreview(null);
      }
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onChange?.("");
    dispatch(setFieldValue({ questionId: question.id, value: "" }));
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={question.id} className="text-sm sm:text-base flex items-center gap-2">
        <span>
          {question.label || question.title}
          {question.required && <span className="text-red-500 ml-1">*</span>}
        </span>
        {isLoading && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
      </Label>

      {!preview ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 text-center hover:border-gray-400 transition-colors">
          <ImageIcon className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mb-2 sm:mb-3" />
          <Label htmlFor={question.id} className="cursor-pointer text-xs sm:text-sm text-gray-600 hover:text-gray-800">
            {isLoading ? "Uploading..." : "Click to upload or drag and drop"}
          </Label>
          <Input
            id={question.id}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            required={question.required || false}
            className="hidden"
            disabled={isLoading}
          />
        </div>
      ) : (
        <div className="relative border rounded-lg overflow-hidden">
          <img src={preview} alt="Preview" className="w-full h-32 sm:h-48 object-cover" />
          {isLoading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-white" />
            </div>
          )}
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8 sm:h-10 sm:w-10"
            onClick={handleRemove}
            disabled={isLoading}
          >
            <X className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </div>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
