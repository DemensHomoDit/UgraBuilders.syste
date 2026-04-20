const express = require('express');
const fetch = require('node-fetch');
const { v4: uuidv4 } = require('uuid');
const { Pool } = require('pg');

const router = express.Router();

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';

// Warn if any required DB env vars are missing
const REQUIRED_DB_VARS = ['DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];
const missingDbVars = REQUIRED_DB_VARS.filter((v) => !process.env[v]);
if (missingDbVars.length > 0) {
  console.warn(
    `[telegram] WARNING: Missing DB environment variable(s): ${missingDbVars.join(', ')}. ` +
      'Telegram module database operations will fail.',
  );
}

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

async function query(text, params = []) {
  const result = await pool.query(text, params);
  return result.rows;
}

async function generateTelegramToken(req, res) {
  if (!req.body.userId) {
    return res.status(400).json({
      success: false,
      error: 'Не указан ID пользователя',
    });
  }

  const userId = req.body.userId;
  const token = uuidv4();

  try {
    await query(
      'INSERT INTO telegram_link_tokens (id, user_id, token) VALUES ($1, $2, $3)',
      [uuidv4(), userId, token],
    );

    return res.json({
      link: `https://t.me/ugrabuilders_bot?start=${token}`,
    });
  } catch (error) {
    console.error('Error generating token:', error);
    return res.status(500).json({ error: 'Ошибка генерации токена' });
  }
}

async function getTelegramAccounts(req, res) {
  if (!req.query.userId) {
    return res.status(400).json({
      success: false,
      error: 'Не указан ID пользователя',
    });
  }

  try {
    const data = await query(
      `SELECT telegram_user_id, username, first_name, last_name, created_at, is_active
       FROM user_telegram_accounts
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [req.query.userId],
    );

    return res.json({ accounts: data || [] });
  } catch (error) {
    console.error('Error fetching telegram accounts:', error);
    return res.status(500).json({
      success: false,
      error: 'Ошибка получения Telegram-аккаунтов',
    });
  }
}

async function unlinkTelegram(req, res) {
  if (!req.body.userId || !req.body.telegram_user_id) {
    return res.status(400).json({
      success: false,
      error: 'Не указан ID пользователя или Telegram ID',
    });
  }

  try {
    await query(
      'DELETE FROM user_telegram_accounts WHERE user_id = $1 AND telegram_user_id = $2',
      [req.body.userId, String(req.body.telegram_user_id)],
    );

    return res.json({ success: true });
  } catch (error) {
    console.error('Error unlinking telegram account:', error);
    return res.status(500).json({
      success: false,
      error: 'Ошибка отвязки Telegram-аккаунта',
    });
  }
}

async function sendTelegramNotification(userId, message) {
  if (!userId) {
    console.error('Не указан ID пользователя для отправки уведомления');
    return { success: false, error: 'Не указан ID пользователя' };
  }

  let accounts;
  try {
    accounts = await query(
      'SELECT telegram_user_id FROM user_telegram_accounts WHERE user_id = $1 AND is_active = true',
      [userId],
    );
  } catch (error) {
    console.error('Ошибка получения Telegram-аккаунтов:', error);
    return { success: false, error };
  }

  if (!accounts || accounts.length === 0) {
    return { success: false, error: 'Нет привязанных Telegram-аккаунтов' };
  }

  if (!TELEGRAM_BOT_TOKEN) {
    return { success: false, error: 'TELEGRAM_BOT_TOKEN не задан' };
  }

  let allOk = true;
  const results = [];

  for (const acc of accounts) {
    try {
      const response = await fetch(
        `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: acc.telegram_user_id,
            text: message,
            parse_mode: 'HTML',
          }),
        },
      );

      if (!response.ok) {
        allOk = false;
        const errorText = await response.text();
        results.push({
          telegram_user_id: acc.telegram_user_id,
          success: false,
          error: errorText,
        });
        continue;
      }

      results.push({
        telegram_user_id: acc.telegram_user_id,
        success: true,
      });
    } catch (error) {
      allOk = false;
      results.push({
        telegram_user_id: acc.telegram_user_id,
        success: false,
        error: error.message,
      });
    }
  }

  return { success: allOk, results };
}

