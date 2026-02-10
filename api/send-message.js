export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text, pageTitle } = req.body;
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    return res.status(500).json({ error: 'Server misconfiguration: Missing tokens' });
  }

  if (!text) {
    return res.status(400).json({ error: 'Message text is required' });
  }

  const fullMessage = `<b>📩 New Message from Portfolio</b>\n\n` +
                      `<b>📄 Page:</b> ${pageTitle || 'Unknown'}\n` +
                      `<b>💬 Message:</b>\n${text}`;

  try {
    const telegramResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: fullMessage,
        parse_mode: 'HTML'
      })
    });

    const data = await telegramResponse.json();

    if (!telegramResponse.ok) {
      throw new Error(data.description || 'Telegram API Error');
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Telegram Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
