
interface ProjectSortingProps {
  sortOption: string;
  onSortChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

const ProjectSorting = ({ sortOption, onSortChange }: ProjectSortingProps) => {
  return (
    <div className="w-full md:w-auto">
      <select 
        className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50"
        value={sortOption}
        onChange={onSortChange}
      >
        <option value="popularity">По популярности</option>
        <option value="price-asc">По цене (возр.)</option>
        <option value="price-desc">По цене (убыв.)</option>
        <option value="area-asc">По площади (возр.)</option>
        <option value="area-desc">По площади (убыв.)</option>
      </select>
    </div>
  );
};

export default ProjectSorting;
