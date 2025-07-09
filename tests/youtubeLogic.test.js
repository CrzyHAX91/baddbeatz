const { getLatestVideos } = require('../youtube_logic.js');

beforeEach(() => {
  global.fetch = jest.fn();
});

test('getLatestVideos fetches videos', async () => {
  const response = {
    ok: true,
    json: () => Promise.resolve({ items: [{ id: { videoId: 'abc' }, snippet: { title: 'Test' } }] })
  };
  global.fetch.mockResolvedValue(response);
  const data = await getLatestVideos('cid', 'key');
  expect(global.fetch).toHaveBeenCalled();
  expect(data.videos[0].id).toBe('abc');
});

test('throws when api key missing', async () => {
  await expect(getLatestVideos('cid', null)).rejects.toThrow('YOUTUBE_API_KEY');
});
