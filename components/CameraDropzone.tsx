'use client';

import React, { useRef, useState, useCallback } from 'react';
import { Camera, Upload, ArrowRight, FileText, Scan, Sparkles, Loader2 } from 'lucide-react';

interface CameraDropzoneProps {
  onProcessImage: (file: File) => void;
  onUseSampleDemo: () => void;
  isProcessing?: boolean;
}

// Client-side image downscaling to prevent payload limit overflow and speed up OCR
async function compressImageForOcr(file: File, maxDimension = 1600): Promise<File> {
  if (!file.type.startsWith('image/') || file.type === 'image/svg+xml') {
    return file;
  }

  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let { width, height } = img;

      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        return resolve(file);
      }

      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (!blob) return resolve(file);
          const compressed = new File([blob], file.name.replace(/\.[^/.]+$/, '.jpg'), {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });
          resolve(compressed);
        },
        'image/jpeg',
        0.88
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file);
    };

    img.src = objectUrl;
  });
}

export const CameraDropzone: React.FC<CameraDropzoneProps> = ({
  onProcessImage,
  onUseSampleDemo,
  isProcessing = false,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleSelectedFile = useCallback(
    async (file: File) => {
      if (!file) return;
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file (PNG, JPG, WEBP).');
        return;
      }

      setIsCompressing(true);
      try {
        const optimizedFile = await compressImageForOcr(file);
        // Automatically start processing upon upload
        onProcessImage(optimizedFile);
      } catch (err) {
        console.error('Image compression error:', err);
        onProcessImage(file);
      } finally {
        setIsCompressing(false);
      }
    },
    [onProcessImage]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleSelectedFile(e.dataTransfer.files[0]);
      }
    },
    [handleSelectedFile]
  );

  return (
    <div className="w-full max-w-lg mx-auto px-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/jpg"
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.[0]) handleSelectedFile(e.target.files[0]);
        }}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.[0]) handleSelectedFile(e.target.files[0]);
        }}
      />

      <div className="relative group rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6 sm:p-7 space-y-5 backdrop-blur-xl shadow-2xl transition hover:border-zinc-700">
        <div>
          <h2 className="text-base font-semibold text-zinc-100 flex items-center justify-between">
            <span>Import Class Schedule</span>
            <span className="text-[10px] text-zinc-400 font-mono flex items-center gap-1">
              <Scan className="w-3 h-3 text-indigo-400" />
              <span>VISION OCR</span>
            </span>
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Upload your syllabus photo, portal screenshot, or registration slip.
          </p>
        </div>

        {/* Dropzone Area */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={() => !isCompressing && fileInputRef.current?.click()}
          className={`relative flex flex-col items-center justify-center p-8 sm:p-10 rounded-xl border-2 border-dashed transition text-center overflow-hidden cursor-pointer ${
            isDragOver
              ? 'border-indigo-500 bg-indigo-950/20 shadow-inner'
              : 'border-zinc-800 hover:border-zinc-600 bg-zinc-950/60'
          }`}
        >
          {isCompressing ? (
            <div className="flex flex-col items-center space-y-2 py-4">
              <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
              <p className="text-xs font-medium text-zinc-300 font-mono">
                Optimizing image for OCR...
              </p>
            </div>
          ) : (
            <>
              <div className="h-12 w-12 rounded-xl bg-zinc-800/90 border border-zinc-700/80 flex items-center justify-center text-zinc-300 mb-3 shadow-md group-hover:scale-105 transition-transform">
                <Upload className="w-5 h-5 text-indigo-400" />
              </div>

              <p className="text-xs font-medium text-zinc-200">
                Drop schedule image here or click to browse
              </p>
              <p className="text-[11px] text-zinc-500 mt-1">
                PNG, JPG, WEBP • Automatically parsed on upload
              </p>

              {/* Action Buttons */}
              <div
                className="flex items-center gap-2 mt-5"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-xs font-medium text-zinc-200 transition active:scale-95 cursor-pointer shadow-sm"
                >
                  <Camera className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Take Photo</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-xs font-medium text-zinc-200 transition active:scale-95 cursor-pointer shadow-sm"
                >
                  <FileText className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Choose File</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Quick Demo Option */}
        <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
          <span className="text-[11px]">Don&apos;t have an image ready?</span>
          <button
            type="button"
            onClick={onUseSampleDemo}
            className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-medium transition cursor-pointer"
          >
            <Sparkles className="w-3 h-3" />
            <span>Load sample schedule</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
