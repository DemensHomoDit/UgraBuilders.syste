import React, { useState, useEffect } from "react";
import { User } from "@/services/types/authTypes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User as UserIcon,
  Mail,
  Phone,
  Save,
  Loader2,
  Camera,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { db } from "@/integrations/db/client";
import ImageUpload from "@/components/admin/content/image-upload/ImageUpload";

interface ClientProfileProps {
  user: User;
}

const ClientProfile: React.FC<ClientProfileProps> = ({ user }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: user.username || "",
    phone: user.phone || "",
    email: user.email || "",
  });
  const [avatarUrl, setAvatarUrl] = useState(user.avatar || "");
  const { toast } = useToast();

  // Update formData when user prop changes
  useEffect(() => {
    setFormData({
      username: user.username || "",
      phone: user.phone || "",
      email: user.email || "",
    });
    setAvatarUrl(user.avatar || "");
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const updateData: any = {
        username: formData.username,
        phone: formData.phone,
        updated_at: new Date().toISOString(),
      };
      if (avatarUrl) {
        updateData.avatar = avatarUrl;
      }

      const { data: savedUser, error: userError } = await db
        .from("users")
        .update(updateData)
        .eq("id", user.id)
        .select();

      if (userError) throw userError;

      const profileUpdate: any = {
        username: formData.username,
        updated_at: new Date().toISOString(),
      };

      const { error: profileError } = await db
        .from("user_profiles")
        .update(profileUpdate)
        .eq("id", user.id);

      if (profileError) throw profileError;

      // Update local state from saved data
      if (savedUser && savedUser[0]) {
        const newUserData = {
          username: savedUser[0].username || formData.username,
          phone: savedUser[0].phone || formData.phone,
          email: savedUser[0].email || formData.email,
        };
        setFormData(newUserData);
        if (savedUser[0].avatar) {
          setAvatarUrl(savedUser[0].avatar);
        }
        
        // Update parent component's user object
        Object.assign(user, {
          username: newUserData.username,
          phone: newUserData.phone,
          avatar: savedUser[0].avatar || avatarUrl,
        });
      }

      toast({ title: "Профиль обновлён" });
      setIsEditing(false);
    } catch (error: any) {
      toast({
        title: "Ошибка сохранения",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? "")
      .join("");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="h-5 w-5 text-primary" />
              Мой профиль
            </CardTitle>
            {!isEditing && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                Редактировать
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={avatarUrl} />
                  <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                    {getInitials(user.username)}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <div className="absolute -bottom-1 -right-1">
                    <ImageUpload
                      currentImage={avatarUrl}
                      onImageUploaded={setAvatarUrl}
                      bucketName="avatars"
                      objectPath={`user-${user.id}-${Date.now()}`}
                      className="w-8 h-8 rounded-full"
                    />
                  </div>
                )}
              </div>
              <Badge variant="outline" className="text-xs">
                {user.clientStage || "Клиент"}
              </Badge>
            </div>

            <div className="flex-1 space-y-4">
              {!isEditing ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <UserIcon className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Имя</p>
                      <p className="font-medium">{formData.username || "—"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="font-medium">{formData.email || "—"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Телефон</p>
                      <p className="font-medium">{formData.phone || "Не указан"}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="username">Имя</Label>
                    <Input
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      className="mt-1"
                      disabled
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Email нельзя изменить
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="phone">Телефон</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+7 (___) ___-__-__"
                      className="mt-1"
                    />
                  </div>

                  <Separator />

                  <div className="flex gap-2">
                    <Button onClick={handleSave} disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Сохранение...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Сохранить
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false);
                        setFormData({
                          username: user.username || "",
                          phone: user.phone || "",
                          email: user.email || "",
                        });
                      }}
                    >
                      Отмена
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientProfile;
