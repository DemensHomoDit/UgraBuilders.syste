import React, { useState } from "react";
import { User } from "@/services/types/authTypes";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Video,
  ExternalLink,
  RefreshCw,
  WifiOff,
  Camera,
  MapPin,
} from "lucide-react";

interface CameraStream {
  id: string;
  title: string;
  location?: string;
  streamUrl?: string;
  embedUrl?: string;
  thumbnailUrl?: string;
  isOnline?: boolean;
  addedAt?: string;
}

interface ClientCameraViewProps {
  user: User;
}

function getCameras(user: User): CameraStream[] {
  const raw = user.cameras;
  if (Array.isArray(raw) && raw.length > 0) return raw as CameraStream[];
  return [];
}

const CameraCard: React.FC<{ camera: CameraStream }> = ({ camera }) => {
  const [embedError, setEmbedError] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => setRefreshKey((k) => k + 1);

  return (
    <Card className="overflow-hidden">
      {/* Preview / embed area */}
      <div className="relative bg-black aspect-video">
        {camera.embedUrl && !embedError ? (
          <iframe
            key={refreshKey}
            src={camera.embedUrl}
            className="w-full h-full border-0"
            allow="autoplay; encrypted-media"
            allowFullScreen
            onError={() => setEmbedError(true)}
            title={camera.title}
          />
        ) : camera.thumbnailUrl ? (
          <img
            src={camera.thumbnailUrl}
            alt={camera.title}
            className="w-full h-full object-cover opacity-80"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-white/40">
            <Camera className="h-12 w-12" />
            <span className="text-sm">Нет превью</span>
          </div>
        )}

        {/* Online badge */}
        <div className="absolute top-3 left-3">
          {camera.isOnline !== false ? (
            <Badge className="bg-green-500/90 text-white border-0 text-xs flex items-center gap-1.5 px-2 py-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
              </span>
              В эфире
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="bg-black/50 text-white/70 border-white/20 text-xs flex items-center gap-1"
            >
              <WifiOff className="h-3 w-3" />
              Офлайн
            </Badge>
          )}
        </div>

        {/* Refresh button */}
        <Button
          size="icon"
          variant="ghost"
          className="absolute top-2 right-2 h-7 w-7 text-white hover:bg-white/20"
          onClick={handleRefresh}
          title="Обновить"
        >
          <RefreshCw className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Info */}
      <CardContent className="pt-4 pb-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h4 className="font-medium text-sm leading-tight truncate">
              {camera.title}
            </h4>
            {camera.location && (
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1 truncate">
                <MapPin className="h-3 w-3 flex-shrink-0" />
                {camera.location}
              </p>
            )}
          </div>

          {camera.streamUrl && (
            <a
              href={camera.streamUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0"
            >
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs gap-1.5"
              >
                <ExternalLink className="h-3 w-3" />
                Открыть
              </Button>
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const ClientCameraView: React.FC<ClientCameraViewProps> = ({ user }) => {
  const cameras = getCameras(user);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Video className="h-5 w-5 text-primary" />
            Камеры на объекте
          </CardTitle>
          <CardDescription>
            Трансляции с объекта добавляются вашим менеджером
          </CardDescription>
        </CardHeader>

        {cameras.length > 0 && (
          <CardContent>
            <div className="flex gap-3">
              <div className="rounded-lg border bg-muted/30 px-4 py-3 text-center min-w-[80px]">
                <p className="text-2xl font-bold text-primary">
                  {cameras.length}
                </p>
                <p className="text-xs text-muted-foreground">Камер</p>
              </div>
              <div className="rounded-lg border bg-muted/30 px-4 py-3 text-center min-w-[80px]">
                <p className="text-2xl font-bold text-green-600">
                  {cameras.filter((c) => c.isOnline !== false).length}
                </p>
                <p className="text-xs text-muted-foreground">Онлайн</p>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Grid of cameras */}
      {cameras.length > 0 ? (
        <div
          className={
            cameras.length === 1
              ? "max-w-lg"
              : "grid grid-cols-1 md:grid-cols-2 gap-4"
          }
        >
          {cameras.map((camera) => (
            <CameraCard key={camera.id} camera={camera} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-16 text-center">
            <Video className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="font-medium text-muted-foreground mb-1">
              Камеры пока не добавлены
            </h3>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
              Ваш менеджер добавит ссылки на трансляции с объекта после
              начала работ
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ClientCameraView;
