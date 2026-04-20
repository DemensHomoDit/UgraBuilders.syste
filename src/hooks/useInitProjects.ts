
import { useState } from "react";

export function useInitProjects() {
  const [isInitialized, setIsInitialized] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // No longer need storage initialization - images are not used
  
  return { isInitialized, isLoading, error };
}
