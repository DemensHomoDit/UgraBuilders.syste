import React from "react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, Grid, List, SlidersHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface ProjectTabControlsProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  handleSearch: (e: React.FormEvent) => void;
  viewMode: "grid" | "list";
  setViewMode: (mode: "grid" | "list") => void;
  counts?: {
    published: number;
    drafts: number;
    archived: number;
  };
}

const ProjectTabControls: React.FC<ProjectTabControlsProps> = ({
  searchQuery,
  setSearchQuery,
  handleSearch,
  viewMode,
  setViewMode,
  counts = { published: 24, drafts: 8, archived: 3 }
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
      <TabsList>
        <TabsTrigger value="all">Все проекты</TabsTrigger>
        <TabsTrigger value="published">Опубликованные</TabsTrigger>
        <TabsTrigger value="drafts">Черновики</TabsTrigger>
        <TabsTrigger value="archived">Архив</TabsTrigger>
      </TabsList>
      
      <div className="flex space-x-2 w-full sm:w-auto">
        <form onSubmit={handleSearch} className="relative flex-grow">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Поиск проектов..."
            className="pl-8 h-9 w-full sm:w-[200px] md:w-[300px]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-9 px-2 sm:px-3">
              <Filter className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Фильтры</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem>По дате (новые)</DropdownMenuItem>
            <DropdownMenuItem>По дате (старые)</DropdownMenuItem>
            <DropdownMenuItem>По названию (А-Я)</DropdownMenuItem>
            <DropdownMenuItem>По названию (Я-А)</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Расширенный фильтр
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <div className="flex bg-muted rounded-md p-0.5">
          <Button
            variant={viewMode === "grid" ? "default" : "ghost"}
            size="sm"
            className="h-8 px-2 rounded-sm"
            onClick={() => setViewMode("grid")}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "ghost"}
            size="sm"
            className="h-8 px-2 rounded-sm"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProjectTabControls;
