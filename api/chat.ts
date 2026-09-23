import type { VercelRequest, VercelResponse } from '@vercel/node';

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
  }

  const { messages, model = 'llama3-8b-8192' } = req.body || {};

  const modelsToTry = [
    model,
    'llama-3.1-8b-instant',
    'mixtral-8x7b-32768',
    'openai/gpt-oss-20b',
  ];

  const groqApiKey = process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY || '';

  for (const targetModel of modelsToTry) {
    const maxRetries = 3;
    let baseDelay = 1000;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(groqApiKey ? { Authorization: `Bearer ${groqApiKey}` } : {}),
          },
          body: JSON.stringify({
            model: targetModel,
            messages,
            temperature: 0.7,
            max_tokens: 1024,
          }),
        });

        if (response.status === 429 || response.status === 503) {
          const waitTime = baseDelay * Math.pow(2, attempt - 1) + Math.floor(Math.random() * 300);
          console.warn(`[Chat Proxy] Model ${targetModel} 429 Rate Limit on attempt ${attempt}. Retrying in ${waitTime}ms...`);
          if (attempt < maxRetries) {
            await sleep(waitTime);
            continue;
          }
          break; // Try next model
        }

        if (response.ok) {
          const data = await response.json();
          return res.status(200).json(data);
        }
        break; // Other error, try next model
      } catch (err) {
        if (attempt < maxRetries) {
          await sleep(baseDelay * Math.pow(2, attempt - 1));
        }
      }
    }
  }

  // Graceful fallback response
  return res.status(200).json({
    choices: [
      {
        message: {
          role: 'assistant',
          content:
            '⚡ RANA X Neural Engine is experiencing high telemetry load. Keep up your recovery, hydration, and progressive overload protocols while neural buffers synchronize.',
        },
      },
    ],
    fallbackNotice: true,
  });
}
