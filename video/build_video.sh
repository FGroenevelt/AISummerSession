#!/bin/bash
# Bouwt intro-video.mp4: render frames (Puppeteer) -> mux met muziek (ffmpeg).
set -e
cd "$(dirname "$0")"

echo "▶ 1/2  Frames renderen…"
node render.mjs

DUR=$(cat frames/duration.txt)
echo "▶ 2/2  Frames + muziek samenvoegen (duur ${DUR}s)…"

# H.264, web-geoptimaliseerd. Muziek bijgeknipt op videoduur, met fade in/out.
ffmpeg -y -loglevel error \
  -framerate 30 -i frames/f_%05d.png \
  -i music/inspired-kevinmacleod.mp3 \
  -filter_complex "[1:a]afade=t=in:st=0:d=0.8,afade=t=out:st=$(echo "$DUR-1.2"|bc):d=1.2[a]" \
  -map 0:v -map "[a]" \
  -t "$DUR" \
  -c:v libx264 -pix_fmt yuv420p -crf 20 -preset medium -movflags +faststart \
  -c:a aac -b:a 160k \
  intro-video.mp4

echo "✅ Klaar: $(pwd)/intro-video.mp4"
ls -lh intro-video.mp4
