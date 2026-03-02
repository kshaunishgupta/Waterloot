"use client";

import { useCallback, useRef, useState } from "react";
import { Upload, X, Loader2, ImagePlus } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import {
  MAX_IMAGES,
  MAX_IMAGE_SIZE,
  ACCEPTED_IMAGE_TYPES,
} from "@/lib/constants";

interface ImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
  userId: string;
}

interface UploadingFile {
  id: string;
  name: string;
  progress: number;
}

export function ImageUpload({ images, onChange, userId }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState<UploadingFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remainingSlots = MAX_IMAGES - images.length - uploading.length;

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      return `${file.name}: Only JPEG, PNG, and WebP images are accepted`;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      return `${file.name}: File size must be under 5MB`;
    }
    return null;
  };

  const uploadFile = async (file: File): Promise<string | null> => {
    const supabase = createClient();

    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const fileId = crypto.randomUUID();
    const path = `${userId}/${fileId}.${ext}`;

    // Add to uploading state
    setUploading((prev) => [
      ...prev,
      { id: fileId, name: file.name, progress: 0 },
    ]);

    try {
      // Simulate progress stages since Supabase JS SDK does not expose granular upload progress
      setUploading((prev) =>
        prev.map((u) => (u.id === fileId ? { ...u, progress: 30 } : u))
      );

      const { error: uploadError } = await supabase.storage
        .from("listing-images")
        .upload(path, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      setUploading((prev) =>
        prev.map((u) => (u.id === fileId ? { ...u, progress: 90 } : u))
      );

      const {
        data: { publicUrl },
      } = supabase.storage.from("listing-images").getPublicUrl(path);

      setUploading((prev) =>
        prev.map((u) => (u.id === fileId ? { ...u, progress: 100 } : u))
      );

      // Small delay so user sees 100%
      await new Promise((r) => setTimeout(r, 200));

      return publicUrl;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Upload failed"
      );
      return null;
    } finally {
      setUploading((prev) => prev.filter((u) => u.id !== fileId));
    }
  };

  const processFiles = useCallback(
    async (fileList: FileList | File[]) => {
      setError(null);
      const files = Array.from(fileList);

      if (files.length > remainingSlots) {
        setError(
          `You can only upload ${remainingSlots} more image${remainingSlots === 1 ? "" : "s"} (max ${MAX_IMAGES})`
        );
        return;
      }

      // Validate all files first
      for (const file of files) {
        const validationError = validateFile(file);
        if (validationError) {
          setError(validationError);
          return;
        }
      }

      // Upload all concurrently
      const results = await Promise.all(files.map(uploadFile));
      const successUrls = results.filter((url): url is string => url !== null);

      if (successUrls.length > 0) {
        onChange([...images, ...successUrls]);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [images, onChange, remainingSlots, userId]
  );

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  // Drag handlers
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setDragActive(true);
    }
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        processFiles(e.dataTransfer.files);
      }
    },
    [processFiles]
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
    // Reset input so the same file can be selected again
    e.target.value = "";
  };

  return (
    <div className="space-y-3">
      {/* Image preview grid */}
      {(images.length > 0 || uploading.length > 0) && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
          {images.map((url, index) => (
            <div
              key={url}
              className="group relative aspect-square overflow-hidden border border-neutral-700 bg-neutral-800"
            >
              <Image
                src={url}
                alt={`Upload ${index + 1}`}
                fill
                className="object-cover"
                sizes="150px"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className={cn(
                  "absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white",
                  "opacity-0 transition-opacity group-hover:opacity-100",
                  "hover:bg-black/80 focus:opacity-100 focus:outline-none"
                )}
                aria-label={`Remove image ${index + 1}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
              {index === 0 && (
                <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white">
                  Cover
                </span>
              )}
            </div>
          ))}

          {/* Upload progress indicators */}
          {uploading.map((file) => (
            <div
              key={file.id}
              className="relative flex aspect-square items-center justify-center overflow-hidden border border-neutral-700 bg-neutral-800"
            >
              <div className="flex flex-col items-center gap-1">
                <Loader2 className="h-5 w-5 animate-spin text-primary-600" />
                <span className="text-[10px] text-neutral-400">
                  {file.progress}%
                </span>
              </div>
              {/* Progress bar at bottom */}
              <div className="absolute bottom-0 left-0 h-1 w-full bg-neutral-700">
                <div
                  className="h-full bg-primary-600 transition-all duration-300"
                  style={{ width: `${file.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Drop zone / upload button */}
      {remainingSlots > 0 && (
        <div
          onDrag={handleDrag}
          onDragEnter={handleDragIn}
          onDragLeave={handleDragOut}
          onDragOver={handleDragIn}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-8 transition-colors",
            dragActive
              ? "border-primary-500 bg-primary-900/20"
              : "border-neutral-700 bg-neutral-800 hover:border-neutral-600 hover:bg-neutral-700"
          )}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
        >
          {dragActive ? (
            <Upload className="h-8 w-8 text-primary-500" />
          ) : (
            <ImagePlus className="h-8 w-8 text-neutral-400" />
          )}
          <div className="text-center">
            <p className="text-sm font-medium text-neutral-200">
              {dragActive
                ? "drop images here"
                : "click or drag images to upload"}
            </p>
            <p className="mt-1 text-xs text-neutral-400">
              JPEG, PNG, or WebP. Max 5MB each. Up to {MAX_IMAGES} images.
            </p>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES.join(",")}
        multiple
        onChange={handleFileSelect}
        className="hidden"
        aria-label="Upload images"
      />

      {/* Error message */}
      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      {/* Slot counter */}
      <p className="text-xs text-neutral-500">
        {images.length} / {MAX_IMAGES} images uploaded
      </p>
    </div>
  );
}
