import { getAssetFromKV } from '@cloudflare/kv-asset-handler';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === '/api/ask' && request.method === 'POST') {
      try {
        let question;
        try {
          const json = await request.json();
          question = json.question;
        } catch (e) {
          return new Response(
            JSON.stringify({ error: 'Invalid JSON in request body' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
          );
        }

        // Ensure a valid, non-empty question string
        if (typeof question !== 'string' || question.trim() === '') {
          return new Response(
            JSON.stringify({ error: 'Question must be a non-empty string' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
          );
        }


        // Basic rate limiting by client IP
        const ip =
          request.headers.get('CF-Connecting-IP') ||
          request.headers.get('X-Forwarded-For') ||
          'unknown';
        const key = `ip:${ip}`;
        let count = parseInt((await env.RATE_LIMIT.get(key)) || '0');
        if (count >= 20) {
          return new Response(
            JSON.stringify({ error: 'Rate limit exceeded' }),
            { status: 429, headers: { 'Content-Type': 'application/json' } }
          );
        }
        count++;
        await env.RATE_LIMIT.put(key, String(count), { expirationTtl: 60 });

        const openaiKey = env.OPENAI_API_KEY || process.env.OPENAI_API_KEY;
        if (!openaiKey) {
          return new Response(
            JSON.stringify({ error: 'Missing OpenAI API key' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
          );
        }

        // Debug: log the openaiKey presence (do not log the key itself)
        console.log(`OpenAI API key is set: ${!!openaiKey}`);

        const aiRes = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openaiKey}`
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
              { role: 'system', content: 'You are an AI DJ assistant for TheBadGuyHimself.' },
              { role: 'user', content: question }
            ]
          })
        });

        if (!aiRes.ok) {
          return new Response(
            JSON.stringify({ error: `OpenAI API error: ${aiRes.statusText}` }),
            { status: aiRes.status, headers: { 'Content-Type': 'application/json' } }
          );
        }

        const aiResJson = await aiRes.json();
        return new Response(JSON.stringify(aiResJson), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (err) {
        // Log the error for debugging
        console.error('Error during AI request:', err);
        return new Response(JSON.stringify({ error: 'AI request failed' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    try {
      return await getAssetFromKV({ request, waitUntil: ctx.waitUntil.bind(ctx) });
    } catch (e) {
      try {
        const notFoundRequest = new Request(url.origin + '/404.html', request);
        const res = await getAssetFromKV({ request: notFoundRequest, waitUntil: ctx.waitUntil.bind(ctx) });
        return new Response(res.body, { ...res, status: 404 });
      } catch (err) {
        const pathname = url.pathname;
        return new Response(`"${pathname}" not found`, { status: 404, statusText: 'not found' });
      }
    }
  }
};
