
import { useState, useEffect } from "react";
import { db } from "@/integrations/db/client";
import { toast } from "sonner";

interface StorageVerificationResult {
  bucketExists: boolean;
  policiesExist: {
    select: boolean;
    insert: boolean;
    update: boolean;
    delete: boolean;
  };
  isAuthenticated: boolean;
  isBucketPublic: boolean;
  isLoading: boolean;
  error: string | null;
}

export function useVerifyStorage(bucketName: string = "project-images") {
  const [result, setResult] = useState<StorageVerificationResult>({
    bucketExists: false,
    policiesExist: {
      select: false,
      insert: false,
      update: false,
      delete: false
    },
    isAuthenticated: false,
    isBucketPublic: false,
    isLoading: true,
    error: null,
  });

  const verifyConfiguration = async () => {
    try {
      setResult(prev => ({ ...prev, isLoading: true, error: null }));
      // Проверка аутентификации пользователя
      const { data: { session } } = await db.auth.getSession();
      const isAuthenticated = !!session;
      // Проверка существования бакета
      const { data: buckets, error: bucketsError } = await db.storage.listBuckets();
      
      if (bucketsError) {
        console.error("Error listing buckets:", bucketsError);
        setResult(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: `Не удалось получить список бакетов: ${bucketsError.message}` 
        }));
        return;
      }
      
      const bucket = buckets?.find(b => b.name === bucketName);
      const bucketExists = !!bucket;
      const isBucketPublic = bucket?.public || false;
      // Проверка возможности загрузки и политик RLS
      let policiesInfo = {
        select: false,
        insert: false,
        update: false,
        delete: false
      };
      
      if (bucketExists) {
        try {
          // Проверяем политики загрузки путем тестовой загрузки
          const testFilePath = `test-policy-check-${Date.now()}.txt`;
          const testData = new Blob(["test"], { type: "text/plain" });
          
          const { data: uploadData, error: uploadError } = await db.storage
            .from(bucketName)
            .upload(testFilePath, testData, { upsert: true });
            
          if (!uploadError) {
            policiesInfo.insert = true;
            
            // Если загрузка успешна, проверяем остальные операции
            
            // Тестируем получение (SELECT)
            const { data: getFile, error: getError } = await db.storage
              .from(bucketName)
              .download(testFilePath);
              
            policiesInfo.select = !getError;
            
            // Тестируем обновление (UPDATE) путем повторной загрузки
            const { error: updateError } = await db.storage
              .from(bucketName)
              .upload(testFilePath, testData, { upsert: true });
              
            policiesInfo.update = !updateError;
            
            // Тестируем удаление (DELETE)
            const { error: deleteError } = await db.storage
              .from(bucketName)
              .remove([testFilePath]);
              
            policiesInfo.delete = !deleteError;
          } else if (uploadError?.message?.includes('permission')) {
            // Permission denied - can't upload
          }
        } catch (testError: any) {
          console.error("Error during policy testing:", testError);
        }
      }

      setResult({
        bucketExists,
        policiesExist: policiesInfo,
        isAuthenticated,
        isBucketPublic,
        isLoading: false,
        error: null
      });
    } catch (error: any) {
      console.error("Storage verification error:", error);
      setResult(prev => ({
        ...prev,
        isLoading: false,
        error: `Ошибка проверки хранилища: ${error.message || 'Неизвестная ошибка'}`
      }));
    }
  };

  useEffect(() => {
    verifyConfiguration();
  }, [bucketName]);

  return {
    ...result,
    retry: verifyConfiguration
  };
}
