
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown, Trash2, MessageSquare } from "lucide-react";
import { ImageItemProps } from "./types";

const ImageItem: React.FC<ImageItemProps> = ({
  image,
  index,
  onEditDescription,
  onDeleteImage,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast
}) => {
  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-video h-48 overflow-hidden bg-gray-100">
        <img
          src={image.image_url}
          alt={image.description || `Image ${index + 1}`}
          className="object-cover w-full h-full"
        />
      </div>
      <CardContent className="p-3">
        <div className="flex flex-col space-y-2">
          <div className="text-sm truncate text-muted-foreground">
            {image.description ? (
              <span className="font-medium text-foreground">{image.description}</span>
            ) : (
              <span className="italic text-muted-foreground">Нет описания</span>
            )}
          </div>
          <div className="flex justify-between">
            <div className="flex space-x-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => onMoveUp(index)}
                disabled={isFirst}
                title="Переместить вверх"
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => onMoveDown(index)}
                disabled={isLast}
                title="Переместить вниз"
              >
                <ArrowDown className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex space-x-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => onEditDescription(image)}
                title="Редактировать описание"
              >
                <MessageSquare className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 text-destructive hover:bg-destructive hover:text-white"
                onClick={() => onDeleteImage(image.id)}
                title="Удалить изображение"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ImageItem;
