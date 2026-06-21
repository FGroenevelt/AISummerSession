# Credits — intro-video

## Muziek
- **"Inspired"** — Kevin MacLeod (incompetech.com)
- Licentie: **Creative Commons Attribution 4.0** (CC BY 4.0)
  <https://creativecommons.org/licenses/by/4.0/>
- Verplichte naamsvermelding staat in de tool onder de video (en hier).

## Beeld
- KplusV-logo en huisstijlkleuren: eigendom van KplusV.
- Lettertype: **Inter** (SIL Open Font License) als benadering van het
  kplusv.nl-huisfont.

## Hoe de video is gemaakt
1. `script.txt` / `script_beats.json` — script en beats.
2. `public/intro.html` — kinetic-typography-animatie (deterministische tijdlijn).
3. `render.mjs` — Puppeteer rendert frame-voor-frame (1920×1080, 30 fps).
4. `build_video.sh` — ffmpeg voegt frames + muziek samen tot `intro-video.mp4`.
5. Web-versie (720p) + poster staan in `public/` en worden op de homepage getoond.

> Voice-over is bewust weggelaten: de video draait op muziek + tekst-in-beeld.
