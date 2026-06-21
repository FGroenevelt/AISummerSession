#!/usr/bin/env python3
"""Genereert de voice-over via ElevenLabs (with-timestamps) en vult de
per-beat timing in script_beats.json. 'AI' wordt als 'A.I.' naar de TTS
gestuurd zodat het Engels (gespeld) klinkt; op het scherm blijft het 'AI'.

Gebruik:  .venv/bin/python generate_voiceover.py
Vereist:  /tmp/el_key met de ElevenLabs API-key.
"""
import json, base64, urllib.request, os, shutil

KEY = open('/tmp/el_key').read().strip()
VOICE_ID = "onwK4e9ZLuTAKqWW03F9"  # Daniel (Brits) — leest Engels 'A.I.'
MODEL = "eleven_multilingual_v2"
# Heroïsch/dynamisch + vlot: lagere stability = meer expressie, style omhoog,
# speed iets boven 1.0. Speed valt terug als het model 'm niet accepteert.
SETTINGS = {"stability": 0.40, "similarity_boost": 0.85, "style": 0.45,
            "use_speaker_boost": True, "speed": 1.10}


def tts_text(display: str) -> str:
    # 'AI' (acroniem) -> 'A.I.' zodat een Engelse stem het spelt.
    return display.replace("AI", "A.I.")


def generate(text, settings):
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}/with-timestamps"
    body = json.dumps({"text": text, "model_id": MODEL,
                       "voice_settings": settings}).encode()
    req = urllib.request.Request(url, data=body, method="POST", headers={
        "xi-api-key": KEY, "Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=120) as r:
        return json.load(r)


def main():
    beats = json.load(open('script_beats.json'))
    B = beats['beats']

    full, spans = "", []
    for i, b in enumerate(B):
        if i:
            full += " "
        s = len(full)
        full += tts_text(b['text'])
        spans.append((s, len(full)))

    try:
        data = generate(full, SETTINGS)
    except urllib.error.HTTPError as e:
        if e.code == 422:  # speed niet ondersteund -> opnieuw zonder
            s2 = {k: v for k, v in SETTINGS.items() if k != "speed"}
            print("speed niet geaccepteerd; opnieuw zonder speed-param")
            data = generate(full, s2)
        else:
            raise

    audio = base64.b64decode(data["audio_base64"])
    open("voiceover.mp3", "wb").write(audio)
    shutil.copy("voiceover.mp3",
                os.path.expanduser("~/Downloads/kplusv-voiceover-Daniel.mp3"))

    al = data["alignment"]
    st, en = al["character_start_times_seconds"], al["character_end_times_seconds"]
    for b, (s, e) in zip(B, spans):
        b['start'] = round(st[min(s, len(st) - 1)], 3)
        b['duration'] = round(en[min(e - 1, len(en) - 1)] - b['start'], 3)

    total = round(en[-1], 2)
    beats['meta']['timing_filled'] = True
    beats['meta']['voice'] = f"ElevenLabs Daniel ({VOICE_ID}), {MODEL}"
    beats['meta']['voice_settings'] = SETTINGS
    beats['meta']['total_duration_sec'] = total
    json.dump(beats, open('script_beats.json', 'w'), ensure_ascii=False, indent=2)

    print(f"OK — {len(audio)} bytes | duur {total}s | {len(B)} beats")
    for b in B:
        print(f"{b['start']:6.2f} | {b['duration']:4.2f} | {b['text']}")


if __name__ == "__main__":
    main()
