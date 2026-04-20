import React, { memo } from "react";
import { Project } from "@/services/project/types";
import { Category } from "@/services/categoryService";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProjectCardImage } from "./components/card/ProjectCardImage";
import { ProjectCardDetails } from "./components/card/ProjectCardDetails";
import { ProjectCardActions } from "./components/card/ProjectCardActions";
import { useProjectCard } from "./hooks/useProjectCard";
import StatusBadge from "./StatusBadge";

interface ProjectCardProps {
  project: Project;
  category?: Category;
  onEdit: (project: Project) => void;
  onTogglePublished: (project: Project) => void;
  onDelete: (project: Project) => void;
  status?: string;
  isAdmin?: boolean;
  userRole?: string;
  onSendToReview?: () => void;
  onRevoke?: () => void;
  onApprove?: () => void;
  onReject?: () => void;
}

const ProjectCard: React.FC<ProjectCardProps> = memo(({
  project,
  category,
  onEdit,
  onTogglePublished,
  onDelete,
  status,
  isAdmin = false,
  userRole,
  onSendToReview,
  onRevoke,
  onApprove,
  onReject
}) => {
  const { isAdmin: isAdminSession, isPublished } = useProjectCard(
    project.id || '',
    Boolean(project.is_published)
  );

  return (
    <Card className="overflow-hidden">
      <div className="relative h-48 overflow-hidden">
        <ProjectCardImage 
          imageUrl={project.cover_image} 
          title={project.title}
        />
        
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
          <h3 className="text-white font-medium truncate">{project.title}</h3>
        </div>
        
        <div className="absolute top-2 right-2 flex space-x-1">
          <StatusBadge status={project.status || (isPublished ? "published" : "draft")} />
        </div>
      </div>
      
      <ProjectCardDetails project={project} category={category} />
      
      <ProjectCardActions
        isPublished={project.is_published}
        status={project.status}
        isAdmin={isAdmin}
        userRole={userRole}
        onTogglePublish={() => onTogglePublished(project)}
        onEdit={() => onEdit(project)}
        onDelete={() => onDelete(project)}
        onSendToReview={onSendToReview}
        onRevoke={onRevoke}
        onApprove={onApprove}
        onReject={onReject}
      />
    </Card>
  );
});

ProjectCard.displayName = 'ProjectCard';

export default ProjectCard;
