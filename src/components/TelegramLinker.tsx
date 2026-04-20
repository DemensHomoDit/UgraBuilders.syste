import { useState, useEffect } from "react";
import axios from "axios";
import { db } from "@/integrations/db/client";

export default function TelegramLinker() {
  const [link, setLink] = useState("");
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [userId, setUserId] = useState("");

  // Универсальная функция для получения заголовка Authorization
  const getAuthHeaders = async () => {
    const { data } = await db.auth.getSession();
    const token = data.session?.access_token || "";
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchAccounts = async () => {
    setLoading(true);
    setError("");
    try {
      const headers = await getAuthHeaders();
      // Проверяем, что userId доступен
      if (!userId) {
        setError("ID пользователя не определен");
        setLoading(false);
        return;
      }
      
      const res = await axios.get(`/api/telegram/accounts?userId=${userId}`, { headers });
      setAccounts(res.data.accounts || []);
    } catch (e) {
      setError("Ошибка загрузки аккаунтов");
      console.error("fetchAccounts error:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const headers = await getAuthHeaders();
      
      // Проверяем, что userId доступен
      if (!userId) {
        setError("ID пользователя не определен");
        setLoading(false);
        return;
      }
      
      const res = await axios.post("/api/telegram/generate-token", { userId }, { headers });
      setLink(res.data.link);
      setSuccess("Ссылка сгенерирована");
    } catch (e) {
      setError("Ошибка генерации ссылки");
    } finally {
      setLoading(false);
    }
  };

  const handleUnlink = async (telegram_user_id: string) => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const headers = await getAuthHeaders();
      
      // Проверяем, что userId доступен
      if (!userId) {
        setError("ID пользователя не определен");
        setLoading(false);
        return;
      }
      
      await axios.post("/api/telegram/unlink", { userId, telegram_user_id }, { headers });
      setSuccess("Аккаунт отвязан");
      fetchAccounts();
    } catch (e) {
      setError("Ошибка отвязки аккаунта");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Получаем access_token и только потом вызываем fetchAccounts
    db.auth.getSession().then(({ data }) => {
      if (data.session) {
        // Получаем ID пользователя из сессии
        const user = data.session.user;
        if (user && user.id) {
          setUserId(user.id);
        } else {
          setError("ID пользователя не найден в сессии");
        }
      } else {
        setError("Нет активной сессии Supabase");
      }
    });
  }, []);
  
  // Вызываем fetchAccounts при изменении userId
  useEffect(() => {
    if (userId) {
      fetchAccounts();
    }
  }, [userId]);

  return (
    <div className="max-w-md mx-auto p-4 border rounded-lg bg-white shadow">
      <h2 className="text-lg font-bold mb-2">Привязка Telegram</h2>
      <button
        onClick={handleGenerate}
        disabled={loading || !userId}
        className="bg-primary text-white px-4 py-2 rounded mb-4"
      >
        Привязать Telegram
      </button>
      {link && (
        <div className="mb-4">
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            Открыть Telegram для привязки
          </a>
        </div>
      )}
      {success && <div className="text-green-600 mb-2">{success}</div>}
      {error && <div className="text-red-600 mb-2">{error}</div>}
      <h3 className="font-semibold mt-4 mb-2">Ваши Telegram-аккаунты:</h3>
      <ul>
        {accounts.length === 0 && <li className="text-gray-500">Нет привязанных аккаунтов</li>}
        {accounts.map((acc: any) => (
          <li key={acc.telegram_user_id} className="flex items-center gap-2 mb-1">
            @{acc.username || acc.telegram_user_id}
            <button
              onClick={() => handleUnlink(acc.telegram_user_id)}
              className="text-xs text-red-600 underline ml-2"
              disabled={loading}
            >
              Отвязать
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
} 