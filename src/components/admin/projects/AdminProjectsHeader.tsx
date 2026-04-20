
import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PlusCircle, FileDown, ChevronDown } from "lucide-react";

interface AdminProjectsHeaderProps {
  onAddProject: () => void;
  onExport: (format: "csv" | "excel" | "pdf") => void;
  isExporting?: boolean;
}

const AdminProjectsHeader: React.FC<AdminProjectsHeaderProps> = ({
  onAddProject,
  onExport,
  isExporting = false
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <h1 className="text-2xl font-semibold">Управление проектами</h1>

      <div className="flex items-center gap-2 self-end sm:self-auto">
        <DropdownMenu>
          <DropdownMenuTrigger asChild disabled={isExporting}>
            <Button variant="outline" className="flex items-center gap-1">
              {isExporting ? (
                <>
                  <span className="animate-spin mr-1">⏳</span> Экспорт...
                </>
              ) : (
                <>
                  <FileDown className="h-4 w-4 mr-1" /> Экспорт <ChevronDown className="h-4 w-4 ml-1" />
                </>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onExport("csv")}>
              <span>CSV</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onExport("excel")}>
              <span>Excel</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onExport("pdf")}>
              <span>PDF</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button onClick={onAddProject}>
          <PlusCircle className="h-4 w-4 mr-1" /> Новый проект
        </Button>
      </div>
    </div>
  );
};

export default AdminProjectsHeader;
