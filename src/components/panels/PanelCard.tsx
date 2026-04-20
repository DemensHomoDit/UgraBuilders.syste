
import React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ImageDisplay from "@/components/shared/ImageDisplay";

interface PanelCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  image_url: string;
  key_points: string[];
}

const PanelCard: React.FC<PanelCardProps> = ({
  title,
  description,
  icon,
  image_url,
  key_points,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <>
      <Button
        variant="outline"
        className="h-auto w-full p-6 flex flex-col items-start gap-4 hover:bg-accent transition-colors"
        onClick={() => setIsOpen(true)}
      >
        <div className="flex items-center gap-3 w-full">
          <div className="text-primary">{icon}</div>
          <h3 className="text-xl font-semibold text-left">{title}</h3>
        </div>
        <p className="text-muted-foreground text-left line-clamp-2">{description}</p>
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {icon}
              <span>{title}</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="relative aspect-video mb-4 overflow-hidden rounded-lg">
            <ImageDisplay
              imageUrl={image_url}
              alt={title}
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="space-y-4">
            <p className="text-muted-foreground">{description}</p>
            
            <div>
              <h4 className="font-semibold mb-2">Ключевые особенности:</h4>
              <ul className="list-disc pl-5 space-y-1">
                {key_points.map((point, idx) => (
                  <li key={idx}>{point}</li>
                ))}
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PanelCard;
