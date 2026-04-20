
import React, { useEffect, useState } from "react";
import TasksList from "./TasksList";
import TasksFilter from "./TasksFilter";
import TaskFormDialog from "./TaskFormDialog";
import tasksService from "@/services/analytics/tasksService";
import { Task } from "@/types/analytics";
import { User } from "@/services/types/authTypes";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Filter, RotateCcw } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";

interface TasksDashboardProps {
  user: User;
}

const TasksDashboard: React.FC<TasksDashboardProps> = ({ user }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openTaskForm, setOpenTaskForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const navigate = useNavigate();
  
  // Фильтры для задач
  const [filters, setFilters] = useState({
    status: "all",
    priority: "all",
    assignedTo: "all",
  });

  // Определяем является ли пользователь администратором
  const isAdmin = user.role === "admin";

  // Загружаем задачи при монтировании компонента
  useEffect(() => {
    loadTasks();
  }, [user]);

  // Функция загрузки задач
  const loadTasks = async () => {
    setIsLoading(true);
    try {
      let loadedTasks: Task[];
      
      // Админы могут видеть все задачи, остальные только свои
      if (isAdmin) {
        loadedTasks = await tasksService.getAllTasks();
      } else {
        loadedTasks = await tasksService.getUserTasks(user.id);
      }
      
      setTasks(loadedTasks);
    } catch (error) {
      console.error("Ошибка при загрузке задач:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Функция создания новой задачи
  const handleCreateTask = async (taskData: Omit<Task, "id" | "created_at" | "updated_at">) => {
    try {
      // Добавляем создателя к данным задачи
      await tasksService.addTask({
        ...taskData,
        created_by: user.id,
      });
      loadTasks();
    } catch (error) {
      console.error("Ошибка при создании задачи:", error);
    }
  };

  // Функция обновления задачи
  const handleUpdateTask = async (id: string, taskData: Partial<Task>) => {
    try {
      await tasksService.updateTask(id, taskData);
      loadTasks();
    } catch (error) {
      console.error("Ошибка при обновлении задачи:", error);
    }
  };

  // Функция удаления задачи
  const handleDeleteTask = async (id: string) => {
    try {
      await tasksService.deleteTask(id);
      loadTasks();
    } catch (error) {
      console.error("Ошибка при удалении задачи:", error);
    }
  };

  // Функция для изменения статуса задачи
  const handleStatusChange = async (id: string, status: Task["status"]) => {
    try {
      await tasksService.updateTaskStatus(id, status);
      loadTasks();
    } catch (error) {
      console.error("Ошибка при изменении статуса задачи:", error);
    }
  };

  // Открытие формы для редактирования задачи
  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setOpenTaskForm(true);
  };

  // Фильтрация задач
  const filteredTasks = tasks.filter(task => {
    // Фильтр по вкладке
    if (activeTab === "created" && task.created_by !== user.id) return false;
    if (activeTab === "assigned" && task.assigned_to !== user.id) return false;
    if (activeTab === "completed" && task.status !== "completed") return false;
    if (activeTab === "archived" && task.status !== "canceled") return false;
    
    // Фильтр по статусу
    if (filters.status !== "all" && task.status !== filters.status) return false;
    
    // Фильтр по приоритету
    if (filters.priority !== "all" && task.priority !== filters.priority) return false;
    
    // Фильтр по исполнителю
    if (filters.assignedTo !== "all" && task.assigned_to !== filters.assignedTo) return false;
    
    return true;
  });

  // Переход на главную панель администратора
  const handleNavigateToAdmin = () => {
    navigate('/account/');
  };

  // Функция для обработки отправки формы задачи - обновлена согласно новой структуре
  const handleTaskFormSubmit = async (formData: Partial<Task>) => {
    // Для новых задач добавляем создателя
    if (!selectedTask) {
      return handleCreateTask({
        ...formData as Omit<Task, "id" | "created_at" | "updated_at">,
        created_by: user.id,
        // Если не админ, назначаем задачу самому себе
        assigned_to: isAdmin ? formData.assigned_to : user.id
      });
    } else {
      // Для обновления задач
      return handleUpdateTask(selectedTask.id, {
        ...formData,
        // Если не админ, не меняем assigned_to
        assigned_to: isAdmin ? formData.assigned_to : selectedTask.assigned_to
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Управление задачами</h2>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <Button variant="outline" onClick={handleNavigateToAdmin}>
              Вернуться в админ-панель
            </Button>
          )}
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="mr-2 h-4 w-4" />
            Фильтры
          </Button>
          <Button variant="default" onClick={() => {
            setSelectedTask(null);
            setOpenTaskForm(true);
          }}>
            <Plus className="mr-2 h-4 w-4" />
            Новая задача
          </Button>
        </div>
      </div>

      {showFilters && (
        <TasksFilter 
          filters={filters} 
          setFilters={setFilters} 
          isAdmin={isAdmin} 
        />
      )}
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all">Все задачи</TabsTrigger>
          <TabsTrigger value="assigned">Назначенные мне</TabsTrigger>
          <TabsTrigger value="created">Созданные мной</TabsTrigger>
          <TabsTrigger value="completed">Завершенные</TabsTrigger>
          <TabsTrigger value="archived">Архив</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-0">
          <TasksList 
            tasks={filteredTasks} 
            isLoading={isLoading}
            onStatusChange={handleStatusChange}
            onEdit={handleEditTask}
            onDelete={handleDeleteTask}
            isAdmin={isAdmin}
            userId={user.id}
          />
        </TabsContent>
        
        <TabsContent value="assigned" className="mt-0">
          <TasksList 
            tasks={filteredTasks} 
            isLoading={isLoading}
            onStatusChange={handleStatusChange}
            onEdit={handleEditTask}
            onDelete={handleDeleteTask}
            isAdmin={isAdmin}
            userId={user.id}
          />
        </TabsContent>

        <TabsContent value="created" className="mt-0">
          <TasksList 
            tasks={filteredTasks} 
            isLoading={isLoading}
            onStatusChange={handleStatusChange}
            onEdit={handleEditTask}
            onDelete={handleDeleteTask}
            isAdmin={isAdmin}
            userId={user.id}
          />
        </TabsContent>

        <TabsContent value="completed" className="mt-0">
          <TasksList 
            tasks={filteredTasks} 
            isLoading={isLoading}
            onStatusChange={handleStatusChange}
            onEdit={handleEditTask}
            onDelete={handleDeleteTask}
            isAdmin={isAdmin}
            userId={user.id}
          />
        </TabsContent>

        <TabsContent value="archived" className="mt-0">
          <TasksList 
            tasks={filteredTasks} 
            isLoading={isLoading}
            onStatusChange={handleStatusChange}
            onEdit={handleEditTask}
            onDelete={handleDeleteTask}
            isAdmin={isAdmin}
            userId={user.id}
          />
        </TabsContent>
      </Tabs>

      <TaskFormDialog 
        open={openTaskForm} 
        onOpenChange={setOpenTaskForm}
        onSubmit={handleTaskFormSubmit}
        defaultValues={selectedTask || undefined}
        isAdmin={isAdmin}
      />
    </div>
  );
};

export default TasksDashboard;
