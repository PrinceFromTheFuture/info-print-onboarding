"use client";
import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Field, FieldGroup, FieldLabel, FieldDescription } from "@/components/ui/field";
import { toast } from "sonner";
import { Upload, FileText, Loader2, X, Image as ImageIcon } from "lucide-react";
import type { AccountSetupForm, AccountSetupFormData } from "../account-set-up";
import { Button } from "@/components/ui/button";

type DocumentFieldName =
  | "logo"
  | "contactAndCompanyList"
  | "inventoryList"
  | "machineInformation"
  | "additionalProductPricingInformation";

export function DocumentUploadsStage({ form, userId }: { form: AccountSetupForm; userId?: string }) {
  const FileUploadField = ({
    label,
    description,
    fieldName,
  }: {
    label: string;
    description: string;
    fieldName: DocumentFieldName;
  }) => {
    // Initialize state from form values
    const formValue = form.getValues(fieldName);
    const [uploadedFileName, setUploadedFileName] = useState<string>(formValue?.fileName || "");
    const [uploadedFileUrl, setUploadedFileUrl] = useState<string>(formValue?.fileUrl || "");
    const [isUploading, setIsUploading] = useState(false);
    const [hasUploadedFile, setHasUploadedFile] = useState(!!formValue?.mediaId);
    const [fileType, setFileType] = useState<string>(formValue?.fileType || "");

    // Sync state with form values when they change
    useEffect(() => {
      const formValue = form.getValues(fieldName);
      if (formValue?.mediaId) {
        setUploadedFileName(formValue.fileName || "");
        setUploadedFileUrl(process.env.NEXT_PUBLIC_BACKEND_URL + formValue.fileUrl || "");
        setFileType(formValue.fileType || "");
        setHasUploadedFile(true);
      } else {
        setUploadedFileName("");
        setUploadedFileUrl("");
        setFileType("");
        setHasUploadedFile(false);
      }
    }, [fieldName, form]);

    const handleRemove = useCallback(() => {
      form.setValue(
        fieldName,
        { mediaId: "", fileName: "", fileUrl: "", fileType: "" },
        { shouldValidate: true }
      );
      setUploadedFileName("");
      setUploadedFileUrl("");
      setHasUploadedFile(false);
      setFileType("");
      toast.info(`${label} removed`);
    }, [fieldName, label, form]);

    const onDrop = useCallback(
      async (acceptedFiles: File[]) => {
        if (acceptedFiles.length === 0) return;

        const file = acceptedFiles[0];

    
        setIsUploading(true);
        try {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("userId", userId || "");
          formData.append("alt", `${label} - ${file.name}`);

          const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/media/upload`, {
            method: "POST",
            body: formData,
            credentials: "include",
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Upload failed");
          }

          const data = await response.json();

          // Store the complete file info in the form
          const fileInfo = {
            mediaId: data.mediaId,
            fileName: file.name,
            fileUrl: data.serverFileUrl,
            fileType: file.type,
          };

          form.setValue(fieldName, fileInfo, { shouldValidate: true });
          setUploadedFileName(file.name);
          setUploadedFileUrl(data.serverFileUrl);
          setFileType(file.type);
          setHasUploadedFile(true);
          toast.success(`${label} uploaded successfully!`);
        } catch (error) {
          console.error("Upload error:", error);
          toast.error(
            `Failed to upload ${label}: ${error instanceof Error ? error.message : "Unknown error"}`
          );
        } finally {
          setIsUploading(false);
        }
      },
      [fieldName, userId, label, form]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      onDrop,
      maxSize: 10 * 1024 * 1024, // 10MB
      accept: {
        "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
        "application/pdf": [".pdf"],
        "text/csv": [".csv"],
        "application/vnd.ms-excel": [".xls"],
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      },
      disabled: isUploading || hasUploadedFile,
      multiple: false,
    });

    const isImage = fileType && fileType.startsWith("image/");

    return (
      <Field>
        <FieldLabel>{label} *</FieldLabel>
        {hasUploadedFile ? (
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-primary/10 border border-primary/30 max-w-full">
              {isImage && uploadedFileUrl ? (
                <div className="flex-shrink-0 w-6 h-6 rounded-full overflow-hidden border border-primary/30">
                  <img src={uploadedFileUrl} alt={uploadedFileName} className="w-full h-full object-cover" />
                </div>
              ) : (
                <FileText className="size-4 text-primary flex-shrink-0" />
              )}
              <a
                href={uploadedFileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-primary hover:underline truncate max-w-[200px] sm:max-w-xs"
              >
                {uploadedFileName}
              </a>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleRemove}
                className="flex-shrink-0 h-5 w-5 rounded-full hover:bg-destructive/20 text-muted-foreground hover:text-destructive p-0"
              >
                <X className="size-3" />
              </Button>
            </div>
          </div>
        ) : (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-4 sm:p-6 text-center transition-all ${
              isUploading
                ? "cursor-wait border-primary/30 bg-primary/5"
                : "cursor-pointer " +
                  (isDragActive ? "border-primary bg-primary/10" : "border-input hover:border-primary/50")
            }`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-2 sm:gap-3">
              <div className="p-2 sm:p-3 rounded-lg bg-primary/20">
                {isUploading ? (
                  <Loader2 className="size-5 sm:size-6 text-primary animate-spin" />
                ) : (
                  <Upload className="size-5 sm:size-6 text-primary" />
                )}
              </div>
              {isUploading ? (
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm font-medium text-primary">Uploading...</p>
                  <p className="text-xs text-muted-foreground">Please wait</p>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm text-foreground font-medium">
                    {isDragActive ? "Drop the file here" : "Tap to upload or drag and drop"}
                  </p>
                  <p className="text-xs text-muted-foreground">PDF, CSV, Excel, or Images (max 10MB)</p>
                </div>
              )}
            </div>
          </div>
        )}
        {form.formState.errors[fieldName] && (
          <p className="text-sm text-red-500 mt-1">{String(form.formState.errors[fieldName]?.message)}</p>
        )}
        <FieldDescription>{description}</FieldDescription>
      </Field>
    );
  };

  return (
    <FieldGroup>
      <FileUploadField label="Company Logo" description="Your company logo for branding" fieldName="logo" />
      <FileUploadField
        label="Contact & Company List"
        description="Upload your existing contact database"
        fieldName="contactAndCompanyList"
      />
      <FileUploadField
        label="Inventory List"
        description="Current inventory and stock information"
        fieldName="inventoryList"
      />
      <FileUploadField
        label="Machine Information"
        description="Details about your printing equipment"
        fieldName="machineInformation"
      />
      <FileUploadField
        label="Additional Product Pricing Information"
        description="Pricing sheets and product catalogs"
        fieldName="additionalProductPricingInformation"
      />
    </FieldGroup>
  );
}
