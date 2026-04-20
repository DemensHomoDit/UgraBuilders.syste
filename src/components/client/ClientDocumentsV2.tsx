import React, { useState, useEffect, useMemo } from "react";
import { User } from "@/services/types/authTypes";
import { db } from "@/integrations/db/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import {
  Search,
  FileText,
  Download,
  Calendar,
  DollarSign,
  Filter,
  X,
  Eye,
  FileSignature,
  Receipt,
  FileCheck,
  File,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ClientDocumentsV2Props {
  user: User;
}

interface Document {
  id: string;
  name: string;
  type: "contract" | "payment" | "approval" | "invoice" | "other";
  url: string;
  file_size?: number;
  created_at: string;
  metadata?: {
    amount?: number;
    stage?: string;
    description?: string;
    signed?: boolean;
    signDate?: string;
  };
}

const TYPE_ICONS = {
  contract: FileSignature,
  payment: DollarSign,
  approval: FileCheck,
  invoice: Receipt,
  other: File,
};

const TYPE_COLORS = {
  contract: "bg-purple-100 text-purple-700",
  payment: "bg-green-100 text-green-700",
  approval: "bg-blue-100 text-blue-700",
  invoice: "bg-orange-100 text-orange-700",
  other: "bg-gray-100 text-gray-700",
};

const TYPE_LABELS = {
  contract: "Договор",
  payment: "Оплата",
  approval: "Согласование",
  invoice: "Счёт",
  other: "Документ",
};

