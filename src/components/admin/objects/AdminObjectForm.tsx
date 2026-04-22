import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ObjectMainForm from "./ObjectMainForm";
import ObjectGalleryManager from "./ObjectGalleryManager";
import ObjectReviewForm from "./ObjectReviewForm";

interface AdminObjectFormProps {
  objectId?: string;
}

const AdminObjectForm = ({ objectId: initialObjectId }: AdminObjectFormProps) => {
  const navigate = useNavigate();
  const [savedObjectId, setSavedObjectId] = useState<string | undefined>(initialObjectId);
  const [activeTab, setActiveTab] = useState("main");

  const isCreateMode = !savedObjectId;

  const handleSaved = (id: string) => {
    setSavedObjectId(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/account/objects")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Назад
        </Button>
        <h1 className="text-2xl font-semibold">
          {isCreateMode ? "Создать объект" : "Редактировать объект"}
        </h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="main">Основное</TabsTrigger>
          <TabsTrigger value="photos" disabled={!savedObjectId}>
            Фотографии
          </TabsTrigger>
          <TabsTrigger value="review" disabled={!savedObjectId}>
            Отзыв клиента
          </TabsTrigger>
        </TabsList>

        <TabsContent value="main" className="mt-6">
          <ObjectMainForm objectId={savedObjectId} onSaved={handleSaved} />
        </TabsContent>

        {savedObjectId && (
          <>
            <TabsContent value="photos" className="mt-6">
              <ObjectGalleryManager objectId={savedObjectId} />
            </TabsContent>
            <TabsContent value="review" className="mt-6">
              <ObjectReviewForm objectId={savedObjectId} />
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
};

export default AdminObjectForm;
