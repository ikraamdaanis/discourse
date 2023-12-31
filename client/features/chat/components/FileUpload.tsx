"use client";

import "@uploadthing/react/styles.css";
import { OurFileRouter } from "app/api/uploadthing/core";
import { UploadDropzone } from "lib/uploadthing";
import { FileIcon, X } from "lucide-react";
import Image from "next/image";
import { UploadFileResponse } from "uploadthing/client";

type FileUploadProps = {
  endpoint: keyof OurFileRouter;
  value: string;
  onChange: (url?: string) => void;
};

/** File uploader for images and PDFs. */
export const FileUpload = ({ endpoint, value, onChange }: FileUploadProps) => {
  const fileType = value?.split(".").pop();

  if (value && fileType !== "pdf") {
    return (
      <div className="relative h-20 w-20">
        <Image
          fill
          src={value}
          alt="uploaded image"
          className="rounded-full"
          sizes="80px"
        />
        <button
          onClick={() => {
            onChange("");
          }}
          className="absolute right-0 top-0 rounded-full bg-rose-500 p-1 text-white shadow-sm"
          type="button"
        >
          <X className="h-4 w-4"></X>
        </button>
      </div>
    );
  }

  if (value && fileType === "pdf") {
    return (
      <div className="relative mt-2 flex items-center rounded-md bg-background/10 p-2">
        <FileIcon className="h-10 w-10 fill-indigo-200 stroke-indigo-400" />
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-2 text-sm text-indigo-400 hover:underline"
        >
          {value}
        </a>
        <button
          onClick={() => {
            onChange("");
          }}
          className="absolute -right-2 -top-2 rounded-full bg-rose-500 p-1 text-white shadow-sm"
          type="button"
        >
          <X className="h-4 w-4"></X>
        </button>
      </div>
    );
  }

  return (
    <UploadDropzone
      endpoint={endpoint}
      onClientUploadComplete={(res?: UploadFileResponse[]) => {
        return onChange(res?.[0].url);
      }}
      onUploadError={(error: Error) => {
        console.error("Upload error: ", error);
      }}
      appearance={{
        button:
          "bg-brandColour font-medium ut-uploading:bg-rose-400 after:bg-rose-400",
        container: "border-zinc-500",
        allowedContent: "text-zinc-300",
        label: "text-zinc-200"
      }}
    />
  );
};
