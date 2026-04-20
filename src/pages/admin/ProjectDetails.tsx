
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { db } from "@/integrations/db/client";
import ProjectForm from "@/components/admin/content/project-form/ProjectForm";
import { Project } from "@/types/project";

const AdminProjectDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadProject = async () => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      const { data, error } = await db
        .from("projects")
        .select("*")
        .eq("id", id)
        .single();
      
      if (error) throw error;
      setProject(data as Project);
    } catch (error: any) {
      console.error("Ошибка загрузки проекта:", error);
      toast.error("Не удалось загрузить проект");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProject();
  }, [id]);

  const handleProjectSave = (savedProject: Project) => {
    setProject(savedProject);
    toast.success("Проект успешно сохранен");
  };

  const handleGoBack = () => {
    navigate("/account/projects");
  };

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Загрузка проекта...</p>
        </div>
      </div>
    );
  }

  if (!project && !isLoading) {
    return (
      <div className="p-8">
        <Button variant="outline" onClick={handleGoBack} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Назад
        </Button>
        <Card>
          <CardContent className="p-8 text-center">
            <h3 className="text-xl font-bold mb-2">Проект не найден</h3>
            <p className="text-muted-foreground">
              Запрашиваемый проект не существует или был удален
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <Button variant="outline" onClick={handleGoBack}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Назад к проектам
        </Button>
        <h1 className="text-2xl font-bold">{project?.title || "Редактирование проекта"}</h1>
      </div>

      <Tabs defaultValue="details">
        <TabsList className="mb-6">
          <TabsTrigger value="details">Детали проекта</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Информация о проекте</CardTitle>
            </CardHeader>
            <CardContent>
              <ProjectForm
                project={project}
                onSave={handleProjectSave}
                onCancel={handleGoBack}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminProjectDetails;
