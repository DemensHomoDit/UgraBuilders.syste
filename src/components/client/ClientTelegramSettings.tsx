import { useState, useEffect } from "react";
import { User } from "@/services/types/authTypes";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Send,
  AlertCircle,
  Trash2,
  BellRing,
  Unlink,
  Link,
  Check,
  Plus,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE ?? "";

interface TelegramAccount {
  telegram_user_id: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  created_at: string;
  is_active: boolean;
}

interface ClientTelegramSettingsProps {
  user: User;
}

const ClientTelegramSettings = ({ user }: ClientTelegramSettingsProps) => {
  const [accounts, setAccounts] = useState<TelegramAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [generatingLink, setGeneratingLink] = useState(false);
  const [unlinking, setUnlinking] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [telegramLink, setTelegramLink] = useState<string | null>(null);

  useEffect(() => {
    fetchAccounts();
  }, [user]);

  // Получаем заголовок авторизации
  const getAuthHeaders = () => {
    const token = localStorage.getItem("mongo_auth_token") ?? "";
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Загрузка привязанных аккаунтов
  const fetchAccounts = async () => {
    setLoading(true);
    setError(null);
    try {
      const headers = getAuthHeaders();

      // Проверяем, что userId доступен
      if (!user.id) {
        setError("ID пользователя не определен");
        setLoading(false);
        return;
      }

      const res = await axios.get(`${API_BASE}/api/telegram/accounts?userId=${user.id}`, {
        headers,
      });
      setAccounts(res.data.accounts || []);
    } catch (e) {
      setError("Не удалось загрузить привязанные аккаунты");
    } finally {
      setLoading(false);
    }
  };

  // Генерация ссылки для привязки
  const generateLink = async () => {
    setGeneratingLink(true);
    setError(null);
    setTelegramLink(null);

    try {
      const headers = getAuthHeaders();

      // Проверяем, что userId доступен
      if (!user.id) {
        setError("ID пользователя не определен");
        setGeneratingLink(false);
        return;
      }

      const res = await axios.post(
        `${API_BASE}/api/telegram/link`,
        { userId: user.id },
        { headers },
      );
      setTelegramLink(res.data.link);

      // Копируем ссылку в буфер обмена
      if (res.data.link) {
        navigator.clipboard
          .writeText(res.data.link)
          .then(() =>
            toast("Ссылка скопирована", {
              description: "Ссылка для привязки скопирована в буфер обмена",
            }),
          )
          .catch(() => {});
      }
    } catch (e) {
      setError("Не удалось сгенерировать ссылку для привязки");
      toast("Ошибка при генерации ссылки", {
        description: "Пожалуйста, попробуйте позже",
      });
    } finally {
      setGeneratingLink(false);
    }
  };

  // Отвязка аккаунта
  const unlinkAccount = async (telegramUserId: string) => {
    setUnlinking(telegramUserId);
    setError(null);

    try {
      const headers = getAuthHeaders();

      // Проверяем, что userId доступен
      if (!user.id) {
        setError("ID пользователя не определен");
        setUnlinking(null);
        return;
      }

      await axios.post(
        `${API_BASE}/api/telegram/unlink`,
        {
          userId: user.id,
          telegram_user_id: telegramUserId,
        },
        { headers },
      );

      toast("Аккаунт отвязан", {
        description: "Telegram-аккаунт успешно отвязан от вашего профиля",
      });
      fetchAccounts();
    } catch (e) {
      setError("Не удалось отвязать аккаунт");
      toast("Ошибка при отвязке аккаунта", {
        description: "Пожалуйста, попробуйте позже",
      });
    } finally {
      setUnlinking(null);
    }
  };

  // Форматирование имени пользователя Telegram
  const formatTelegramName = (account: TelegramAccount) => {
    if (account.username) {
      return `@${account.username}`;
    }

    const name = [account.first_name, account.last_name]
      .filter(Boolean)
      .join(" ");
    return name || `ID: ${account.telegram_user_id}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Send className="mr-2 text-primary" />
          Telegram-уведомления
        </CardTitle>
        <CardDescription>Управление уведомлениями в Telegram</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Описание и преимущества */}
        <div className="bg-primary/5 p-4 rounded-lg">
          <h3 className="text-sm font-medium mb-2 flex items-center">
            <BellRing className="w-4 h-4 mr-2 text-primary" />
            Мгновенные уведомления
          </h3>
          <p className="text-sm text-muted-foreground">
            Привяжите свой Telegram-аккаунт, чтобы получать мгновенные
            уведомления об обновлениях вашего проекта и важных событиях.
          </p>
        </div>

        {/* Ошибка */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Ошибка</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Список привязанных аккаунтов */}
        <div>
          <h3 className="font-medium mb-4">Привязанные аккаунты:</h3>
          {loading ? (
            <div className="flex items-center justify-center p-4">
              <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full mr-2"></div>
              <span>Загрузка...</span>
            </div>
          ) : accounts.length > 0 ? (
            <div className="space-y-3">
              {accounts.map((account) => (
                <div
                  key={account.telegram_user_id}
                  className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg"
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                      <Send className="h-5 w-5" />
                    </div>
                    <div className="ml-3">
                      <p className="font-medium">
                        {formatTelegramName(account)}
                      </p>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <span>
                          Привязан:{" "}
                          {new Date(account.created_at).toLocaleDateString()}
                        </span>
                        {account.is_active && (
                          <Badge
                            variant="outline"
                            className="ml-2 bg-green-100 text-green-800 border-none"
                          >
                            <Check className="w-3 h-3 mr-1" /> Активен
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => unlinkAccount(account.telegram_user_id)}
                    disabled={unlinking === account.telegram_user_id}
                  >
                    {unlinking === account.telegram_user_id ? (
                      <div className="animate-spin h-4 w-4 border-2 border-red-500 border-t-transparent rounded-full mr-1"></div>
                    ) : (
                      <Unlink className="h-4 w-4 mr-1" />
                    )}
                    Отвязать
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-muted p-4 rounded-lg text-center">
              <AlertTriangle className="h-8 w-8 mx-auto text-amber-500 mb-2" />
              <p className="mb-1 font-medium">Нет привязанных аккаунтов</p>
              <p className="text-sm text-muted-foreground mb-4">
                Вы не будете получать уведомления о ходе строительства
              </p>
            </div>
          )}
        </div>

        {/* Генерация ссылки для привязки */}
        <div>
          <Button
            onClick={generateLink}
            disabled={generatingLink}
            className="w-full"
          >
            {generatingLink ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2"></div>
                Генерация ссылки...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Привязать Telegram
              </>
            )}
          </Button>

          {telegramLink && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm mb-2 text-blue-700">
                Ссылка для привязки готова:
              </p>
              <a
                href={telegramLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-blue-600 hover:text-blue-800 hover:underline"
              >
                <Link className="h-4 w-4 mr-1" />
                Открыть Telegram для привязки
              </a>
              <p className="text-xs text-muted-foreground mt-2">
                Ссылка действительна в течение 15 минут. После привязки обновите
                эту страницу.
              </p>
            </div>
          )}
        </div>

        {/* Информация о уведомлениях */}
        <Alert variant="warning" className="bg-amber-50 border-amber-200">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800">Важно</AlertTitle>
          <AlertDescription className="text-amber-700">
            Вы можете привязать несколько Telegram-аккаунтов к одному профилю.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default ClientTelegramSettings;