async function linkTelegramFromBot(req, res) {
  const { token, telegram_user_id, username, first_name, last_name } = req.body;

  if (!token || !telegram_user_id) {
    return res.status(400).json({
      success: false,
      error: 'Не указан токен или Telegram ID',
    });
  }

  try {
    const tokenRows = await query(
      `SELECT * FROM telegram_link_tokens
       WHERE token = $1 AND used = false AND created_at >= NOW() - INTERVAL '10 minutes'
       LIMIT 1`,
      [token],
    );

    const tokenRow = tokenRows[0];

    if (!tokenRow) {
      return res.status(400).json({
        success: false,
        error: 'Ссылка устарела или уже использована.',
      });
    }

    const userId = tokenRow.user_id;
    const existingRows = await query(
      'SELECT user_id FROM user_telegram_accounts WHERE telegram_user_id = $1 LIMIT 1',
      [String(telegram_user_id)],
    );
    const existingAccount = existingRows[0] || null;

    if (existingAccount && existingAccount.user_id !== userId) {
      await query('UPDATE telegram_link_tokens SET used = true WHERE id = $1', [tokenRow.id]);

      return res.status(400).json({
        success: false,
        error: 'Этот Telegram-аккаунт уже привязан к другому пользователю',
      });
    }

    await query(
      `INSERT INTO user_telegram_accounts
         (user_id, telegram_user_id, username, first_name, last_name, is_active, created_at)
       VALUES ($1, $2, $3, $4, $5, true, NOW())
       ON CONFLICT (user_id, telegram_user_id)
       DO UPDATE SET
         username = EXCLUDED.username,
         first_name = EXCLUDED.first_name,
         last_name = EXCLUDED.last_name,
         is_active = true`,
      [
        userId,
        String(telegram_user_id),
        username || null,
        first_name || null,
        last_name || null,
      ],
    );

    await query('UPDATE telegram_link_tokens SET used = true WHERE id = $1', [tokenRow.id]);

    return res.json({ success: true });
  } catch (error) {
    console.error('Ошибка при привязке Telegram аккаунта:', error);
    return res.status(500).json({
      success: false,
      error: 'Ошибка при привязке аккаунта',
    });
  }
}

async function checkTelegramAccount(req, res) {
  const telegramUserId = req.query.telegram_user_id;

  if (!telegramUserId) {
    return res.status(400).json({
      success: false,
      error: 'Не указан Telegram ID пользователя',
    });
  }

  try {
    const accounts = await query(
      'SELECT user_id FROM user_telegram_accounts WHERE telegram_user_id = $1 LIMIT 1',
      [String(telegramUserId)],
    );
    const account = accounts[0] || null;

    if (!account) {
      return res.json({ linked: false });
    }

    const users = await query(
      'SELECT id, username, role FROM user_profiles WHERE id = $1 LIMIT 1',
      [account.user_id],
    );
    const user = users[0] || null;

    return res.json({
      linked: true,
      user_id: account.user_id,
      user: user || { username: `Пользователь ${account.user_id}` },
    });
  } catch (error) {
    console.error('Непредвиденная ошибка при проверке Telegram-аккаунта:', error);
    return res.status(500).json({
      success: false,
      error: 'Непредвиденная ошибка при проверке Telegram-аккаунта',
    });
  }
}

router.get('/accounts', getTelegramAccounts);
router.get('/check', checkTelegramAccount);
router.post('/generate-token', generateTelegramToken);
router.post('/link', generateTelegramToken);
router.post('/unlink', unlinkTelegram);
router.post('/bot-link', linkTelegramFromBot);

module.exports = router;
module.exports.sendTelegramNotification = sendTelegramNotification;
