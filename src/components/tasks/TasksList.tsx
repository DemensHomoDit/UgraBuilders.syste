
import React from "react";
import { Task } from "@/types/analytics";
import { 
  Table, 
  TableHead, 
  TableHeader, 
  TableRow, 
  TableBody, 
  TableCell 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle, 
  Circle, 
  Clock, 
  AlertCircle,
  Trash2, 
  Pencil,
  CheckCircle2,
  XCircle,
  Loader2
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface TasksListProps {
  tasks: Task[];
  isLoading: boolean;
  onStatusChange: (id: string, status: Task["status"]) => Promise<void>;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => Promise<void>;
  isAdmin: boolean;
  userId: string;
}

const TasksList: React.FC<TasksListProps> = ({ 
  tasks, 
  isLoading,
  onStatusChange,
  onEdit,
  onDelete,
  isAdmin,
  userId
}) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [taskToDelete, setTaskToDelete] = React.useState<string | null>(null);

  // Функция для отображения иконки приоритета
  const getPriorityBadge = (priority: Task["priority"]) => {
    switch(priority) {
      case "low":
        return <Badge variant="outline">Низкий</Badge>;
      case "medium":
        return <Badge variant="secondary">Средний</Badge>;
      case "high":
        return <Badge variant="default">Высокий</Badge>;
      case "urgent":
        return <Badge variant="destructive">Срочный</Badge>;
      default:
        return null;
    }
  };

  // Функция для отображения иконки статуса
  const getStatusIcon = (status: Task["status"]) => {
    switch(status) {
      case "pending":
        return <Circle className="h-5 w-5 text-yellow-500" />;
      case "in_progress":
        return <Clock className="h-5 w-5 text-blue-500" />;
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "canceled":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  // Функция для отображения текста статуса
  const getStatusText = (status: Task["status"]) => {
    switch(status) {
      case "pending":
        return "Ожидает";
      case "in_progress":
        return "В работе";
      case "completed":
        return "Завершена";
      case "canceled":
        return "Отменена";
      default:
        return "";
    }
  };

  // Форматирование даты
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Не указано";
    try {
      return formatDistanceToNow(new Date(dateString), { 
        addSuffix: true,
        locale: ru
      });
    } catch (error) {
      return "Неверная дата";
    }
  };

  // Проверка прав на изменение задачи
  const canEditTask = (task: Task) => {
    return isAdmin || task.created_by === userId || task.assigned_to === userId;
  };
  
  // Проверка прав на удаление задачи
  const canDeleteTask = (task: Task) => {
    return isAdmin || task.created_by === userId;
  };

  // Обработка запроса на удаление
  const handleRequestDelete = (id: string) => {
    setTaskToDelete(id);
    setDeleteDialogOpen(true);
  };

  // Подтверждение удаления
  const handleConfirmDelete = async () => {
    if (taskToDelete) {
      await onDelete(taskToDelete);
      setTaskToDelete(null);
    }
    setDeleteDialogOpen(false);
  };

  // Если загрузка
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-xl font-medium">Загрузка задач...</span>
      </div>
    );
  }

  // Если нет задач
  if (tasks.length === 0) {
    return (
      <div className="text-center p-8 border rounded-lg bg-gray-50">
        <h3 className="text-xl font-medium mb-2">Задачи не найдены</h3>
        <p className="text-muted-foreground">
          В данной категории пока нет задач. Создайте новую задачу или измените фильтры поиска.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">Статус</TableHead>
              <TableHead className="w-[300px]">Задача</TableHead>
              <TableHead>Приоритет</TableHead>
              <TableHead>Срок</TableHead>
              <TableHead>Создана</TableHead>
              <TableHead className="text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        {getStatusIcon(task.status)}
                        <span className="sr-only">Изменить статус</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuItem onClick={() => onStatusChange(task.id, "pending")}>
                        <Circle className="mr-2 h-4 w-4 text-yellow-500" />
                        <span>Ожидает</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onStatusChange(task.id, "in_progress")}>
                        <Clock className="mr-2 h-4 w-4 text-blue-500" />
                        <span>В работе</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onStatusChange(task.id, "completed")}>
                        <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                        <span>Завершена</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onStatusChange(task.id, "canceled")}>
                        <XCircle className="mr-2 h-4 w-4 text-red-500" />
                        <span>Отменена</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{task.title}</div>
                    {task.description && (
                      <div className="text-sm text-muted-foreground line-clamp-1">
                        {task.description}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>{getPriorityBadge(task.priority)}</TableCell>
                <TableCell>
                  {task.due_date ? (
                    <div className={`text-sm ${
                      new Date(task.due_date) < new Date() && task.status !== "completed" 
                        ? "text-red-500" 
                        : ""
                    }`}>
                      {formatDate(task.due_date)}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">Не установлен</div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="text-sm">{formatDate(task.created_at)}</div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {canEditTask(task) && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => onEdit(task)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )}
                    {canDeleteTask(task) && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleRequestDelete(task.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить задачу?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить. Задача будет безвозвратно удалена из системы.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700">
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default TasksList;
