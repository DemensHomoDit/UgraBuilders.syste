
import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import userProfileService from "@/services/user/userProfileService";
import { User } from "@/services/types/authTypes";

interface TasksFilterProps {
  filters: {
    status: string;
    priority: string;
    assignedTo: string;
  };
  setFilters: React.Dispatch<
    React.SetStateAction<{
      status: string;
      priority: string;
      assignedTo: string;
    }>
  >;
  isAdmin: boolean;
}

const TasksFilter: React.FC<TasksFilterProps> = ({ filters, setFilters, isAdmin }) => {
  const [users, setUsers] = useState<User[]>([]);
  
  useEffect(() => {
    // Загружаем пользователей только для админов
    if (isAdmin) {
      const fetchUsers = async () => {
        try {
          const allUsers = await userProfileService.getAllUsers();
          // Фильтруем только работников (не клиентов)
          const workers = allUsers.filter((u) => u.role !== 'client');
          setUsers(workers);
        } catch (error) {
          console.error("Ошибка при загрузке пользователей:", error);
        }
      };
      fetchUsers();
    }
  }, [isAdmin]);

  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="status-filter">Статус</Label>
            <Select
              value={filters.status}
              onValueChange={(value) =>
                setFilters((prev) => ({ ...prev, status: value }))
              }
            >
              <SelectTrigger id="status-filter">
                <SelectValue placeholder="Статус задачи" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все статусы</SelectItem>
                <SelectItem value="active">Активные</SelectItem>
                <SelectItem value="completed">Завершенные</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="priority-filter">Приоритет</Label>
            <Select
              value={filters.priority}
              onValueChange={(value) =>
                setFilters((prev) => ({ ...prev, priority: value }))
              }
            >
              <SelectTrigger id="priority-filter">
                <SelectValue placeholder="Приоритет" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все приоритеты</SelectItem>
                <SelectItem value="low">Низкий</SelectItem>
                <SelectItem value="medium">Средний</SelectItem>
                <SelectItem value="high">Высокий</SelectItem>
                <SelectItem value="urgent">Срочный</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {isAdmin && (
            <div className="space-y-2">
              <Label htmlFor="assigned-filter">Исполнитель</Label>
              <Select
                value={filters.assignedTo}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, assignedTo: value }))
                }
              >
                <SelectTrigger id="assigned-filter">
                  <SelectValue placeholder="Исполнитель" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все исполнители</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.username || user.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TasksFilter;
