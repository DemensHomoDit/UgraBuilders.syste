import React, { useState, useEffect, useCallback } from "react";
import { User } from "@/services/types/authTypes";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  Download,
  FolderOpen,
  RefreshCw,
  FileImage,
  File,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import fileService, { ClientFile } from "@/services/fileService";

interface ClientDocumentsProps {
  user: User;
}

const API_BASE = import.meta.env.VITE_API_BASE ?? "";

function getFileIcon(mimeType?: string) {
  if (!mimeType) return <File className="h-5 w-5 text-muted-foreground" />;
  if (mimeType.startsWith("image/"))
    return <FileImage className="h-5 w-5 text-blue-500" />;
  if (mimeType === "application/pdf")
    return <FileText className="h-5 w-5 text-red-500" />;
  return <File className="h-5 w-5 text-muted-foreground" />;
}

function formatSize(bytes?: number): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} Б`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} КБ`;
  return `${(bytes / 1024 / 1024).toFixed(1)} МБ`;
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function FileCard({ file }: { file: ClientFile }) {
  const url = `${API_BASE}${file.url}`;

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="flex items-center gap-4 p-4 rounded-xl border bg-card hover:shadow-sm transition-all">
      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
        {getFileIcon(file.mime_type)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{file.name}</p>
        <div className="flex flex-wrap items-center gap-2 mt-0.5">
          <span className="text-xs text-muted-foreground">
            {formatDate(file.created_at)}
          </span>
          {file.file_size && (
            <span className="text-xs text-muted-foreground">
              · {formatSize(file.file_size)}
            </span>
          )}
          {file.uploaded_by_name && (
            <span className="text-xs text-muted-foreground">
              · {file.uploaded_by_name}
            </span>
          )}
        </div>
      </div>
      <Button
        size="sm"
        variant="outline"
        onClick={handleDownload}
        className="flex-shrink-0 gap-1.5"
      >
        <Download className="h-3.5 w-3.5" />
        Скачать
      </Button>
    </div>
  );
}

function FileList({
  files,
  loading,
  emptyText,
}: {
  files: ClientFile[];
  loading: boolean;
  emptyText: string;
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary/50 mr-2" />
        <span className="text-sm text-muted-foreground">Загрузка...</span>
      </div>
    );
  }
  if (!files.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <FolderOpen className="h-10 w-10 text-muted-foreground/30 mb-3" />
        <p className="text-sm text-muted-foreground">{emptyText}</p>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {files.map((f) => (
        <FileCard key={f.id} file={f} />
      ))}
    </div>
  );
}

const ClientDocuments: React.FC<ClientDocumentsProps> = ({ user }) => {
  const [documents, setDocuments] = useState<ClientFile[]>([]);
  const [contracts, setContracts] = useState<ClientFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("documents");

  const loadFiles = useCallback(async () => {
    setLoading(true);
    try {
      const [docs, conts] = await Promise.all([
        fileService.getClientFiles(user.id, "documents"),
        fileService.getClientFiles(user.id, "contracts"),
      ]);
      setDocuments(docs);
      setContracts(conts);
    } catch {
      toast.error("Не удалось загрузить файлы");
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  const total = documents.length + contracts.length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FolderOpen className="h-5 w-5 text-primary" />
                Документы
              </CardTitle>
              <CardDescription className="mt-1">
                Файлы, предоставленные вашим менеджером
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={loadFiles}
              disabled={loading}
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
            </Button>
          </div>
        </CardHeader>
        {total > 0 && (
          <CardContent className="pb-2 pt-0">
            <div className="flex gap-3">
              <div className="rounded-lg border bg-muted/30 px-4 py-2 text-center min-w-[70px]">
                <p className="text-xl font-bold text-primary">
                  {documents.length}
                </p>
                <p className="text-xs text-muted-foreground">Документов</p>
              </div>
              <div className="rounded-lg border bg-muted/30 px-4 py-2 text-center min-w-[70px]">
                <p className="text-xl font-bold text-primary">
                  {contracts.length}
                </p>
                <p className="text-xs text-muted-foreground">Договоров</p>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="documents">
            Документы{" "}
            {documents.length > 0 && (
              <Badge variant="secondary" className="ml-1.5 text-xs">
                {documents.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="contracts">
            Договоры{" "}
            {contracts.length > 0 && (
              <Badge variant="secondary" className="ml-1.5 text-xs">
                {contracts.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="documents" className="mt-4">
          <FileList
            files={documents}
            loading={loading}
            emptyText="Документы ещё не загружены менеджером"
          />
        </TabsContent>
        <TabsContent value="contracts" className="mt-4">
          <FileList
            files={contracts}
            loading={loading}
            emptyText="Договоры ещё не загружены менеджером"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClientDocuments;
