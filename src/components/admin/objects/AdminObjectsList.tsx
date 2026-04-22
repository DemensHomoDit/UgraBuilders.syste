import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PlusCircle, Edit, Trash2, Building2 } from "lucide-react";
import { toast } from "sonner";
import { db } from "@/integrations/db/client";
import { OurObject } from "@/types/ourObjects";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AdminSectionHeader from "@/components/admin/shared/AdminSectionHeader";

type ObjectRow = Pick<OurObject, "id" | "title" | "city" | "is_published" | "created_at">;

const AdminObjectsList = () => {
  const navigate = useNavigate();
  const [objects, setObjects] = useState<ObjectRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadObjects = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await db
        .from("our_objects")
        .select("id, title, city, is_published, created_at")
        .order("created_at", { ascending: false });

      if (error) {
        toast.error("Не удалось загрузить объекты: " + error.message);
        return;
      }
      setObjects((data as ObjectRow[]) ?? []);
    } catch (err: any) {
      toast.error("Ошибка загрузки объектов");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadObjects();
  }, []);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const { error } = await db
        .from("our_objects")
        .delete()
        .eq("id", id);

      if (error) {
        toast.error("Не удалось удалить объект: " + error.message);
        return;
      }
      toast.success("Объект удалён");
      setObjects((prev) => prev.filter((o) => o.id !== id));
    } catch (err: any) {
      toast.error("Ошибка при удалении объекта");
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <AdminSectionHeader
          title="Наши объекты"
          description="Управление объектами строительного портфолио"
        />
        <Button onClick={() => navigate("/account/objects/new")}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Создать объект
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Список объектов</CardTitle>
            <Button variant="outline" size="sm" onClick={loadObjects} disabled={isLoading}>
              {isLoading ? "Загрузка..." : "Обновить"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-48">
              <div className="text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary mx-auto" />
                <p className="mt-3 text-muted-foreground">Загрузка объектов...</p>
              </div>
            </div>
          ) : objects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Building2 className="h-12 w-12 text-muted-foreground opacity-40" />
              <h3 className="mt-4 text-lg font-medium">Объекты не найдены</h3>
              <p className="text-muted-foreground mt-2">
                Создайте первый объект, нажав кнопку «Создать объект».
              </p>
              <Button className="mt-4" onClick={() => navigate("/account/objects/new")}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Создать объект
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Заголовок</TableHead>
                  <TableHead className="hidden sm:table-cell">Город</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead className="hidden md:table-cell">Дата создания</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {objects.map((obj) => (
                  <TableRow key={obj.id}>
                    <TableCell className="font-medium">{obj.title}</TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">
                      {obj.city || "—"}
                    </TableCell>
                    <TableCell>
                      {obj.is_published ? (
                        <Badge variant="outline" className="bg-green-100 text-green-800">
                          Опубликован
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-gray-100 text-gray-600">
                          Черновик
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {formatDate(obj.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/account/objects/edit/${obj.id}`)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Редактировать
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-600 hover:bg-red-50"
                              disabled={deletingId === obj.id}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Удалить
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Подтвердите удаление</AlertDialogTitle>
                              <AlertDialogDescription>
                                Вы действительно хотите удалить объект «{obj.title}»? Это действие
                                также удалит все связанные фотографии и отзыв. Отменить нельзя.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Отмена</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(obj.id)}
                                className="bg-red-500 hover:bg-red-600"
                              >
                                Удалить
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminObjectsList;
