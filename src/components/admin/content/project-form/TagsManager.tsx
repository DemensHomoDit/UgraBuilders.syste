
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { TagsManagerProps } from "./types";

const TagsManager: React.FC<TagsManagerProps> = ({ tags, onAddTag, onRemoveTag }) => {
  const [inputTag, setInputTag] = useState("");

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedTag = inputTag.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      onAddTag(trimmedTag);
      setInputTag("");
    }
  };

  return (
    <div className="space-y-4">
      {/* Заменяем form на div чтобы избежать вложенности форм */}
      <div className="flex space-x-2">
        <Input
          type="text"
          value={inputTag}
          onChange={(e) => setInputTag(e.target.value)}
          placeholder="Добавить тег"
          className="flex-grow"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAddTag(e);
            }
          }}
        />
        <Button 
          type="button" 
          variant="secondary" 
          disabled={!inputTag.trim()}
          onClick={handleAddTag}
        >
          Добавить
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <div
            key={tag}
            className="flex items-center gap-1 px-3 py-1 text-sm bg-secondary text-secondary-foreground rounded-full"
          >
            <span>{tag}</span>
            <button
              type="button"
              onClick={() => onRemoveTag(tag)}
              className="text-secondary-foreground/70 hover:text-secondary-foreground"
            >
              <X size={14} />
            </button>
          </div>
        ))}
        {tags.length === 0 && (
          <div className="text-sm text-muted-foreground">Нет тегов</div>
        )}
      </div>
    </div>
  );
};

export default TagsManager;
