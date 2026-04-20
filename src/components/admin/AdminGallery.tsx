
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { db } from "@/integrations/db/client";
import { User } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Loader2, RefreshCw, Trash2, Edit, ImagePlus, Link } from "lucide-react";
import ImageUploader from "@/components/shared/ImageUploader";
import HomePageGalleryManager from "./content/homepage-gallery/HomePageGalleryManager";
import HeroCarouselManager from "./content/homepage-gallery/HeroCarouselManager";

interface AdminGalleryProps {
  user: User;
}

const AdminGallery: React.FC<AdminGalleryProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState("gallery");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Управление галереей</h1>
          <p className="text-muted-foreground">Управление изображениями на главной странице сайта</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full max-w-md mb-6">
          <TabsTrigger value="gallery" className="flex-1">Галерея работ</TabsTrigger>
          <TabsTrigger value="carousel" className="flex-1">Карусель на главной</TabsTrigger>
        </TabsList>

        <TabsContent value="gallery" className="space-y-6">
          <HomePageGalleryManager />
        </TabsContent>

        <TabsContent value="carousel" className="space-y-6">
          <HeroCarouselManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminGallery;
