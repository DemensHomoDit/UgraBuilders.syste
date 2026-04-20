
import React from "react";
import DesignerInfo from "./DesignerInfo";

interface ProjectDescriptionProps {
  title: string;
  description?: string;
  contentParagraphs: string[];
  designerName: string;
}

const ProjectDescription: React.FC<ProjectDescriptionProps> = ({
  title,
  description,
  contentParagraphs,
  designerName
}) => (
  <div className="bg-white p-5 rounded-lg shadow-sm">
    <h2 className="text-xl font-semibold mb-4">Описание проекта</h2>
    <div className="prose max-w-none space-y-4">
      {/* Параграфы описания */}
      {contentParagraphs.length > 0 ? (
        contentParagraphs.map((paragraph, idx) => (
          <p key={idx} className="text-gray-700">{paragraph}</p>
        ))
      ) : (
        <p className="text-muted-foreground italic">
          Подробное описание проекта отсутствует.
        </p>
      )}
    </div>
    {/* Красиво выровненный проектировщик, только если имя задано */}
    <DesignerInfo designerName={designerName} />
  </div>
);

export default ProjectDescription;
