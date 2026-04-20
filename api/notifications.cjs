const express = require('express');
const telegramApi = require('./telegram.cjs');

const router = express.Router();

class NotificationService {
  async notifyProjectStatusChange(userId, projectId, projectTitle, status) {
    try {
      let statusText;
      switch (status) {
        case 'draft': statusText = 'черновик'; break;
        case 'pending': statusText = 'на рассмотрении'; break;
        case 'published': statusText = 'опубликован'; break;
        case 'rejected': statusText = 'отклонен'; break;
        default: statusText = status;
      }

      const message = `<b>Изменение статуса проекта</b>\n\n` +
        `Проект: <b>${projectTitle}</b>\n` +
        `Новый статус: <b>${statusText}</b>\n` +
        `ID проекта: <code>${projectId}</code>`;

      const result = await telegramApi.sendTelegramNotification(userId, message);
      return result.success;
    } catch (error) {
      console.error('Error sending project status notification:', error);
      return false;
    }
  }

  async notifyClientSaleStageChange(userId, stage) {
    try {
      const message = `<b>Обновление статуса вашего заказа</b>\n\n` +
        `Новый статус: <b>${stage}</b>\n\n` +
        `Если у вас есть вопросы, свяжитесь с вашим менеджером.`;

      const result = await telegramApi.sendTelegramNotification(userId, message);
      return result.success;
    } catch (error) {
      console.error('Error sending client sale stage notification:', error);
      return false;
    }
  }

  async notifyConstructionStageChange(userId, stage) {
    try {
      const message = `<b>Обновление этапа строительства</b>\n\n` +
        `Текущий этап: <b>${stage}</b>\n\n` +
        `Следите за прогрессом в личном кабинете.`;

      const result = await telegramApi.sendTelegramNotification(userId, message);
      return result.success;
    } catch (error) {
      console.error('Error sending construction stage notification:', error);
      return false;
    }
  }

  async notifyNewTask(userId, task) {
    try {
      const message = `<b>Новая задача в графике работ</b>\n\n` +
        `Задача: <b>${task.task}</b>\n` +
        `Дата: <b>${task.date}</b>\n` +
        `Ответственный: ${task.assignedTo || 'Не назначен'}\n\n` +
        `Все задачи доступны в вашем личном кабинете.`;

      const result = await telegramApi.sendTelegramNotification(userId, message);
      return result.success;
    } catch (error) {
      console.error('Error sending new task notification:', error);
      return false;
    }
  }

  async notifyDocumentUploaded(userId, fileName, fileType) {
    try {
      const fileTypeText = fileType === 'contracts' ? 'договор' : 'документ';
      const message = `<b>Загружен новый ${fileTypeText}</b>\n\n` +
        `Имя файла: <b>${fileName}</b>\n\n` +
        `Вы можете просмотреть файл в разделе "${fileType === 'contracts' ? 'Договоры' : 'Документы'}" вашего личного кабинета.`;

      const result = await telegramApi.sendTelegramNotification(userId, message);
      return result.success;
    } catch (error) {
      console.error('Error sending document upload notification:', error);
      return false;
    }
  }

  async sendCustomNotification(userId, title, body) {
    try {
      const message = `<b>${title}</b>\n\n${body}`;
      const result = await telegramApi.sendTelegramNotification(userId, message);
      return result.success;
    } catch (error) {
      console.error('Error sending custom notification:', error);
      return false;
    }
  }
}

const service = new NotificationService();

router.post('/project-status', async (req, res) => {
  const { userId, projectId, projectTitle, status } = req.body || {};
  const success = await service.notifyProjectStatusChange(userId, projectId, projectTitle, status);
  res.json({ success });
});

router.post('/client-stage', async (req, res) => {
  const { userId, stage } = req.body || {};
  const success = await service.notifyClientSaleStageChange(userId, stage);
  res.json({ success });
});

router.post('/construction-stage', async (req, res) => {
  const { userId, stage } = req.body || {};
  const success = await service.notifyConstructionStageChange(userId, stage);
  res.json({ success });
});

router.post('/task', async (req, res) => {
  const { userId, task } = req.body || {};
  const success = await service.notifyNewTask(userId, task || {});
  res.json({ success });
});

router.post('/document', async (req, res) => {
  const { userId, fileName, fileType } = req.body || {};
  const success = await service.notifyDocumentUploaded(userId, fileName, fileType);
  res.json({ success });
});

router.post('/custom', async (req, res) => {
  const { userId, title, body } = req.body || {};
  const success = await service.sendCustomNotification(userId, title, body);
  res.json({ success });
});

module.exports = router;
module.exports.service = service;
