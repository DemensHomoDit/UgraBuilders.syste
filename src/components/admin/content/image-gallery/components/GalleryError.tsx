
import React from "react";
import { AlertTriangle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface GalleryErrorProps {
  message: string;
  onRetry?: () => void;
}

const GalleryError: React.FC<GalleryErrorProps> = ({ message, onRetry }) => {
  return (
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4 mr-2" />
      <AlertTitle>Ошибка загрузки галереи</AlertTitle>
      <AlertDescription className="mt-2">
        <p>{message}</p>
        {onRetry && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRetry} 
            className="mt-2"
          >
            Повторить
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
};

export default GalleryError;
