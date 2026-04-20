import React, { useState, useEffect } from "react";
import { User } from "@/services/types/authTypes";
import { db } from "@/integrations/db/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Home,
  Paintbrush,
  Wrench,
  Thermometer,
  Droplets,
  Zap,
  Shield,
  FileText,
  Info,
  CheckCircle,
  AlertCircle,
  Leaf,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface HouseInfoProps {
  user: User;
}

interface HouseData {
  id: string;
  materials: {
    walls: string;
    foundation: string;
    roof: string;
    insulation: string;
    windows: string;
  };
  systems: {
    heating: string;
    water: string;
    electricity: string;
    ventilation: string;
  };
  colors: {
    facade?: string;
    roof?: string;
    windows?: string;
  };
  maintenance: {
    lastCheck?: string;
    nextCheck?: string;
    warrantyEnd?: string;
  };
  documents: {
    title: string;
    url: string;
    type: string;
  }[];
}

const HouseInfo: React.FC<HouseInfoProps> = ({ user }) => {
  const [houseData, setHouseData] = useState<HouseData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadHouseInfo();
  }, []);

  const loadHouseInfo = async () => {
    try {
      // Try to get from user_profiles
      const { data: profile } = await db
        .from("user_profiles")
        .select("house_info, project_id")
        .eq("id", user.id)
        .single();

      if (profile?.house_info) {
        setHouseData(JSON.parse(profile.house_info));
      } else if (profile?.project_id) {
        // Get from project
        const { data: project } = await db
          .from("projects")
          .select("*")
          .eq("id", profile.project_id)
          .single();

        if (project) {
          // Generate house info from project data
          const generatedData: HouseData = {
            id: project.id,
            materials: {
              walls: project.material || "Не указано",
              foundation: project.foundation_type || "Не указано",
              roof: project.roof_type || "Не указано",
              insulation: project.insulation || "Не указано",
              windows: project.window_type || "Не указано",
            },
            systems: {
              heating: project.heating || "Не указано",
              water: "Центральное / Автономное",
              electricity: "15 кВт",
              ventilation: "Приточно-вытяжная",
            },
            colors: {
              facade: "Базовый",
              roof: "Стандартный",
              windows: "Белый",
            },
            maintenance: {
              warrantyEnd: new Date(Date.now() + 50 * 365 * 24 * 60 * 60 * 1000).toISOString(),
            },
            documents: [],
          };
          setHouseData(generatedData);
        }
      }
    } catch (err) {
      console.error("Error loading house info:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!houseData) {
    return (
      <Card className="p-12 text-center">
        <Home className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
        <p className="text-muted-foreground">Информация о доме пока не заполнена</p>
        <p className="text-sm text-muted-foreground mt-2">
          Данные появятся после назначения проекта
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold">Паспорт дома</h2>
        <p className="text-sm text-muted-foreground">
          Вся информация о материалах, системах и уходе
        </p>
      </div>

      {/* Warranty card */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <Shield className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-green-900">Гарантия 50 лет</p>
              <p className="text-sm text-green-700">
                До {new Date(houseData.maintenance.warrantyEnd || "")
                  .toLocaleDateString("ru-RU", { year: "numeric", month: "long" })}
              </p>
            </div>
          </div>
          <Badge className="bg-green-100 text-green-700">Активна</Badge>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="materials">
        <TabsList className="grid grid-cols-4">
          <TabsTrigger value="materials">Материалы</TabsTrigger>
          <TabsTrigger value="systems">Системы</TabsTrigger>
          <TabsTrigger value="colors">Отделка</TabsTrigger>
          <TabsTrigger value="care">Уход</TabsTrigger>
        </TabsList>

        {/* Materials */}
        <TabsContent value="materials" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Стены
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">{houseData.materials.walls}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Основной материал несущих конструкций
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Фундамент
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">{houseData.materials.foundation}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Тип основания дома
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Кровля
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">{houseData.materials.roof}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Тип кровельного покрытия
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Thermometer className="h-4 w-4" />
                  Утепление
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">{houseData.materials.insulation}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Материал и толщина утепления
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Окна
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">{houseData.materials.windows}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Профиль и стеклопакет
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Systems */}
        <TabsContent value="systems" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Thermometer className="h-4 w-4" />
                  Отопление
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">{houseData.systems.heating}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Рекомендуемая температура: 20-22°C
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Droplets className="h-4 w-4" />
                  Водоснабжение
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">{houseData.systems.water}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Рекомендуемое давление: 2-4 атм
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Электричество
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">{houseData.systems.electricity}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Вводная мощность
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Leaf className="h-4 w-4" />
                  Вентиляция
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">{houseData.systems.ventilation}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Тип системы воздухообмена
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Colors */}
        <TabsContent value="colors" className="space-y-4 mt-4">
          <Card>
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <Paintbrush className="h-5 w-5" />
                    <span className="font-medium">Фасад</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-full border"
                      style={{ backgroundColor: houseData.colors.facade }}
                    />
                    <span className="text-sm">{houseData.colors.facade}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <Info className="h-5 w-5" />
                    <span className="font-medium">Кровля</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-full border"
                      style={{ backgroundColor: houseData.colors.roof }}
                    />
                    <span className="text-sm">{houseData.colors.roof}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <Info className="h-5 w-5" />
                    <span className="font-medium">Окна</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-full border"
                      style={{ backgroundColor: houseData.colors.windows }}
                    />
                    <span className="text-sm">{houseData.colors.windows}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Care */}
        <TabsContent value="care" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Wrench className="h-4 w-4" />
                Рекомендации по уходу
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Ежегодно:</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    Осмотр кровли и водосточной системы
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    Проверка герметизации окон и дверей
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    Обслуживание отопительной системы
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    Чистка вентиляционных каналов
                  </li>
                </ul>
              </div>

              <Separator />

              <div className="space-y-2">
                <h4 className="font-medium text-sm">Раз в 5 лет:</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    Покраска фасада (при необходимости)
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    Замена уплотнителей окон
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    Полная диагностика инженерных систем
                  </li>
                </ul>
              </div>

              <Separator />

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm text-amber-900">Важно!</p>
                    <p className="text-sm text-amber-700">
                      При обнаружении трещин, протечек или других дефектов — 
                      немедленно свяжитесь с нами через ленту или по телефону.
                      Гарантия действует при своевременном уведомлении.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HouseInfo;
