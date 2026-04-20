
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface StorageVerificationProps {
  bucketName?: string;
}

const StorageVerification: React.FC<StorageVerificationProps> = () => {
  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>Хранилище изображений</CardTitle>
        <CardDescription>
          Информация о настройках хранилища
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4 mr-2" />
          <AlertTitle>Система загрузки изображений отключена</AlertTitle>
          <AlertDescription>
            Функционал загрузки изображений был полностью удален из приложения.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default StorageVerification;
