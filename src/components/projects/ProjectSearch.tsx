
import { Search } from "lucide-react";

interface ProjectSearchProps {
  searchQuery: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  resultsCount: number;
}

const ProjectSearch = ({ searchQuery, onSearchChange, resultsCount }: ProjectSearchProps) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
      <div className="relative w-full md:w-auto md:flex-grow max-w-md">
        <input
          type="text"
          placeholder="Поиск проектов..."
          value={searchQuery}
          onChange={onSearchChange}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
      </div>
      
      <span className="text-muted-foreground text-sm">
        Найдено: {resultsCount} проектов
      </span>
    </div>
  );
};

export default ProjectSearch;
