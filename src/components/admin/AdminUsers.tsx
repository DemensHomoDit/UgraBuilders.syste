import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { User, UserRole } from "@/services/types/authTypes";
import {
  Users,
  Search,
  Filter,
  PlusCircle,
  Download,
  Settings,
  Shield,
  UserCog,
  Edit,
  Trash2,
  Mail,
  Phone,
  Calendar,
  UserCircle,
  Check,
  X,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import authService from "@/services/authService";
import AdminSectionHeader from "@/components/admin/shared/AdminSectionHeader";
import AdminPagination from "@/components/admin/shared/AdminPagination";

const USERS_PAGE_SIZE = 20;

interface AdminUsersProps {
  user: User;
}

const UserRoleBadge = ({ role }: { role: string }) => {
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "editor":
        return "bg-blue-100 text-blue-800";

      case "manager":
        return "bg-green-100 text-green-800";
      case "client":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleDisplayName = (role: string): string => {
    switch (role) {
      case "admin":
        return "Администратор";
      case "editor":
        return "Редактор";

      case "manager":
        return "Менеджер";
      case "client":
        return "Клиент";
      default:
        return role;
    }
  };

  return (
    <Badge
      variant="outline"
      className={`font-normal ${getRoleBadgeColor(role)}`}
    >
      {getRoleDisplayName(role)}
    </Badge>
  );
};

const AdminUsers = ({ user }: AdminUsersProps) => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: USERS_PAGE_SIZE,
    total: 0,
    totalPages: 1,
  });
  const [stats, setStats] = useState({
    total: 0,
    admin_count: 0,
    editor_count: 0,
    manager_count: 0,
    client_count: 0,
  });

  // Стейт для модального окна создания пользователя
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newUserData, setNewUserData] = useState({
    username: "",
    email: "",
    password: "",
    role: "client" as UserRole,
  });
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadUsers();
  }, [pagination.page, debouncedSearchQuery, selectedFilter]);

  useEffect(() => {
    const t = setTimeout(() => {
      setPagination((prev) => ({ ...prev, page: 1 }));
      setDebouncedSearchQuery(searchQuery.trim());
    }, 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const result = await authService.getUsersList({
        page: pagination.page,
        limit: USERS_PAGE_SIZE,
        search: debouncedSearchQuery,
        role: selectedFilter,
      });
      setUsers(result.users || []);
      setPagination(result.pagination || {
        page: 1,
        limit: USERS_PAGE_SIZE,
        total: 0,
        totalPages: 1,
      });
      setStats(result.stats || {
        total: 0,
        admin_count: 0,
        editor_count: 0,
        manager_count: 0,
        client_count: 0,
      });
    } catch (error) {
      console.error("Error loading users:", error);
      toast.error("Не удалось загрузить пользователей");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = useMemo(() => users, [users]);

  const handleDeleteUser = (userToDelete: User) => {
    setUserToDelete(userToDelete);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;

    setIsLoading(true);
    try {
      const success = await authService.deleteUser(userToDelete.id);
      if (success) {
        loadUsers();
      }
    } catch (error) {
      console.error("Error deleting user:", error);
    } finally {
      setIsLoading(false);
      setUserToDelete(null);
    }
  };

  const handleRoleUpdate = async (targetUser: User, role: string) => {
    if (!targetUser?.id || !role || role === targetUser.role) return;
    const ok = await authService.updateUserRole(targetUser.id, role as UserRole);
    if (ok) {
      toast.success("Роль обновлена");
      loadUsers();
    }
  };

  // Обработчик создания нового пользователя
  const handleCreateUser = async () => {
    // Проверка валидности данных
    if (!newUserData.username.trim()) {
      toast.error("Введите имя пользователя");
      return;
    }

    if (!newUserData.email.trim() || !newUserData.email.includes("@")) {
      toast.error("Введите корректный email");
      return;
    }

    if (!newUserData.password.trim() || newUserData.password.length < 6) {
      toast.error("Пароль должен содержать минимум 6 символов");
      return;
    }

    setIsCreating(true);

    try {
      const createdUser = await authService.createUser(
        newUserData.username,
        newUserData.email,
        newUserData.password,
        newUserData.role,
      );

      if (createdUser) {
        // Обновляем список пользователей
        loadUsers();
        // Сбрасываем форму и закрываем диалог
        setNewUserData({
          username: "",
          email: "",
          password: "",
          role: "client",
        });
        setIsCreateDialogOpen(false);
      }
    } catch (error) {
      console.error("Error creating user:", error);
    } finally {
      setIsCreating(false);
    }
  };

  // Обработчик изменения полей формы
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewUserData({
      ...newUserData,
      [name]: value,
    });
  };

  // Обработчик изменения роли
  const handleRoleChange = (value: string) => {
    setNewUserData({
      ...newUserData,
      role: value as UserRole,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="flex items-center">
          <AdminSectionHeader
            title="Пользователи"
            description="Управление пользователями, ролями и доступами"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={loadUsers} disabled={isLoading}>
            {isLoading ? "Загрузка..." : "Обновить"}
          </Button>

          <Button onClick={() => navigate("/account/")} className="sm:hidden">
            <Users className="h-4 w-4 mr-2" />
            Управление
          </Button>

          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button className="hidden sm:flex">
                <PlusCircle className="h-4 w-4 mr-2" />
                Добавить пользователя
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Создать нового пользователя</DialogTitle>
                <DialogDescription>
                  Заполните информацию о новом пользователе. После создания
                  пользователю будет отправлено приглашение на указанный email.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="username" className="text-right">
                    Имя
                  </Label>
                  <Input
                    id="username"
                    name="username"
                    value={newUserData.username}
                    onChange={handleInputChange}
                    className="col-span-3"
                    placeholder="Имя пользователя"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={newUserData.email}
                    onChange={handleInputChange}
                    className="col-span-3"
                    placeholder="email@example.com"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="password" className="text-right">
                    Пароль
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={newUserData.password}
                    onChange={handleInputChange}
                    className="col-span-3"
                    placeholder="••••••••"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="role" className="text-right">
                    Роль
                  </Label>
                  <Select
                    value={newUserData.role}
                    onValueChange={handleRoleChange}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Выберите роль" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="client">
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-2 text-gray-500" />
                          <span>Клиент</span>
                        </div>
                      </SelectItem>

                      <SelectItem value="editor">
                        <div className="flex items-center">
                          <Edit className="h-4 w-4 mr-2 text-blue-500" />
                          <span>Редактор</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="manager">
                        <div className="flex items-center">
                          <Settings className="h-4 w-4 mr-2 text-green-500" />
                          <span>Менеджер</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="admin">
                        <div className="flex items-center">
                          <Shield className="h-4 w-4 mr-2 text-red-500" />
                          <span>Администратор</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Отмена
                </Button>
                <Button
                  type="submit"
                  onClick={handleCreateUser}
                  disabled={isCreating}
                >
                  {isCreating ? "Создание..." : "Создать пользователя"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card className="bg-white shadow-sm hover:shadow transition-shadow">
          <CardHeader className="py-4">
            <CardTitle className="flex items-center text-lg">
              <Users className="mr-2 text-primary" />
              Пользователи
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
            <p className="text-muted-foreground text-sm">Всего</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm hover:shadow transition-shadow">
          <CardHeader className="py-4">
            <CardTitle className="flex items-center text-lg">
              <Shield className="mr-2 text-red-500" />
              Админы
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.admin_count}</div>
            <p className="text-muted-foreground text-sm">Администраторы</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm hover:shadow transition-shadow">
          <CardHeader className="py-4">
            <CardTitle className="flex items-center text-lg">
              <Edit className="mr-2 text-blue-500" />
              Редакторы
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.editor_count}</div>
            <p className="text-muted-foreground text-sm">Редакторы</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm hover:shadow transition-shadow">
          <CardHeader className="py-4">
            <CardTitle className="flex items-center text-lg">
              <Settings className="mr-2 text-green-500" />
              Менеджеры
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.manager_count}</div>
            <p className="text-muted-foreground text-sm">Менеджеры</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm hover:shadow transition-shadow">
          <CardHeader className="py-4">
            <CardTitle className="flex items-center text-lg">
              <Users className="mr-2 text-gray-500" />
              Клиенты
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.client_count}</div>
            <p className="text-muted-foreground text-sm">Клиенты</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Управление пользователями</CardTitle>
              <CardDescription>
                Просмотр и управление пользователями системы
              </CardDescription>
            </div>

            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Поиск пользователей..."
                  className="pl-8 w-full sm:w-[250px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    Фильтр
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px]">
                  <DropdownMenuItem
                    onClick={() => {
                      setSelectedFilter("all");
                      setPagination((prev) => ({ ...prev, page: 1 }));
                    }}
                    className={selectedFilter === "all" ? "bg-muted" : ""}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Все пользователи
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      setSelectedFilter("admin");
                      setPagination((prev) => ({ ...prev, page: 1 }));
                    }}
                    className={selectedFilter === "admin" ? "bg-muted" : ""}
                  >
                    <Shield className="h-4 w-4 mr-2 text-red-500" />
                    Администраторы
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => {
                      setSelectedFilter("editor");
                      setPagination((prev) => ({ ...prev, page: 1 }));
                    }}
                    className={selectedFilter === "editor" ? "bg-muted" : ""}
                  >
                    <Edit className="h-4 w-4 mr-2 text-blue-500" />
                    Редакторы
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      setSelectedFilter("manager");
                      setPagination((prev) => ({ ...prev, page: 1 }));
                    }}
                    className={selectedFilter === "manager" ? "bg-muted" : ""}
                  >
                    <Settings className="h-4 w-4 mr-2 text-green-500" />
                    Менеджеры
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      setSelectedFilter("client");
                      setPagination((prev) => ({ ...prev, page: 1 }));
                    }}
                    className={selectedFilter === "client" ? "bg-muted" : ""}
                  >
                    <Users className="h-4 w-4 mr-2 text-gray-500" />
                    Клиенты
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Экспорт
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Экспорт в CSV</DropdownMenuItem>
                  <DropdownMenuItem>Экспорт в Excel</DropdownMenuItem>
                  <DropdownMenuItem>Экспорт в PDF</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-muted-foreground">
                  Загрузка пользователей...
                </p>
              </div>
            </div>
          ) : filteredUsers.length > 0 ? (
            <>
              <ScrollArea className="h-[500px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Пользователь</TableHead>
                    <TableHead className="hidden sm:table-cell">
                      Email
                    </TableHead>
                    <TableHead className="hidden md:table-cell">Роль</TableHead>
                    <TableHead className="hidden lg:table-cell">
                      Статус
                    </TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarFallback>
                              {user.username
                                ? user.username.substring(0, 2).toUpperCase()
                                : "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {user.username ||
                                "Пользователь " + user.id.substring(0, 5)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              ID: {user.id.substring(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{user.email || "—"}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <UserRoleBadge role={user.role} />
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="flex items-center">
                          <Badge
                            variant="outline"
                            className="bg-green-100 text-green-800"
                          >
                            <Check className="h-3.5 w-3.5 mr-1" />
                            Активный
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Select
                            value={user.role}
                            onValueChange={(value) => handleRoleUpdate(user, value)}
                          >
                            <SelectTrigger className="w-[140px] h-8">
                              <SelectValue placeholder="Роль" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Администратор</SelectItem>
                              <SelectItem value="editor">Редактор</SelectItem>
                              <SelectItem value="manager">Менеджер</SelectItem>
                              <SelectItem value="client">Клиент</SelectItem>
                            </SelectContent>
                          </Select>
                          {user.role !== "admin" && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                                  onClick={() => handleDeleteUser(user)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Подтвердите удаление
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Вы действительно хотите удалить пользователя{" "}
                                    {user.username}? Это действие нельзя
                                    отменить.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Отмена</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={confirmDeleteUser}
                                    className="bg-red-500 hover:bg-red-600"
                                  >
                                    Удалить
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </ScrollArea>

              <AdminPagination
                page={pagination.page}
                totalPages={pagination.totalPages}
                total={pagination.total}
                isLoading={isLoading}
                onPrev={() =>
                  setPagination((prev) => ({
                    ...prev,
                    page: Math.max(prev.page - 1, 1),
                  }))
                }
                onNext={() =>
                  setPagination((prev) => ({
                    ...prev,
                    page: Math.min(prev.page + 1, prev.totalPages),
                  }))
                }
              />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground opacity-40" />
              <h3 className="mt-4 text-lg font-medium">
                Пользователи не найдены
              </h3>
              <p className="text-muted-foreground mt-2 max-w-md">
                {searchQuery || selectedFilter !== "all"
                  ? "Попробуйте изменить параметры поиска или фильтра."
                  : "В системе пока нет пользователей."}
              </p>
              <Button variant="outline" className="mt-4" onClick={loadUsers}>
                Обновить список
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUsers;
