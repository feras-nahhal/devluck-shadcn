"use client";

import { useState } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

/* ================= FILE TYPE ================= */
type MockFile = {
  name: string;
  type: string;
  url: string;
};

export default function ContractReportCard() {
  /* ================= PROGRESS ================= */
  const [progressNote, setProgressNote] = useState("");
  const [sendingProgress, setSendingProgress] = useState(false);

  /* ================= FILES ================= */
  const [files, setFiles] = useState<MockFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  /* ================= HANDLE UPLOAD (MOCK) ================= */
  const handleUpload = (file?: File | null) => {
    if (!file) return;

    setUploading(true);

    setTimeout(() => {
      const mockFile: MockFile = {
        name: file.name,
        type: file.type,
        url: URL.createObjectURL(file), // mock preview
      };

      setFiles((prev) => [...prev, mockFile]);
      setUploading(false);

      toast.success("File uploaded (mock)");
    }, 1000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contract Reports</CardTitle>
        <CardDescription>
          Progress updates, issue reports, and contract attachments
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-10">

        {/* ================= PROGRESS ================= */}
        <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground">
            Progress Update
        </h3>

        <Dialog>
            <DialogTrigger >
            <Button>
                Add Progress Update
            </Button>
            </DialogTrigger>

            <DialogContent>
            <DialogHeader>
                <DialogTitle>Send Progress Update</DialogTitle>
                <DialogDescription>
                Write a short update about the contract progress.
                </DialogDescription>
            </DialogHeader>

            <Textarea
                placeholder="Write progress update..."
                value={progressNote}
                onChange={(e) => setProgressNote(e.target.value)}
                className="min-h-[120px]"
            />

            <DialogFooter className="flex gap-2">
                <Button
                variant="outline"
                onClick={() => setProgressNote("")}
                >
                Cancel
                </Button>

                <Button
                disabled={!progressNote.trim() || sendingProgress}
                onClick={() => {
                    setSendingProgress(true);

                    setTimeout(() => {
                    setSendingProgress(false);
                    setProgressNote("");
                    toast.success("Progress submitted (mock)");
                    }, 1000);
                }}
                >
                {sendingProgress ? "Sending..." : "Send Update"}
                </Button>
            </DialogFooter>
            </DialogContent>
        </Dialog>
        </div>

        {/* ================= FILE UPLOAD ================= */}
        <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground">
            Attachments
        </h3>

        {/* DROPZONE */}
        <div
            className={`
            border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition
            ${dragActive ? "border-primary bg-muted/40" : "border-muted"}
            `}
            onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(e) => {
            e.preventDefault();
            setDragActive(false);

            const file = e.dataTransfer.files?.[0];
            if (file) handleUpload(file);
            }}
            onClick={() => {
            document.getElementById("fileInput")?.click();
            }}
        >
            <p className="text-sm text-muted-foreground">
            Drag & drop file here or click to upload
            </p>

            <p className="text-xs text-muted-foreground mt-1">
            Supports images, PDF, and documents
            </p>

            <Input
            id="fileInput"
            type="file"
            className="hidden"
            onChange={(e) => handleUpload(e.target.files?.[0])}
            />
        </div>

        {/* FILE LIST */}
        <div className="grid gap-3">
            {files.length === 0 && (
            <p className="text-sm text-muted-foreground">
                No files uploaded yet
            </p>
            )}

            {files.map((file, i) => (
            <div
                key={i}
                className="flex items-center justify-between border rounded-md p-3"
            >
                <div className="flex flex-col">
                <span className="text-sm font-medium">{file.name}</span>

                <span className="text-xs text-muted-foreground">
                    {file.type.includes("pdf")
                    ? "PDF Document"
                    : file.type.includes("image")
                    ? "Image File"
                    : "File"}
                </span>
                </div>

                {file.type.includes("image") ? (
                <img
                    src={file.url}
                    className="w-10 h-10 object-cover rounded"
                />
                ) : (
                <div className="text-xs text-muted-foreground">📄</div>
                )}
            </div>
            ))}
        </div>

        <Button disabled={uploading}>
            {uploading ? "Uploading..." : "Upload File"}
        </Button>
        </div>

      </CardContent>
    </Card>
  );
}