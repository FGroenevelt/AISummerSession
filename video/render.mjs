// Rendert intro.html frame-voor-frame naar PNG's via Puppeteer.
// Deterministisch: per frame roepen we window.seek(t) aan en maken een shot.
// Daarna zet build_video.sh de frames + muziek met ffmpeg om naar mp4.
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', 'public'); // serveert /intro.html + /logo
const FPS = 30;
const W = 1920, H = 1080;
const TAIL = 900; // ms extra stilstand op het eindframe

const TYPES = { '.html':'text/html', '.webp':'image/webp', '.js':'text/javascript',
  '.css':'text/css', '.svg':'image/svg+xml', '.png':'image/png' };

const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/') p = '/index.html';
  const f = path.join(ROOT, p);
  fs.readFile(f, (e, d) => {
    if (e) { res.writeHead(404); res.end('not found'); return; }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' });
    res.end(d);
  });
});

const framesDir = path.join(__dirname, 'frames');
fs.rmSync(framesDir, { recursive: true, force: true });
fs.mkdirSync(framesDir, { recursive: true });

await new Promise(r => server.listen(0, r));
const port = server.address().port;

const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: W, height: H, deviceScaleFactor: 1 });
await page.goto(`http://localhost:${port}/intro.html?render`, { waitUntil: 'networkidle0' });
await page.evaluate(() => document.fonts.ready);
await page.waitForFunction(() => window.__ready === true);

const TOTAL = await page.evaluate(() => window.TOTAL);
const durMs = TOTAL + TAIL;
const nFrames = Math.ceil(durMs / 1000 * FPS);
console.log(`TOTAL=${TOTAL}ms, frames=${nFrames} @ ${FPS}fps (${(nFrames/FPS).toFixed(1)}s)`);

for (let i = 0; i < nFrames; i++) {
  const t = Math.min(i / FPS * 1000, TOTAL - 1);
  await page.evaluate(tt => window.seek(tt), t);
  await page.screenshot({
    path: path.join(framesDir, `f_${String(i).padStart(5, '0')}.png`),
    clip: { x: 0, y: 0, width: W, height: H },
  });
  if (i % 60 === 0) console.log(`  frame ${i}/${nFrames}`);
}

await browser.close();
server.close();
// Schrijf de duur weg zodat ffmpeg de muziek precies kan bijknippen.
fs.writeFileSync(path.join(__dirname, 'frames', 'duration.txt'), String(nFrames / FPS));
console.log('Klaar met renderen.');
