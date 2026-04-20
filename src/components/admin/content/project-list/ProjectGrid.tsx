import React from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Project } from "@/services/project/types";
import { Category } from "@/services/categoryService";
import ProjectCard from "./ProjectCard";

interface ProjectGridProps {
  projects: Project[];
  categories: Category[];
  isLoading: boolean;
  onAddProject: () => void;
  onEditProject: (project: Project) => void;
  onTogglePublished: (project: Project) => void;
  onDeleteProject: (project: Project) => void;
  onSendToReview?: (project: Project) => void;
  onRevoke?: (project: Project) => void;
  onApprove?: (project: Project) => void;
  onReject?: (project: Project) => void;
  isAdmin?: boolean;
  userRole?: string;
  selectedProjectIds?: string[];
  onToggleProjectSelect?: (projectId: string, checked: boolean) => void;
  onToggleSelectAll?: (checked: boolean) => void;
}

const ProjectGrid: React.FC<ProjectGridProps> = ({
  projects,
  categories,
  isLoading,
  onAddProject,
  onEditProject,
  onTogglePublished,
  onDeleteProject,
  onSendToReview,
  onRevoke,
  onApprove,
  onReject,
  isAdmin = false,
  userRole,
  selectedProjectIds = [],
  onToggleProjectSelect,
  onToggleSelectAll,
}) => {
  const allSelected =
    projects.length > 0 &&
    projects.every((p) => p.id && selectedProjectIds.includes(p.id));

  return (
    <>
      {isLoading && projects.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">Загрузка проектов...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-10 bg-muted/30 rounded-lg p-8 border border-border/50">
          <p className="text-muted-foreground mb-4">Проекты не найдены</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={onAddProject}
          >
            Создать новый проект
          </Button>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={allSelected}
                onCheckedChange={(checked) => onToggleSelectAll?.(Boolean(checked))}
              />
              <span className="text-sm text-muted-foreground">Выбрать все на странице</span>
            </div>
            <span className="text-sm text-muted-foreground">
              Выбрано: {selectedProjectIds.length}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div key={project.id} className="relative">
              <div className="absolute top-3 left-3 z-20 bg-white/95 rounded-md p-1 border">
                <Checkbox
                  checked={project.id ? selectedProjectIds.includes(project.id) : false}
                  onCheckedChange={(checked) =>
                    project.id && onToggleProjectSelect?.(project.id, Boolean(checked))
                  }
                />
              </div>
              <ProjectCard
                project={project}
                category={categories.find(c => c.id === project.category_id)}
                onEdit={() => onEditProject(project)}
                onTogglePublished={() => onTogglePublished(project)}
                onDelete={() => onDeleteProject(project)}
                status={project.status}
                isAdmin={isAdmin}
                userRole={userRole}
                onSendToReview={onSendToReview ? () => onSendToReview(project) : undefined}
                onRevoke={onRevoke ? () => onRevoke(project) : undefined}
                onApprove={onApprove ? () => onApprove(project) : undefined}
                onReject={onReject ? () => onReject(project) : undefined}
              />
            </div>
          ))}
          </div>
        </>
      )}
    </>
  );
};

export default ProjectGrid;
