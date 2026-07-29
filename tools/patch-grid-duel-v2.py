from __future__ import annotations

from pathlib import Path
import sys


def replace_once(text: str, old: str, new: str, label: str) -> str:
    if old not in text:
        raise SystemExit(f"Expected {label} text not found")
    return text.replace(old, new, 1)


def replace_between(text: str, start: str, end: str, replacement: str, label: str) -> str:
    start_index = text.find(start)
    if start_index < 0:
        raise SystemExit(f"Start marker not found for {label}")
    end_index = text.find(end, start_index)
    if end_index < 0:
        raise SystemExit(f"End marker not found for {label}")
    return text[:start_index] + replacement + text[end_index:]


def main() -> None:
    if len(sys.argv) != 2:
        raise SystemExit("Usage: patch-grid-duel-v2.py <site-root>")

    site_root = Path(sys.argv[1])
    game_path = site_root / "tictactoe.html"
    game = game_path.read_text(encoding="utf-8")

    game = replace_once(
        game,
        '<p>You are the DISC program. Joshua is the WOPR intelligence controlling this arena through an MCP-style Grid shell. The soundtrack and effects are an original synth composition generated inside your browser.</p>',
        '<p>You are the DISC program. Joshua is the WOPR intelligence controlling this arena through an MCP-style Grid shell.</p>',
        "intro copy",
    )

    style_marker = "    @media (max-width: 900px) {"
    cinematic_css = r'''
    @keyframes tempestApproach {
      0% {
        transform: perspective(1200px) translateZ(-2400px) rotateX(68deg) scale(.08);
        opacity: 0;
        filter: blur(16px) brightness(2.2);
      }
      24% { opacity: .55; }
      58% {
        transform: perspective(1200px) translateZ(-420px) rotateX(24deg) scale(.58);
        opacity: 1;
        filter: blur(3px) brightness(1.5);
      }
      82% {
        transform: perspective(1200px) translateZ(90px) rotateX(-3deg) scale(1.08);
        filter: blur(0) brightness(1.3);
      }
      100% {
        transform: perspective(1200px) translateZ(0) rotateX(0) scale(1);
        opacity: 1;
        filter: none;
      }
    }

    @keyframes consoleWake {
      0%, 40% { opacity: 0; transform: translateY(22px); }
      100% { opacity: 1; transform: translateY(0); }
    }

    @keyframes humanGridImpact {
      0% { transform: scale(1); filter: brightness(1); }
      25% { transform: scale(1.055); filter: brightness(2.05); }
      52% { transform: scale(.985); filter: brightness(1.35); }
      100% { transform: scale(1); filter: brightness(1); }
    }

    @keyframes joshuaGridImpact {
      0% { transform: scale(1); filter: brightness(1); }
      35% { transform: scale(1.018); filter: brightness(1.28); }
      100% { transform: scale(1); filter: brightness(1); }
    }

    @keyframes playerShockwave {
      0% { opacity: 0; transform: scale(.25); }
      20% { opacity: .9; }
      100% { opacity: 0; transform: scale(1.5); }
    }

    .board-wrap {
      transform-origin: 50% 50%;
      will-change: transform, filter, opacity;
    }

    .arena-panel.approach-sequence .board-wrap {
      animation: tempestApproach 1.72s cubic-bezier(.15,.72,.18,1) both;
      pointer-events: none;
    }

    .arena-panel.approach-sequence .integrity,
    .arena-panel.approach-sequence .status,
    .arena-panel.approach-sequence .controls,
    .arena-panel.approach-sequence .system-note {
      animation: consoleWake 1.72s ease-out both;
      pointer-events: none;
    }

    .board {
      transform-origin: center;
      transition: box-shadow .13s ease, filter .13s ease, transform .13s ease;
    }

    body.music-beat .board {
      box-shadow: 0 0 18px var(--cyan), 0 0 48px rgba(34,247,255,.78), inset 0 0 24px rgba(34,247,255,.2);
      filter: brightness(1.13);
    }

    body.music-accent .board {
      transform: scale(1.012);
      box-shadow: 0 0 25px var(--cyan), 0 0 68px rgba(34,247,255,.95), inset 0 0 34px rgba(34,247,255,.27);
      filter: brightness(1.28);
    }

    body.music-beat .board-wrap::before,
    body.music-beat .board-wrap::after {
      opacity: 1;
      box-shadow: 0 0 15px var(--cyan), 0 0 38px rgba(34,247,255,.92);
    }

    .board.human-impact { animation: humanGridImpact .52s cubic-bezier(.2,.85,.2,1); }
    .board.ai-impact { animation: joshuaGridImpact .34s ease-out; }

    .board-wrap::after { transition: opacity .12s ease, box-shadow .12s ease; }
    .board-wrap.player-shockwave::after {
      width: 100%;
      height: 100%;
      right: 0;
      bottom: 0;
      border: 3px solid var(--cyan);
      border-radius: 50%;
      background: transparent;
      box-shadow: 0 0 28px var(--cyan), inset 0 0 24px rgba(34,247,255,.22);
      animation: playerShockwave .56s ease-out both;
    }

'''
    game = replace_once(game, style_marker, cinematic_css + style_marker, "responsive CSS marker")

    refs_old = "      const discTemplate = document.getElementById('disc-template');\n      const mcpTemplate = document.getElementById('mcp-template');"
    refs_new = refs_old + "\n      const arenaPanel = document.querySelector('.arena-panel');\n      const boardWrap = document.querySelector('.board-wrap');"
    game = replace_once(game, refs_old, refs_new, "element references")

    init_audio = r'''      function initAudio() {
        if (audio) return audio;
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return null;

        const context = new AudioContext();
        const master = context.createGain();
        const music = context.createGain();
        const effects = context.createGain();
        const compressor = context.createDynamicsCompressor();
        const delay = context.createDelay(1);
        const feedback = context.createGain();
        const delayWet = context.createGain();

        master.gain.value = soundEnabled ? 0.58 : 0;
        music.gain.value = 0.56;
        effects.gain.value = 0.94;
        compressor.threshold.value = -20;
        compressor.knee.value = 18;
        compressor.ratio.value = 6;
        compressor.attack.value = 0.003;
        compressor.release.value = 0.22;
        delay.delayTime.value = 0.19;
        feedback.gain.value = 0.24;
        delayWet.gain.value = 0.2;

        music.connect(master);
        music.connect(delay);
        delay.connect(feedback);
        feedback.connect(delay);
        delay.connect(delayWet);
        delayWet.connect(master);
        effects.connect(master);
        master.connect(compressor);
        compressor.connect(context.destination);

        const noiseBuffer = context.createBuffer(1, context.sampleRate, context.sampleRate);
        const noiseData = noiseBuffer.getChannelData(0);
        for (let index = 0; index < noiseData.length; index += 1) noiseData[index] = Math.random() * 2 - 1;

        audio = { context, master, music, effects, noiseBuffer };
        return audio;
      }

'''
    game = replace_between(game, "      function initAudio() {", "      function resumeAudio() {", init_audio, "audio initialization")

    music_block = r'''      function tone({ frequency, duration = 0.12, type = 'sine', volume = 0.16, destination = 'effects', when = 0, slideTo = null, attack = 0.008, cutoff = 6000 }) {
        const system = resumeAudio();
        if (!system || !soundEnabled) return;

        const now = system.context.currentTime + when;
        const oscillator = system.context.createOscillator();
        const filter = system.context.createBiquadFilter();
        const gain = system.context.createGain();
        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, now);
        if (slideTo) oscillator.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), now + duration);
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(cutoff, now);
        filter.Q.value = 1.2;

        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(volume, now + attack);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

        oscillator.connect(filter);
        filter.connect(gain);
        gain.connect(system[destination]);
        oscillator.start(now);
        oscillator.stop(now + duration + 0.04);
      }

      function noiseHit({ duration = 0.08, volume = 0.08, cutoff = 6000, when = 0, destination = 'music' } = {}) {
        const system = resumeAudio();
        if (!system || !soundEnabled) return;
        const now = system.context.currentTime + when;
        const source = system.context.createBufferSource();
        const filter = system.context.createBiquadFilter();
        const gain = system.context.createGain();
        source.buffer = system.noiseBuffer;
        filter.type = cutoff > 4000 ? 'highpass' : 'bandpass';
        filter.frequency.value = cutoff;
        filter.Q.value = 0.8;
        gain.gain.setValueAtTime(volume, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
        source.connect(filter);
        filter.connect(gain);
        gain.connect(system[destination]);
        source.start(now);
        source.stop(now + duration + 0.02);
      }

      function kick(when = 0, volume = 0.18) {
        tone({ frequency: 145, slideTo: 42, duration: .22, type: 'sine', volume, destination: 'music', when, cutoff: 900 });
      }

      function snare(when = 0) {
        noiseHit({ duration: .16, volume: .105, cutoff: 1800, when });
        tone({ frequency: 190, slideTo: 125, duration: .12, type: 'triangle', volume: .035, destination: 'music', when, cutoff: 1200 });
      }

      function hat(when = 0, volume = .028) {
        noiseHit({ duration: .035, volume, cutoff: 7200, when });
      }

      function chord(frequencies, duration, volume = 0.035, when = 0) {
        frequencies.forEach((frequency, index) => {
          tone({ frequency, duration, type: index === 0 ? 'triangle' : 'sawtooth', volume, destination: 'music', when: when + index * .012, attack: .08, cutoff: 2300 });
        });
      }

      function visualBeat(accent = false) {
        document.body.classList.remove('music-beat', 'music-accent');
        void document.body.offsetWidth;
        document.body.classList.add(accent ? 'music-accent' : 'music-beat');
        window.setTimeout(() => document.body.classList.remove('music-beat', 'music-accent'), accent ? 155 : 95);
      }

      function startMusic() {
        if (!soundEnabled || musicTimer) return;
        resumeAudio();
        musicStep = 0;

        const tempo = 112;
        const stepMs = (60000 / tempo) / 2;
        const roots = [73.42, 65.41, 82.41, 61.74];
        const chords = [
          [146.83, 174.61, 220.00],
          [130.81, 164.81, 196.00],
          [164.81, 196.00, 246.94],
          [123.47, 146.83, 185.00]
        ];
        const arpRatios = [1, 1.5, 2, 2.25, 3, 2.25, 2, 1.5];
        const bassPattern = new Set([0, 3, 6, 8, 11, 14]);

        const pulse = () => {
          if (!soundEnabled) return;
          const step = musicStep % 16;
          const section = Math.floor(musicStep / 16) % roots.length;
          const root = roots[section];
          const accent = step === 0 || step === 8;

          if (step % 4 === 0) kick(0, accent ? .2 : .15);
          if (step === 4 || step === 12) snare(.015);
          if (step % 2 === 1) hat(.01, step === 7 || step === 15 ? .045 : .026);
          if (bassPattern.has(step)) tone({ frequency: root, duration: .23, type: 'sawtooth', volume: .052, destination: 'music', cutoff: 680 });

          const arpFrequency = root * 2 * arpRatios[step % arpRatios.length];
          tone({ frequency: arpFrequency, duration: .19, type: step % 4 === 2 ? 'square' : 'triangle', volume: .028, destination: 'music', when: .018, cutoff: 3400 });

          if (step === 0) chord(chords[section], 1.75, .026, .01);
          if (step === 8) {
            tone({ frequency: root * 4.5, slideTo: root * 6, duration: .42, type: 'sine', volume: .035, destination: 'music', when: .02, cutoff: 4200 });
          }

          visualBeat(accent);
          musicStep += 1;
        };

        pulse();
        musicTimer = window.setInterval(pulse, stepMs);
      }

      function stopMusic() {
        if (musicTimer) {
          window.clearInterval(musicTimer);
          musicTimer = null;
        }
        document.body.classList.remove('music-beat', 'music-accent');
      }

'''
    game = replace_between(game, "      function tone(", "      function playMoveSound(player) {", music_block, "music engine")

    move_audio = r'''      function triggerBoardImpact(player) {
        const className = player === HUMAN ? 'human-impact' : 'ai-impact';
        boardEl.classList.remove('human-impact', 'ai-impact');
        if (player === HUMAN) boardWrap.classList.remove('player-shockwave');
        void boardEl.offsetWidth;
        boardEl.classList.add(className);
        if (player === HUMAN) boardWrap.classList.add('player-shockwave');
        window.setTimeout(() => {
          boardEl.classList.remove(className);
          if (player === HUMAN) boardWrap.classList.remove('player-shockwave');
        }, player === HUMAN ? 590 : 370);
      }

      function playMoveSound(player) {
        triggerBoardImpact(player);
        if (player === HUMAN) {
          tone({ frequency: 82, slideTo: 48, duration: .24, type: 'sine', volume: .22, cutoff: 700 });
          tone({ frequency: 330, slideTo: 1180, duration: .28, type: 'sawtooth', volume: .16, cutoff: 3800 });
          tone({ frequency: 660, duration: .2, type: 'triangle', volume: .12, when: .055, cutoff: 5200 });
          tone({ frequency: 990, duration: .16, type: 'sine', volume: .085, when: .09, cutoff: 6500 });
          noiseHit({ duration: .09, volume: .115, cutoff: 5200, destination: 'effects' });
        } else {
          tone({ frequency: 240, slideTo: 92, duration: .24, type: 'sawtooth', volume: .11, cutoff: 1800 });
          tone({ frequency: 120, duration: .18, type: 'square', volume: .065, when: .045, cutoff: 900 });
          noiseHit({ duration: .05, volume: .045, cutoff: 2600, when: .04, destination: 'effects' });
        }
      }

      function playEndSound(outcome) {
        if (outcome === HUMAN) {
          kick(0, .24);
          [293.66, 392, 523.25, 659.25, 783.99].forEach((frequency, index) => tone({ frequency, duration: .62, type: index % 2 ? 'sawtooth' : 'triangle', volume: .1, when: index * .095, cutoff: 4200 }));
        } else if (outcome === AI) {
          [220, 174.61, 130.81, 98, 65.41].forEach((frequency, index) => tone({ frequency, duration: .54, type: 'sawtooth', volume: .095, when: index * .1, cutoff: 1800 }));
          noiseHit({ duration: .48, volume: .09, cutoff: 1200, destination: 'effects' });
        } else {
          kick(0, .14);
          tone({ frequency: 260, duration: .16, type: 'square', volume: .085 });
          tone({ frequency: 330, duration: .16, type: 'square', volume: .075, when: .16 });
        }
      }

'''
    game = replace_between(game, "      function playMoveSound(player) {", "      function pieceNode(player) {", move_audio, "move effects")

    game = replace_once(
        game,
        "        master.gain.setTargetAtTime(enabled ? 0.28 : 0, system.context.currentTime, 0.035);",
        "        master.gain.setTargetAtTime(enabled ? 0.58 : 0, system.context.currentTime, 0.035);",
        "sound toggle gain",
    )

    old_enter = r'''      enterGridBtn.addEventListener('click', () => {
        gameStarted = true;
        introGate.hidden = true;
        resumeAudio();
        if (soundEnabled) startMusic();
        buildBoard();
        boardEl.querySelector('.cell')?.focus();
      });'''
    new_enter = r'''      enterGridBtn.addEventListener('click', () => {
        gameStarted = false;
        introGate.hidden = true;
        resumeAudio();
        if (soundEnabled) startMusic();
        arenaPanel.classList.remove('approach-sequence');
        void arenaPanel.offsetWidth;
        arenaPanel.classList.add('approach-sequence');
        updateStatus('WOPR vector lock acquired. Pulling Grid into range…');
        tone({ frequency: 55, slideTo: 220, duration: 1.45, type: 'sawtooth', volume: .09, cutoff: 1600 });
        tone({ frequency: 880, slideTo: 1760, duration: 1.25, type: 'sine', volume: .055, when: .18, cutoff: 5400 });
        window.setTimeout(() => {
          arenaPanel.classList.remove('approach-sequence');
          gameStarted = true;
          buildBoard();
          updateStatus('Shall we play a game? Your move, DISC.');
          boardEl.querySelector('.cell')?.focus();
        }, 1750);
      });'''
    game = replace_once(game, old_enter, new_enter, "Initialize Duel handler")

    game_path.write_text(game, encoding="utf-8")


if __name__ == "__main__":
    main()
