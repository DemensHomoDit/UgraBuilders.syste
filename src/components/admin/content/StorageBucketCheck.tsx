
import React, { useEffect, useState } from "react";
import { db } from "@/integrations/db/client";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Check, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface StorageBucketCheckProps {
  bucketName: string;
  onStatusChange?: (isValid: boolean) => void;
}

const StorageBucketCheck: React.FC<StorageBucketCheckProps> = ({
  bucketName,
  onStatusChange
}) => {
  const [isChecking, setIsChecking] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkBucket = async () => {
    setIsChecking(true);
    setError(null);
    
    try {
      // Используем listBuckets вместо rpc для более надежной проверки
      const { data: buckets, error: bucketsError } = await db.storage.listBuckets();
      
      if (bucketsError) {
        console.error("Ошибка при получении списка бакетов:", bucketsError);
        throw bucketsError;
      }
      
      // Проверяем наличие нужного бакета в списке
      const bucketExists = buckets?.some(b => b.name === bucketName);
      
      if (bucketExists) {
        setIsValid(true);
        if (onStatusChange) onStatusChange(true);
        toast.success("Хранилище проверено", {
          description: `Бакет ${bucketName} доступен и готов к использованию`
        });
      } else {
        // Пробуем создать бакет через нашу функцию
        const { data, error: createError } = await db.rpc('create_project_images_bucket');
        
        if (createError) {
          console.error("Ошибка при создании бакета:", createError);
          throw createError;
        }
        
        // Если создание прошло успешно
        if (data === true) {
          setIsValid(true);
          if (onStatusChange) onStatusChange(true);
          toast.success("Хранилище создано", {
            description: `Бакет ${bucketName} создан и готов к использованию`
          });
        } else {
          setIsValid(false);
          if (onStatusChange) onStatusChange(false);
          setError("Бакет не найден и не может быть создан");
        }
      }
    } catch (error: any) {
      console.error("Ошибка проверки бакета:", error);
      setIsValid(false);
      if (onStatusChange) onStatusChange(false);
      setError(error.message || "Не удалось проверить бакет");
    } finally {
      setIsChecking(false);
    }
  };

  // Выполняем проверку при монтировании компонента
  useEffect(() => {
    checkBucket();
  }, [bucketName]);

  if (isValid === true) {
    return (
      <Alert variant="success" className="bg-green-50 border-green-200">
        <Check className="h-4 w-4 text-green-600 mr-2" />
        <AlertTitle className="text-green-700">Хранилище доступно</AlertTitle>
        <AlertDescription className="text-green-600">
          Бакет {bucketName} готов к использованию
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert variant={isValid === false ? "destructive" : "default"} className="mb-4">
      <AlertCircle className="h-4 w-4 mr-2" />
      <AlertTitle>
        {isValid === null ? "Проверка хранилища..." : "Проблема с хранилищем"}
      </AlertTitle>
      <AlertDescription className="mt-2">
        {error ? (
          <div className="text-sm whitespace-pre-wrap">
            <p>{error}</p>
            <p className="mt-2">
              Проверьте, правильно ли настроен доступ к хранилищу в Supabase.
            </p>
          </div>
        ) : (
          <p>Проверка доступа к бакету {bucketName}</p>
        )}
        
        <Button 
          onClick={checkBucket} 
          disabled={isChecking} 
          variant="outline" 
          size="sm" 
          className="mt-2"
        >
          {isChecking ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Проверка...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Проверить снова
            </>
          )}
        </Button>
      </AlertDescription>
    </Alert>
  );
};

export default StorageBucketCheck;
