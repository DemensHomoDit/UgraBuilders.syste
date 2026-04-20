
import { useState, useCallback } from 'react';

export const useProjectTags = (initialTags?: string[]) => {
  const [tags, setTags] = useState<string[]>(initialTags || []);

  const handleAddTag = useCallback((tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags(prevTags => [...prevTags, trimmedTag]);
    }
  }, [tags]);

  const handleRemoveTag = useCallback((tagToRemove: string) => {
    setTags(prevTags => prevTags.filter(tag => tag !== tagToRemove));
  }, []);

  return {
    tags,
    handleAddTag,
    handleRemoveTag,
  };
};
