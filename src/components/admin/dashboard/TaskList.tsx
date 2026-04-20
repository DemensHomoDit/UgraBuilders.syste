
import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, BarChart3 } from "lucide-react";
import { Task } from "@/types/analytics";
import { tasksService } from "@/services/analytics";
import { toast } from "sonner";

interface TaskListProps {
  tasks: Task[];
  onTaskUpdated?: () => void;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, onTaskUpdated }) => {
  const handleStatusChange = async (taskId: string, status: Task['status']) => {
    const success = await tasksService.updateTaskStatus(taskId, status);
    if (success) {
      toast.success("Статус задачи обновлен");
      if (onTaskUpdated) {
        onTaskUpdated();
      }
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'in_progress': return 'bg-blue-100 text-blue-700';
      case 'canceled': return 'bg-red-100 text-red-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Предстоящие задачи</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tasks.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              Нет задач для отображения
            </div>
          ) : (
            tasks.map((task) => (
              <div key={task.id} className="flex items-center gap-4 pb-4 border-b last:border-0 last:pb-0">
                <div className={`p-2 rounded-md ${getPriorityColor(task.priority)}`}>
                  <Calendar className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{task.title}</p>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="h-3 w-3 inline mr-1" />
                    {task.due_date ? (
                      <span>
                        Срок: {new Date(task.due_date).toLocaleDateString('ru-RU')}
                      </span>
                    ) : (
                      <span>Без срока</span>
                    )}
                    <Badge variant="outline" className="ml-2">
                      {task.priority === 'urgent' ? 'Срочно' : 
                        task.priority === 'high' ? 'Высокий' : 
                        task.priority === 'medium' ? 'Средний' : 'Низкий'}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Select 
                    defaultValue={task.status}
                    onValueChange={(value) => handleStatusChange(task.id, value as Task['status'])}
                  >
                    <SelectTrigger className={`w-[130px] ${getStatusColor(task.status)}`}>
                      <SelectValue placeholder="Статус" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Ожидает</SelectItem>
                      <SelectItem value="in_progress">В процессе</SelectItem>
                      <SelectItem value="completed">Завершено</SelectItem>
                      <SelectItem value="canceled">Отменено</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskList;
