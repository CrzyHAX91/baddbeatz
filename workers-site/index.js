import { getAssetFromKV } from '@cloudflare/kv-asset-handler';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === '/api/ask' && request.method === 'POST') {
      try {
        const { question } = await request.json();
        const aiRes = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${env.OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
              { role: 'system', content: 'You are an AI DJ assistant for TheBadGuyHimself.' },
              { role: 'user', content: question }
            ]
          })
        });

        return new Response(await aiRes.text(), {
          status: aiRes.status,
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (err) {
        return new Response('AI request failed', { status: 500 });
      }
    }

    try {
      return await getAssetFromKV({ request, waitUntil: ctx.waitUntil.bind(ctx) });
    } catch (e) {
      const pathname = url.pathname;
      return new Response(`"${pathname}" not found`, { status: 404, statusText: 'not found' });
    }
  }
};
