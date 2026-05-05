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

import { ScrollArea } from "@/components/ui/scroll-area";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { motion, AnimatePresence } from "framer-motion";
import { Link as LinkIcon } from "lucide-react";

/* ================= TYPES ================= */
type FileItem = {
  id: string;
  name: string;
  type?: string;
  url: string;
};

type LinkItem = {
  id: string;
  name: string;
  url: string;
};

export default function ContractReportCard() {
  const [progressNote, setProgressNote] = useState("");

  const [links, setLinks] = useState<LinkItem[]>([]);
  const [linkName, setLinkName] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [openLinkModal, setOpenLinkModal] = useState(false);

  const [files, setFiles] = useState<FileItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleUpload = (file?: File | null) => {
    if (!file) return;

    setUploading(true);

    setTimeout(() => {
      const newFile: FileItem = {
        id: crypto.randomUUID(),
        name: file.name,
        type: file.type,
        url: URL.createObjectURL(file),
      };

      setFiles((prev) => [newFile, ...prev]);
      setUploading(false);

      toast.success("File uploaded successfully");
    }, 900);
  };

  const addLink = () => {
    if (!linkName.trim() || !linkUrl.trim()) return;

    const newLink: LinkItem = {
      id: crypto.randomUUID(),
      name: linkName,
      url: linkUrl,
    };

    setLinks((prev) => [newLink, ...prev]);

    setLinkName("");
    setLinkUrl("");
    setOpenLinkModal(false);

    toast.success("Link added");
  };

  return (
    <Card className="rounded-2xl shadow-sm border flex flex-col">

      {/* ================= HEADER ================= */}
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold tracking-tight">
          Contract Activity
        </CardTitle>

        <CardDescription className="text-sm text-muted-foreground">
          Track progress updates, shared links, and uploaded files in one place
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-10">

        {/* ================= PROGRESS ================= */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">
            Progress update
          </h3>

          <Textarea
            placeholder="Write what has been completed, blocked, or changed..."
            value={progressNote}
            onChange={(e) => setProgressNote(e.target.value)}
            className="min-h-[110px]"
          />

          <Button
            onClick={() => {
              setProgressNote("");
              toast.success("Progress sent");
            }}
          >
            Send update
          </Button>
        </div>

        {/* ================= LINKS ================= */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground">
            Shared links
          </h3>

          <Dialog open={openLinkModal} onOpenChange={setOpenLinkModal}>
            <DialogTrigger asChild>
              <Button size="sm">Add link</Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add new link</DialogTitle>
                <DialogDescription>
                  Attach external resources (GitHub, Drive, Notion, etc.)
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3">
                <Input
                  placeholder="Link title"
                  value={linkName}
                  onChange={(e) => setLinkName(e.target.value)}
                />

                <Input
                  placeholder="https://..."
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                />
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setOpenLinkModal(false)}>
                  Cancel
                </Button>
                <Button onClick={addLink}>Add link</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* LINKS LIST */}
        <ScrollArea className="h-[100px] pr-2">
          <div className="space-y-2">
            {links.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">
                No shared links yet — add GitHub, Drive, or documentation
              </p>
            ) : (
              <AnimatePresence>
                {links.map((l) => (
                  <motion.div
                    key={l.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="p-3 border rounded-xl bg-muted/30 hover:bg-muted/50 transition"
                  >
                    <p className="text-sm font-medium">{l.name}</p>
                    <a
                      href={l.url}
                      target="_blank"
                      className="text-xs text-primary hover:underline break-all"
                    >
                      {l.url}
                    </a>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </ScrollArea>

        {/* ================= FILES ================= */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">
            Uploaded files
          </h3>

          {/* DROPZONE */}
          <div
            className={`border-2 border-dashed rounded-xl p-6 text-center transition cursor-pointer
            ${dragActive ? "border-primary bg-primary/5 scale-[1.01]" : "border-muted hover:bg-muted/40"}`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragActive(false);
              handleUpload(e.dataTransfer.files?.[0]);
            }}
            onClick={() => document.getElementById("fileInput")?.click()}
          >
            <p className="text-sm font-medium">
              Drop files here or click to upload
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              PDF, images, documents supported
            </p>

            <Input
              id="fileInput"
              type="file"
              className="hidden"
              onChange={(e) => handleUpload(e.target.files?.[0])}
            />
          </div>
        </div>

        {/* FILE LIST */}
        <ScrollArea className="h-[100px] pr-2">
          <div className="space-y-2">
            {files.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">
                No files uploaded yet — drag a document to get started
              </p>
            ) : (
              <AnimatePresence>
                {files.map((f) => (
                  <motion.div
                    key={f.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex justify-between p-3 border rounded-xl bg-muted/30 hover:bg-muted/50 transition"
                  >
                    <div>
                      <p className="text-sm font-medium">{f.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {f.type}
                      </p>
                    </div>

                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => window.open(f.url, "_blank")}
                    >
                      <LinkIcon className="w-4 h-4" />
                    </Button>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </ScrollArea>

        <Button disabled={uploading} className="w-full">
          {uploading ? "Uploading..." : "Upload file"}
        </Button>

      </CardContent>
    </Card>
  );
}