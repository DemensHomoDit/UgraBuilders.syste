
import React from "react";
import { Button } from "@/components/ui/button";
import { Project } from "@/types/project";
import ProjectDetails from "../ProjectDetails";
import ProjectSpecifications from "../ProjectSpecifications";
import TagsManager from "../TagsManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import PublishControl from "./PublishControl";

interface ProjectFormLayoutProps {
  formHook: any;
  isMountedRef: React.MutableRefObject<boolean>;
  project?: Project;
}

export const ProjectFormLayout: React.FC<ProjectFormLayoutProps> = ({ 
  formHook, 
  isMountedRef,
  project 
}) => {
  const [activeTab, setActiveTab] = React.useState("details");
  
  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="details">Основная информация</TabsTrigger>
          <TabsTrigger value="specifications">Характеристики</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details">
          <Card>
            <CardContent className="pt-6 space-y-6">
              <ProjectDetails 
                formData={formHook.formData as Project}
                handleChange={formHook.handleChange}
                handleCoverImageUploaded={formHook.handleCoverImageUploaded}
                categories={formHook.categories}
                handleSelectChange={formHook.handleSelectChange}
                isEditMode={formHook.isEditMode}
              />
              
              <div className="mt-6 space-y-4">
                <h3 className="text-lg font-medium">Теги</h3>
                <TagsManager 
                  tags={formHook.tags} 
                  onAddTag={formHook.handleAddTag} 
                  onRemoveTag={formHook.handleRemoveTag} 
                />
              </div>
              
              <PublishControl 
                isPublished={!!formHook.formData.is_published}
                onToggle={(checked) => formHook.handleCheckboxChange("is_published", checked)}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="specifications">
          <ProjectSpecifications 
            formData={formHook.formData as Project}
            handleNumberChange={formHook.handleNumberChange}
            handleSelectChange={formHook.handleSelectChange}
            handleCheckboxChange={formHook.handleCheckboxChange}
          />
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-between">
        {formHook.handleCancel && (
          <Button 
            type="button" 
            variant="outline"
            onClick={formHook.handleCancel}
            disabled={formHook.isLoading}
          >
            Отмена
          </Button>
        )}
        
        <div className="flex space-x-2">
          {formHook.isEditMode && (
            <Button 
              type="button" 
              variant="outline"
              onClick={formHook.handleReset}
              disabled={formHook.isLoading}
            >
              Сбросить
            </Button>
          )}
          
          <Button 
            type="submit"
            disabled={formHook.isLoading}
          >
            {formHook.isLoading 
              ? "Сохранение..." 
              : formHook.isEditMode 
                ? "Обновить проект" 
                : "Создать проект"
            }
          </Button>
        </div>
      </div>
    </div>
  );
};
