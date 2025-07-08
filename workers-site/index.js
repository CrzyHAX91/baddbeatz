import { getAssetFromKV } from '@cloudflare/kv-asset-handler';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === '/api/ask' && request.method === 'POST') {
      try {
        const { question } = await request.json();

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
        const count = parseInt((await env.RATE_LIMIT.get(key)) || '0');
        if (count >= 20) {
          return new Response(
            JSON.stringify({ error: 'Rate limit exceeded' }),
            { status: 429, headers: { 'Content-Type': 'application/json' } }
          );
        }
        await env.RATE_LIMIT.put(key, String(count + 1), { expirationTtl: 60 });

        const openaiKey = env.OPENAI_API_KEY || process.env.OPENAI_API_KEY;
        if (!openaiKey) {
          return new Response(
            JSON.stringify({ error: 'Missing OpenAI API key' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
          );
        }

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

        const aiResJson = await aiRes.json();
        return new Response(JSON.stringify(aiResJson), {
          status: aiRes.status,
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: 'AI request failed' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    if (url.pathname === '/api/youtube' && request.method === 'GET') {
      const channelId = url.searchParams.get('channel_id') || url.searchParams.get('channelId');
      if (!channelId) {
        return new Response(
          JSON.stringify({ error: 'channel_id required' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
      const apiKey = env.YOUTUBE_API_KEY || process.env.YOUTUBE_API_KEY;
      if (!apiKey) {
        return new Response(
          JSON.stringify({ error: 'Missing YouTube API key' }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }
      const apiUrl = new URL('https://www.googleapis.com/youtube/v3/search');
      apiUrl.searchParams.set('key', apiKey);
      apiUrl.searchParams.set('channelId', channelId);
      apiUrl.searchParams.set('part', 'snippet');
      apiUrl.searchParams.set('order', 'date');
      apiUrl.searchParams.set('type', 'video');
      apiUrl.searchParams.set('maxResults', '5');
      const apiRes = await fetch(apiUrl.toString());
      if (!apiRes.ok) {
        return new Response(
          JSON.stringify({ error: 'Failed to fetch videos' }),
          { status: apiRes.status, headers: { 'Content-Type': 'application/json' } }
        );
      }
      const { items = [] } = await apiRes.json();
      const videos = items
        .filter(item => item.id && item.id.videoId)
        .map(item => ({ id: item.id.videoId, title: item.snippet.title }));
      return new Response(JSON.stringify({ videos }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
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