const ClientDocumentsV2: React.FC<ClientDocumentsV2Props> = ({ user }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const { data, error } = await db
        .from("client_documents")
        .select("*")
        .eq("client_id", user.id)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setDocuments(data as Document[]);
      }
    } catch (err) {
      console.error("Error loading documents:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // AI-like search with multiple criteria
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      // Type filter
      if (filterType !== "all" && doc.type !== filterType) return false;

      // Date filters
      if (filterDateFrom && new Date(doc.created_at) < new Date(filterDateFrom))
        return false;
      if (filterDateTo && new Date(doc.created_at) > new Date(filterDateTo))
        return false;

      // Search query (AI-like fuzzy search)
      if (!searchQuery.trim()) return true;

      const query = searchQuery.toLowerCase();
      const searchFields = [
        doc.name,
        doc.metadata?.description,
        doc.metadata?.stage,
        doc.type,
        doc.metadata?.amount?.toString(),
        new Date(doc.created_at).toLocaleDateString("ru-RU"),
      ].filter(Boolean);

      return searchFields.some((field) =>
        field?.toLowerCase().includes(query)
      );
    });
  }, [documents, searchQuery, filterType, filterDateFrom, filterDateTo]);

  // Group by month for timeline view
  const groupedDocuments = useMemo(() => {
    const groups: Record<string, Document[]> = {};
    filteredDocuments.forEach((doc) => {
      const month = new Date(doc.created_at).toLocaleString("ru-RU", {
        month: "long",
        year: "numeric",
      });
      if (!groups[month]) groups[month] = [];
      groups[month].push(doc);
    });
    return groups;
  }, [filteredDocuments]);

  const handleDownload = async (doc: Document) => {
    try {
      window.open(doc.url, "_blank");
      toast({ title: "Скачивание началось" });
    } catch (err: any) {
      toast({
        title: "Ошибка скачивания",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setFilterType("all");
    setFilterDateFrom("");
    setFilterDateTo("");
  };

  const hasActiveFilters =
    searchQuery || filterType !== "all" || filterDateFrom || filterDateTo;

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск по названию, сумме, дате, типу..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button
              variant="outline"
              className={cn(showFilters && "bg-muted")}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-1" />
              Фильтры
              {hasActiveFilters && (
                <Badge className="ml-1 bg-primary text-primary-foreground">!</Badge>
              )}
            </Button>
          </div>

          {/* Filters panel */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">
                  Тип документа
                </label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Все типы" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все типы</SelectItem>
                    <SelectItem value="contract">Договоры</SelectItem>
                    <SelectItem value="payment">Оплаты</SelectItem>
                    <SelectItem value="approval">Согласования</SelectItem>
                    <SelectItem value="invoice">Счета</SelectItem>
                    <SelectItem value="other">Прочее</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">
                  Дата с
                </label>
                <Input
                  type="date"
                  value={filterDateFrom}
                  onChange={(e) => setFilterDateFrom(e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">
                  Дата по
                </label>
                <Input
                  type="date"
                  value={filterDateTo}
                  onChange={(e) => setFilterDateTo(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Active filters badges */}
          {hasActiveFilters && (
            <div className="mt-4 flex flex-wrap gap-2">
              {searchQuery && (
                <Badge variant="secondary" className="gap-1">
                  Поиск: {searchQuery}
                  <button onClick={() => setSearchQuery("")}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filterType !== "all" && (
                <Badge variant="secondary" className="gap-1">
                  {TYPE_LABELS[filterType as keyof typeof TYPE_LABELS]}
                  <button onClick={() => setFilterType("all")}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filterDateFrom && (
                <Badge variant="secondary" className="gap-1">
                  С: {new Date(filterDateFrom).toLocaleDateString("ru-RU")}
                  <button onClick={() => setFilterDateFrom("")}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filterDateTo && (
                <Badge variant="secondary" className="gap-1">
                  По: {new Date(filterDateTo).toLocaleDateString("ru-RU")}
                  <button onClick={() => setFilterDateTo("")}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              <Button variant="ghost" size="sm" className="h-6" onClick={clearFilters}>
                Сбросить всё
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        <Card className="p-3">
          <p className="text-xs text-muted-foreground">Всего</p>
          <p className="text-xl font-bold">{documents.length}</p>
        </Card>
        <Card className="p-3">
          <p className="text-xs text-muted-foreground">Договоры</p>
          <p className="text-xl font-bold">
            {documents.filter((d) => d.type === "contract").length}
          </p>
        </Card>
        <Card className="p-3">
          <p className="text-xs text-muted-foreground">Оплаты</p>
          <p className="text-xl font-bold text-green-600">
            {documents.filter((d) => d.type === "payment").length}
          </p>
        </Card>
        <Card className="p-3">
          <p className="text-xs text-muted-foreground">На согласовании</p>
          <p className="text-xl font-bold text-amber-600">
            {documents.filter((d) => d.type === "approval" && !d.metadata?.signed).length}
          </p>
        </Card>
        <Card className="p-3">
          <p className="text-xs text-muted-foreground">Подписано</p>
          <p className="text-xl font-bold text-blue-600">
            {documents.filter((d) => d.metadata?.signed).length}
          </p>
        </Card>
      </div>

      {/* Documents list by month */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredDocuments.length === 0 ? (
        <Card className="p-12 text-center">
          <FileText className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">
            {hasActiveFilters ? "Документы не найдены" : "Документов пока нет"}
          </p>
          {hasActiveFilters && (
            <Button variant="outline" className="mt-4" onClick={clearFilters}>
              Сбросить фильтры
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedDocuments).map(([month, docs]) => (
            <div key={month}>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3 sticky top-0 bg-background py-2">
                {month}
              </h3>
              <div className="space-y-2">
                {docs.map((doc) => {
                  const Icon = TYPE_ICONS[doc.type];
                  return (
                    <Card
                      key={doc.id}
                      className={cn(
                        "overflow-hidden cursor-pointer transition-all hover:shadow-md",
                        selectedDoc?.id === doc.id && "ring-2 ring-primary"
                      )}
                      onClick={() => setSelectedDoc(doc)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div
                            className={cn(
                              "w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0",
                              TYPE_COLORS[doc.type]
                            )}
                          >
                            <Icon className="h-6 w-6" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h4 className="font-medium truncate">{doc.name}</h4>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(doc.created_at).toLocaleDateString("ru-RU", {
                                    day: "numeric",
                                    month: "long",
                                  })}
                                </p>
                              </div>
                              <div className="flex items-center gap-1 flex-shrink-0">
                                {doc.metadata?.amount && (
                                  <Badge variant="outline" className="text-xs">
                                    {doc.metadata.amount.toLocaleString("ru-RU")} ₽
                                  </Badge>
                                )}
                                {doc.metadata?.signed && (
                                  <Badge className="bg-blue-100 text-blue-700 text-xs">
                                    <FileCheck className="h-3 w-3 mr-1" />
                                    Подписано
                                  </Badge>
                                )}
                              </div>
                            </div>

                            {doc.metadata?.description && (
                              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                                {doc.metadata.description}
                              </p>
                            )}

                            <div className="flex items-center gap-2 mt-3">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(doc.url, "_blank");
                                }}
                              >
                                <Eye className="h-3.5 w-3.5 mr-1" />
                                Просмотр
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDownload(doc);
                                }}
                              >
                                <Download className="h-3.5 w-3.5 mr-1" />
                                Скачать
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Document preview modal could go here */}
    </div>
  );
};

export default ClientDocumentsV2;
