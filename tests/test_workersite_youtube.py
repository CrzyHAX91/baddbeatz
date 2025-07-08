import subprocess
import json
from pathlib import Path

WORKER_PATH = Path(__file__).resolve().parents[1] / 'workers-site' / 'index.js'

JS_CODE = f"""
import worker from '{WORKER_PATH.as_posix()}';
const req = new Request('https://example.com/api/youtube?channel_id=cid');
global.fetch = async () => ({{
  ok: true,
  json: async () => ({{ items: [{{ id: {{ videoId: 'abc' }}, snippet: {{ title: 'T' }} }}] }})
}});
const res = await worker.fetch(req, {{ YOUTUBE_API_KEY: 'k' }}, {{}});
res.json().then(j => console.log(JSON.stringify(j)));
"""

def test_workersite_youtube(tmp_path):
    script = tmp_path / 'run.mjs'
    script.write_text(JS_CODE)
    result = subprocess.run(
        ['node', '--experimental-vm-modules', str(script)],
        capture_output=True, text=True
    )
    assert result.returncode == 0, result.stderr
    data = json.loads(result.stdout.strip())
    assert data['videos'][0]['id'] == 'abc'
