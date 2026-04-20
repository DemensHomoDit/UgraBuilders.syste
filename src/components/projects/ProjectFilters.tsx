import { Filter } from "lucide-react";
import { useState, useEffect } from "react";
import { HOUSE_STYLES } from "@/components/admin/content/project-form/constants";

export type FilterCriteria = {
  styles: string[];
  minArea?: number;
  maxArea?: number;
  minPrice?: number;
  maxPrice?: number;
  floors: number[];
};

interface ProjectFiltersProps {
  onFilterChange: (filters: FilterCriteria) => void;
  totalCount: number;
  hideStyleFilters?: boolean;
  hideBedroomFilters?: boolean;
}

const ProjectFilters = ({ 
  onFilterChange, 
  totalCount, 
  hideStyleFilters = false,
  hideBedroomFilters = false 
}: ProjectFiltersProps) => {
  const [styles, setStyles] = useState<string[]>([]);
  const [floors, setFloors] = useState<number[]>([]);
  const [minArea, setMinArea] = useState<string>("");
  const [maxArea, setMaxArea] = useState<string>("");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");

  const handleStyleChange = (value: string) => {
    setStyles(prev => 
      prev.includes(value)
        ? prev.filter(s => s !== value)
        : [...prev, value]
    );
  };
  
  const handleFloorChange = (value: number) => {
    setFloors(prev => 
      prev.includes(value)
        ? prev.filter(f => f !== value)
        : [...prev, value]
    );
  };

  const applyFilters = () => {
    const filters: FilterCriteria = {
      styles,
      floors,
      minArea: minArea ? Number(minArea) : undefined,
      maxArea: maxArea ? Number(maxArea) : undefined,
      minPrice: minPrice ? Number(minPrice) * 1000000 : undefined,
      maxPrice: maxPrice ? Number(maxPrice) * 1000000 : undefined
    };
    
    onFilterChange(filters);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 sticky top-24">
      <h3 className="font-bold text-lg text-primary mb-4 flex items-center">
        <Filter className="mr-2 h-5 w-5" />
        Фильтры
      </h3>
      
      <div className="mb-6">
        <h4 className="font-semibold text-gray-800 mb-3">Площадь, м²</h4>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="от"
            value={minArea}
            onChange={(e) => setMinArea(e.target.value.replace(/[^\d]/g, ''))}
            className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary/50 text-sm"
          />
          <span className="text-gray-500 self-center">—</span>
          <input
            type="text"
            placeholder="до"
            value={maxArea}
            onChange={(e) => setMaxArea(e.target.value.replace(/[^\d]/g, ''))}
            className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary/50 text-sm"
          />
        </div>
      </div>
      
      {!hideStyleFilters && (
        <div className="mb-6">
          <h4 className="font-semibold text-gray-800 mb-3">Стиль дома</h4>
          <div className="flex flex-wrap gap-2">
            {HOUSE_STYLES.map((style) => (
              <button
                key={style.value}
                onClick={() => handleStyleChange(style.value)}
                className={`px-3 py-1.5 rounded-md text-sm border ${
                  styles.includes(style.value)
                    ? "bg-primary text-white border-primary"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                {style.label}
              </button>
            ))}
          </div>
        </div>
      )}
      
      <div className="mb-6">
        <h4 className="font-semibold text-gray-800 mb-3">Этажность</h4>
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4].map((floor) => (
            <button
              key={floor}
              onClick={() => handleFloorChange(floor)}
              className={`px-3 py-1 rounded-md text-sm border ${
                floors.includes(floor)
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              {floor}
            </button>
          ))}
        </div>
      </div>
      
      {!hideBedroomFilters && (
        <div className="mb-6">
          <h4 className="font-semibold text-gray-800 mb-3">Бюджет, млн ₽</h4>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="от"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value.replace(/[^\d.]/g, ''))}
              className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary/50 text-sm"
            />
            <span className="text-gray-500 self-center">—</span>
            <input
              type="text"
              placeholder="до"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value.replace(/[^\d.]/g, ''))}
              className="w-full px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary/50 text-sm"
            />
          </div>
        </div>
      )}
      
      <button 
        onClick={applyFilters}
        className="w-full bg-primary text-white py-2 rounded-full hover:bg-primary/90 transition-colors text-sm"
      >
        Применить фильтры
      </button>
    </div>
  );
};

export default ProjectFilters;
