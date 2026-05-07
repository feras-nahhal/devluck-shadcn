"use client";

import { useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, Clock, Download, DownloadCloud, ExternalLink, Link2, UploadCloud } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link as LinkIcon, Trash2, Upload, FileText } from "lucide-react";
import {
  FileImage,
  FileCode,
  File,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";


/* ================= TYPES ================= */
type FileItem = {
  id?: string;
  name: string;
  type?: string;
  url: string;
  file?: File;
  size?: number;
};

type LinkItem = {
  id?: string;
  title: string;
  url: string;
};

type ProgressHistoryItem = {
  id: string;
  report: string;
  links?: { title: string; url: string }[] | null;
  files?: { fileName: string; fileUrl: string; mimeType?: string | null }[] | null;
  createdAt: string;
};

interface ContractReportCardProps {
  onSubmit: (payload: { report: string; links: { title: string; url: string }[]; files: File[] }) => Promise<void>;
  submitting?: boolean;
  history?: ProgressHistoryItem[];
  maxFileSize?: number; // MB
  allowedFileTypes?: string[];
}

export default function ContractReportCard({ 
  onSubmit, 
  submitting = false, 
  history = [],
  maxFileSize = 10,
  allowedFileTypes = [
    "image/*",  // All images
    "application/pdf",  // PDF documents
    "application/zip",  // Zip archives
    "application/x-rar-compressed", // RAR archives
    "application/x-tar",  // TAR archives
    "application/javascript", // JavaScript files
    "application/typescript", // TypeScript files
    "text/plain", // Plain text (for code)
    "text/x-python", // Python files
    "text/x-java-source", // Java files
    "text/x-c++src", // C++ files
    "text/x-csrc", // C files
    "text/x-go", // Go files
    "text/x-ruby", // Ruby files 
    "*", // (BEST OPTION if you want EVERYTHING)
    "text/x-php" // PHP files
  ]
}: ContractReportCardProps) {
  const [progressNote, setProgressNote] = useState("");
  const [links, setLinks] = useState<LinkItem[]>([]);
  
  // Link Dialog State
  const [openLinkModal, setOpenLinkModal] = useState(false);
  const [linkName, setLinkName] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [linkErrors, setLinkErrors] = useState<{ title?: string; url?: string }>({});
  
  const [files, setFiles] = useState<FileItem[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [openHistoryDialog, setOpenHistoryDialog] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState<ProgressHistoryItem | null>(null);
  // Validation Functions
  const validateUrl = (url: string): boolean => {
    try {
      new URL(url.startsWith('http') ? url : `https://${url}`);
      return true;
    } catch {
      return false;
    }
  };

  const validateLinkTitle = (title: string): boolean => title.trim().length >= 3 && title.trim().length <= 100;

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    if (!file) return { valid: false, error: "No file selected" };

    // size check
    if (file.size > maxFileSize * 1024 * 1024) {
      return { valid: false, error: `File too large. Max ${maxFileSize}MB` };
    }

    const fileName = file.name.toLowerCase();
    const mime = file.type?.toLowerCase() || "";

    const isAllowed = allowedFileTypes.some((type) => {
      if (type === "*") return true;

      // 1. EXTENSIONS (.js, .ts, .cpp etc) ← MOST IMPORTANT FIX
      if (type.startsWith(".")) {
        return fileName.endsWith(type);
      }

      // 2. WILDCARD MIME (image/*, text/*)
      if (type.endsWith("/*")) {
        const base = type.replace("/*", "/");
        return mime.startsWith(base);
      }

      // 3. NORMAL MIME TYPES
      return mime === type;
    });

    if (!isAllowed) {
      return {
        valid: false,
        error: "File type not allowed",
      };
    }

    return { valid: true };
  };

  const validateLinksForm = useCallback(() => {
    const errors: { title?: string; url?: string } = {};
    
    if (!linkName.trim()) {
      errors.title = "Title is required";
    } else if (!validateLinkTitle(linkName)) {
      errors.title = "Title must be 3-100 characters";
    }
    
    if (!linkUrl.trim()) {
      errors.url = "URL is required";
    } else if (!validateUrl(linkUrl)) {
      errors.url = "Enter a valid URL (https://...)";
    }
    
    setLinkErrors(errors);
    return Object.keys(errors).length === 0;
  }, [linkName, linkUrl]);

  const handleUpload = (file?: File | null) => {
    if (!file) return;
    
    const validation = validateFile(file);
    if (!validation.valid) {
      toast.error(validation.error || "Invalid file");
      return;
    }

    const newFile: FileItem = {
      id: crypto.randomUUID(),
      name: file.name,
      type: file.type,
      url: URL.createObjectURL(file),
      file,
      size: file.size,
    };
    setFiles((prev) => [newFile, ...prev]);
    toast.success(`"${file.name}" added successfully`);
  };

  const addLink = () => {
    if (!validateLinksForm()) {
      toast.error("Please fix the errors above");
      return;
    }

    const newLink: LinkItem = {
      id: crypto.randomUUID(),
      title: linkName.trim(),
      url: linkUrl.trim().startsWith('http') ? linkUrl.trim() : `https://${linkUrl.trim()}`,
    };

    setLinks((prev) => [newLink, ...prev]);
    setLinkName("");
    setLinkUrl("");
    setLinkErrors({});
    setOpenLinkModal(false);
    toast.success("Link added successfully");
  };

  const removeLink = (id: string) => {
    setLinks((prev) => prev.filter((item) => item.id !== id));
    toast.success("Link removed");
  };

  const removeFile = (id?: string) => {
    if (!id) return;

    setFiles((prev) => prev.filter((item) => item.id !== id));
    toast.success("File removed");
  };

  const submitUpdate = async () => {
    if (!progressNote.trim()) {
      toast.error("Progress report is required");
      return;
    }

    if (progressNote.trim().length < 10) {
      toast.error("Report must be at least 10 characters");
      return;
    }

    try {
      await onSubmit({
        report: progressNote.trim(),
        links: links.map((link) => ({ title: link.title, url: link.url })),
        files: files.map((file) => file.file!).filter(Boolean) as File[],
      });
      setProgressNote("");
      setLinks([]);
      setFiles([]);
      toast.success("Progress update sent successfully!");
    } catch (error: any) {
      toast.error(error?.message || "Failed to send progress update");
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileMeta = (file: FileItem) => {
    const name = file.name.toLowerCase();
    const type = file.type?.toLowerCase() || "";

    /* ================= IMAGES ================= */
    if (type.startsWith("image/")) {
      return {
        label: "Image",
        icon: FileImage,
        iconClass: "text-blue-500",
      };
    }

    /* ================= PDF ================= */
    if (type === "application/pdf") {
      return {
        label: "PDF",
        icon: FileText,
        iconClass: "text-red-500",
      };
    }

    /* ================= ARCHIVES ================= */
    if (
      name.endsWith(".zip") ||
      name.endsWith(".rar") ||
      name.endsWith(".7z") ||
      name.endsWith(".tar") ||
      name.endsWith(".gz")
    ) {
      return {
        label: "Archive",
        icon: DownloadCloud,
        iconClass: "text-purple-500",
      };
    }

    /* ================= CODE FILES ================= */
    const codeExtensions = [
      // Web
      ".js", ".jsx", ".ts", ".tsx", ".html", ".css", ".scss",

      // Backend
      ".py", ".java", ".go", ".rb", ".php", ".cs",

      // Systems
      ".c", ".cpp", ".h", ".rs",

      // Config / Data
      ".json", ".yaml", ".yml", ".toml", ".env",

      // Scripts
      ".sh", ".bash",

      // Docs (code-like)
      ".md", ".txt"
    ];

    if (codeExtensions.some(ext => name.endsWith(ext))) {
      return {
        label: "Code",
        icon: FileCode,
        iconClass: "text-yellow-500",
      };
    }

    /* ================= TEXT FALLBACK ================= */
    if (type.startsWith("text/")) {
      return {
        label: "Text",
        icon: FileText,
        iconClass: "text-slate-500",
      };
    }

    /* ================= DEFAULT ================= */
    return {
      label: "File",
      icon: File,
      iconClass: "text-muted-foreground",
    };
  };

  return (
    <Card className="rounded-2xl shadow-sm border flex flex-col h-full">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg font-semibold tracking-tight">
              Contract Activity
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Track progress updates, shared links, and uploaded files
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-xs">
            {links.length + files.length} items
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 flex-1 flex flex-col">
        {/* Progress Report */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-muted-foreground">
            Progress update <span className="text-destructive">*</span>
          </Label>
          <Textarea
            placeholder="Write what has been completed, blocked, or changed... (min 10 chars)"
            value={progressNote}
            onChange={(e) => setProgressNote(e.target.value)}
            className="min-h-[110px] resize-none"
            rows={4}
          />
          <p className={`text-xs ${progressNote.length < 10 ? 'text-destructive' : 'text-muted-foreground'}`}>
            {progressNote.length}/500 characters
          </p>
        </div>

        {/* Links Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <LinkIcon className="w-4 h-4" />
              Shared links ({links.length})
            </Label>
            <Dialog open={openLinkModal} onOpenChange={setOpenLinkModal}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">+ Add link</Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add new link</DialogTitle>
                  <DialogDescription>
                    Attach external resources (GitHub, Drive, Notion, etc.)
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="link-title">Link title</Label>
                    <Input
                      id="link-title"
                      placeholder="e.g., Project documentation, Figma design, API reference"
                      value={linkName}
                      onChange={(e) => {
                        setLinkName(e.target.value);
                        if (linkErrors.title) setLinkErrors(prev => ({ ...prev, title: undefined }));
                      }}
                      className={linkErrors.title ? "border-destructive" : ""}
                    />
                    {linkErrors.title && (
                      <p className="text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {linkErrors.title}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="link-url">URL</Label>
                    <Input
                      id="link-url"
                      placeholder="Enter or paste a valid URL (https://example.com)"
                      value={linkUrl}
                      onChange={(e) => {
                        setLinkUrl(e.target.value);
                        if (linkErrors.url) setLinkErrors(prev => ({ ...prev, url: undefined }));
                      }}
                      className={linkErrors.url ? "border-destructive" : ""}
                    />
                    {linkErrors.url && (
                      <p className="text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {linkErrors.url}
                      </p>
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setOpenLinkModal(false);
                      setLinkErrors({});
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={addLink} disabled={submitting}>
                    Add link
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <ScrollArea className="h-28 pr-2">
            <div className="space-y-2">
              {links.length === 0 ? (
              <div className="text-center py-8 space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  No shared links yet
                </p>
                <p className="text-xs text-muted-foreground">
                  Add external resources like GitHub, Figma, Drive, or documentation links
                </p>
              </div>
              ) : (
                <AnimatePresence>
                  {links.map((l) => (
                    <motion.div
                      key={l.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.15 }}
                      className="group rounded-lg border bg-background p-3 hover:bg-muted/40 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">

                        {/* LEFT */}
                        <div className="min-w-0 flex-1 space-y-1">
                          <p className="text-sm font-medium truncate">
                            {l.title}
                          </p>

                          <a
                            href={l.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-muted-foreground hover:text-primary transition-colors break-all line-clamp-1"
                          >
                            {l.url}
                          </a>
                        </div>

                        {/* ACTION */}
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeLink(l.id!)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>

                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Files Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <FileText className="w-4 h-4" />
              Files ({files.length})
            </Label>
            <Badge variant="secondary" className="text-xs">
              Max {maxFileSize}MB
            </Badge>
          </div>

          {/* Enhanced Dropzone */}
          <div
            className={`group border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer relative overflow-hidden
              ${
                dragActive
                  ? "border-primary bg-primary/10 scale-[1.02] shadow-lg ring-2 ring-primary/20"
                  : "border-muted hover:border-primary/50 hover:bg-primary/5 hover:shadow-md"
              }`}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDragActive(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDragActive(false);
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDragActive(false);
              const droppedFiles = Array.from(e.dataTransfer.files);
              droppedFiles.forEach(handleUpload);
            }}
            onClick={() => document.getElementById("fileInput")?.click()}
          >
            <div className="relative z-10">
              
              {/* ICON SWITCH */}
              {dragActive ? (
                <DownloadCloud className="w-12 h-12 mx-auto mb-3 text-primary animate-bounce" />
              ) : (
                <UploadCloud className="w-12 h-12 mx-auto mb-3 text-muted-foreground group-hover:text-primary transition-colors" />
              )}

              <p
                className={`text-lg font-semibold transition-colors mb-1 ${
                  dragActive ? "text-primary" : "text-foreground group-hover:text-primary"
                }`}
              >
                {dragActive ? "Drop files here" : "Drop files here or click to upload"}
              </p>

              <p className="text-sm text-muted-foreground mb-4">
                PDF, images, documents up to {maxFileSize}MB supported
              </p>

              <Input
                id="fileInput"
                type="file"
                className="hidden"
                multiple
                accept={allowedFileTypes.join(",")}
                onChange={(e) => {
                  const droppedFiles = Array.from(e.target.files || []);
                  droppedFiles.forEach(handleUpload);
                }}
              />
            </div>
          </div>
        </div>

        {/* Files List */}
        <ScrollArea className="h-28 pr-2">
          <div className="space-y-2">
            {files.length === 0 ? (
              <div className="text-center py-8 space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  No files uploaded yet
                </p>
                <p className="text-xs text-muted-foreground">
                  Upload PDFs, images, or documents to attach them to this report
                </p>
              </div>
            ) : (
              <AnimatePresence>
                {files.map((f) => {
                  const meta = getFileMeta(f);
                  const Icon = meta.icon;

                  return (
                    <motion.div
                      key={f.id}
                      initial={{ opacity: 0, y: 10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.98 }}
                      className="group flex items-center justify-between gap-3 p-3 rounded-lg border bg-card hover:bg-muted/40 transition-all hover:shadow-sm"
                    >
                      {/* LEFT SIDE */}
                      <div className="flex items-center gap-3 min-w-0 flex-1">

                        {/* ICON */}
                        <div className="h-9 w-9 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
                          <Icon className={`w-5 h-5 ${meta.iconClass}`} />
                        </div>

                        {/* INFO */}
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate max-w-[180px]">
                            {f.name.length > 35
                              ? f.name.slice(0, 35) + "..."
                              : f.name}
                          </p>

                          <p className="text-xs text-muted-foreground">
                            {meta.label} • {formatFileSize(f.size!)}
                          </p>
                        </div>
                      </div>

                      {/* ACTIONS */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          onClick={() => window.open(f.url, "_blank")}
                        >
                          <LinkIcon className="w-4 h-4" />
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => removeFile(f.id!)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>
        </ScrollArea>

        {/* Submit Button */}
        <Button 
          disabled={submitting || !progressNote.trim() || progressNote.trim().length < 10} 
          className="w-full h-12 text-lg" 
          onClick={submitUpdate}
        >
          {submitting ? (
            <>
              <CheckCircle2 className="w-4 h-4 mr-2 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              Send Progress Update
              <FileText className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>

      {/* History Section - 100% WORKING */}
      {history.length > 0 && (
        <>
          <div className="space-y-4 pt-6 border-t">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Recent updates ({history.length})
              </h3>
              {/* ✅ ALWAYS RENDER DIALOG - Control with condition INSIDE */}
                  <Dialog open={openHistoryDialog} onOpenChange={setOpenHistoryDialog}>
                    <DialogContent className="w-[calc(100%-24px)] max-w-[640px] max-h-[90vh] flex flex-col p-0">

                      {selectedHistory && (
                        <div className="flex flex-col">

                          {/* HEADER */}
                        <DialogHeader className="px-6 pt-6">
                          <div className="space-y-2 w-full min-w-0">

                            {/* TITLE */}
                            <DialogTitle className="text-base flex items-center gap-2">
                              <Clock className="w-4 h-4 shrink-0" />
                              Progress Update
                            </DialogTitle>

                            {/* DATE + BADGE INLINE */}
                            <div className="flex items-center gap-2 flex-wrap">
                              
                              <DialogDescription className="text-xs">
                                {new Date(selectedHistory.createdAt).toLocaleString()}
                              </DialogDescription>

                              <Badge variant="secondary" className="text-xs">
                                {(selectedHistory.links?.length || 0) +
                                  (selectedHistory.files?.length || 0)}{" "}
                                items
                              </Badge>

                            </div>

                          </div>
                        </DialogHeader>

                          {/* BODY */}
                           <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">

                            {/* REPORT */}
                            <div className="space-y-2">
                              <p className="text-xs font-semibold uppercase text-muted-foreground">
                                Report
                              </p>

                              <p className="text-sm leading-relaxed text-foreground">
                                {selectedHistory.report}
                              </p>
                            </div>

                            {/* LINKS */}
                              {selectedHistory.links?.length ? (
                                <div className="space-y-3">
                                  {/* Header */}
                                  <div className="flex items-center gap-2">
                                    <Link2 className="w-4 h-4 text-muted-foreground" />
                                    <p className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">
                                      Links ({selectedHistory.links.length})
                                    </p>
                                  </div>

                                  {/* List */}
                                  <div className="space-y-2">
                                    {selectedHistory.links.map((link, i) => (
                                      <a
                                        key={i}
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="
                                          group flex items-start gap-3 rounded-lg border
                                           px-3 py-2
                                          transition-all duration-200 bg-card hover:bg-muted/40
                                           hover:shadow-sm
                                        "
                                      >
                                        {/* Icon */}
                                        <div className="mt-0.5">
                                          <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                        </div>

                                        {/* Content */}
                                        <div className="min-w-0 flex-1">
                                          <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                                            {link.title}
                                          </p>

                                          <p className="text-xs text-muted-foreground truncate">
                                            {link.url.replace(/^https?:\/\//, "")}
                                          </p>
                                        </div>
                                      </a>
                                    ))}
                                  </div>
                                </div>
                              ) : null}

                            {/* FILES - NOW FULLY WORKING */}
                            {selectedHistory.files?.length ? (
                              <div className="space-y-3">
                                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                  <FileText className="w-4 h-4 text-green-500" />
                                  Files ({selectedHistory.files.length})
                                </h4>
                                
                                <div className="space-y-2 max-h-48 overflow-y-auto -mx-1.5 px-1.5">
                                  {selectedHistory.files.map((file, i) => {
                                    const meta = getFileMeta({ 
                                      name: file.fileName, 
                                      type: file.mimeType || '',
                                      size: 1024 * 1024 // Fake size for meta
                                    } as any);
                                    const Icon = meta.icon;

                                    return (
                                      <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="group flex items-center justify-between gap-3 p-3 rounded-lg border bg-card hover:bg-muted/40 transition-all hover:shadow-sm cursor-default"
                                      >
                                        {/* LEFT SIDE - IDENTICAL TO UPLOAD */}
                                        <div className="flex items-center gap-3 min-w-0 flex-1">
                                          {/* ICON */}
                                          <div className="h-9 w-9 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
                                            <Icon className={`w-5 h-5 ${meta.iconClass}`} />
                                          </div>

                                          {/* INFO */}
                                          <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium truncate max-w-[180px]">
                                              {file.fileName.length > 35 
                                                ? file.fileName.slice(0, 35) + "..." 
                                                : file.fileName}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                              {meta.label} • {file.mimeType || 'Unknown'}
                                            </p>
                                          </div>
                                        </div>

                                        {/* ACTIONS - IDENTICAL TO UPLOAD + FULL FUNCTIONALITY */}
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                          {/* VIEW BUTTON - WORKS EXACTLY LIKE UPLOAD */}
                                          <Tooltip>
                                            <TooltipTrigger asChild>
                                              <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-8 w-8 p-0 hover:bg-accent"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  e.preventDefault();
                                                  // SAME LOGIC AS ContractCard openReportFile
                                                  const lowerName = file.fileName.toLowerCase();
                                                  const lowerUrl = file.fileUrl.toLowerCase();
                                                  const isPdf = file.mimeType === "application/pdf" || 
                                                              lowerName.endsWith(".pdf") || 
                                                              lowerUrl.includes(".pdf");

                                                  if (isPdf) {
                                                    window.open(
                                                      `https://docs.google.com/viewer?url=${encodeURIComponent(file.fileUrl)}&embedded=true`,
                                                      "_blank",
                                                      "noopener,noreferrer,width=800,height=600"
                                                    );
                                                  } else {
                                                    window.open(file.fileUrl, "_blank", "noopener,noreferrer");
                                                  }
                                                }}
                                              >
                                                <LinkIcon className="w-4 h-4" />
                                              </Button>
                                            </TooltipTrigger>
                                            <TooltipContent side="top">
                                              <p>View file</p>
                                            </TooltipContent>
                                          </Tooltip>

                                          {/* DOWNLOAD BUTTON - FULL FUNCTIONALITY */}
                                          <Tooltip>
                                            <TooltipTrigger asChild>
                                              <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                onClick={async (e) => {
                                                  e.stopPropagation();
                                                  e.preventDefault();
                                                  
                                                  try {
                                                    // SAME EXACT LOGIC AS ContractCard downloadReportFile
                                                    const response = await fetch(file.fileUrl);
                                                    if (!response.ok) throw new Error('Failed to fetch');
                                                    
                                                    const blob = await response.blob();
                                                    const url = URL.createObjectURL(blob);
                                                    const a = document.createElement("a");
                                                    a.href = url;
                                                    a.download = file.fileName;
                                                    document.body.appendChild(a);
                                                    a.click();
                                                    document.body.removeChild(a);
                                                    URL.revokeObjectURL(url);
                                                    toast.success(`Downloaded ${file.fileName}`);
                                                  } catch (error) {
                                                    // Fallback to direct download
                                                    window.open(file.fileUrl, "_blank", "noopener,noreferrer");
                                                    toast.warning("Opened in new tab (direct download not supported)");
                                                  }
                                                }}
                                              >
                                                <Download className="w-4 h-4" />
                                              </Button>
                                            </TooltipTrigger>
                                            <TooltipContent side="top">
                                              <p>Download</p>
                                            </TooltipContent>
                                          </Tooltip>
                                        </div>
                                      </motion.div>
                                    );
                                  })}
                                </div>
                              </div>
                            ) : null}
               
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
            </div>

            {/* Recent Updates Preview */}
              <ScrollArea className="h-28 pr-2">
                <div className="space-y-2">

                  {history.slice(0, 3).map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        setSelectedHistory(item);
                        setOpenHistoryDialog(true);
                      }}
                      className="group cursor-pointer rounded-lg border bg-background p-3 transition-colors hover:bg-muted/50 hover:border-primary/40"
                    >
                      
                      {/* TOP ROW */}
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-xs text-muted-foreground">
                          {new Date(item.createdAt).toLocaleString()}
                        </span>

                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          {item.links?.length ? (
                            <span className="flex items-center gap-1">
                              <Link2 className="w-3 h-3" />
                              {item.links.length}
                            </span>
                          ) : null}

                          {item.files?.length ? (
                            <span className="flex items-center gap-1">
                              <FileText className="w-3 h-3" />
                              {item.files.length}
                            </span>
                          ) : null}
                        </div>
                      </div>

                      {/* REPORT */}
                      <p className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
                        {item.report}
                      </p>

                    </div>
                  ))}

                </div>
              </ScrollArea>
          </div>
        </>
      )}
      </CardContent>
    </Card>
  );
}