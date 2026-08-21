(() => {
    "use strict";

    const BUILD = "bee-leaf-belief-journey-2026.08.21";
    const STATES = Object.freeze({
        READY: "ready",
        TRANSITION: "transition",
        PLAYING: "playing",
        PAUSED: "paused",
        SEASON_COMPLETE: "season-complete",
        OVER: "over",
        FINALE: "finale",
        CREDITS: "credits"
    });

    const gameContainer = document.getElementById("gameContainer");
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");
    const gameHud = document.getElementById("gameHud");
    const beliefValue = document.getElementById("beliefValue");
    const shieldValue = document.getElementById("shieldValue");
    const seasonValue = document.getElementById("speedValue");
    const threadValue = document.getElementById("sunValue");
    const threadMeterFill = document.getElementById("sunMeterFill");
    const startScreen = document.getElementById("startScreen");
    const gameOverScreen = document.getElementById("gameOverScreen");
    const winScreen = document.getElementById("winScreen");
    const finalScoreDisplay = document.getElementById("finalScore");
    const winScoreDisplay = document.getElementById("winScore");
    const statusAnnouncer = document.getElementById("statusAnnouncer");
    const gameToast = document.getElementById("gameToast");
    const soundToggle = document.getElementById("soundToggle");
    const fullscreenToggle = document.getElementById("fullscreenToggle");
    const pauseToggle = document.getElementById("pauseToggle");
    const faithButton = document.getElementById("faithButton");
    const faithValue = document.getElementById("faithValue");
    const guidingGlowToggle = document.getElementById("guidingGlowToggle");
    const missionPanel = document.getElementById("missionPanel");
    const missionSeason = document.getElementById("missionSeason");
    const missionTitle = document.getElementById("missionTitle");
    const missionProgress = document.getElementById("missionProgress");
    const seasonBanner = document.getElementById("seasonBanner");
    const seasonKicker = document.getElementById("seasonKicker");
    const seasonName = document.getElementById("seasonName");
    const seasonLesson = document.getElementById("seasonLesson");
    const storyCaption = document.getElementById("storyCaption");
    const pauseCurtain = document.getElementById("pauseCurtain");
    const resumeFlight = document.getElementById("resumeFlight");
    const creditsViewport = document.getElementById("creditsViewport");
    const creditsToggle = document.getElementById("creditsToggle");
    const bgMusic = document.getElementById("bgMusic");

    const reducedMotionQuery = matchMedia("(prefers-reduced-motion: reduce)");
    let reducedMotion = reducedMotionQuery.matches;
    const query = new URLSearchParams(location.search);
    const debugAllowed = /\/staging(?:\/|$)/.test(location.pathname);
    const debugMode = debugAllowed ? (query.get("debug") || "") : "";
    const backgroundImage = new Image();
    backgroundImage.src = "assets/belief-collector-meadow.webp";

    const seasonDefinitions = [
        {
            key: "spring",
            shortName: "Spring",
            roman: "Season I",
            title: "Spring — Awakening",
            lesson: "Small beginnings carry living promise.",
            mission: "Awaken the Meadow",
            gift: "pollen",
            giftName: "living pollen",
            consequence: "A promise was planted. Its purpose may appear in another season.",
            reveal: "The flowers you touched are remembering the way to bloom.",
            stormChance: 0.14,
            spawnEvery: 72,
            tint: "rgba(85, 165, 104, 0.10)",
            fog: 0.03,
            targets: [
                { name: "Marigold", kind: "flower", x: 0.18, y: 0.62 },
                { name: "Lily", kind: "flower", x: 0.79, y: 0.38 },
                { name: "Wildflower", kind: "flower", x: 0.60, y: 0.72 }
            ],
            currents: [
                { x: 0.28, y: 0.58, radius: 0.34, angle: -0.32, strength: 0.050 },
                { x: 0.70, y: 0.43, radius: 0.28, angle: 2.74, strength: 0.044 }
            ]
        },
        {
            key: "summer",
            shortName: "Summer",
            roman: "Season II",
            title: "Summer — Shared Sweetness",
            lesson: "What you nurture becomes nourishment for another.",
            mission: "Carry the Sweetness",
            gift: "honey",
            giftName: "a gift of honey",
            consequence: "Sweetness was shared. The garden will carry it farther than Bea can see.",
            reveal: "Spring’s quiet flowers now feed the lives around them.",
            stormChance: 0.23,
            spawnEvery: 66,
            tint: "rgba(255, 193, 70, 0.10)",
            fog: 0.02,
            targets: [
                { name: "Samson Ant", kind: "ant", x: 0.18, y: 0.69 },
                { name: "Esther Butterfly", kind: "butterfly", x: 0.79, y: 0.36 },
                { name: "Jonah Caterpillar", kind: "caterpillar", x: 0.63, y: 0.70 }
            ],
            currents: [
                { x: 0.28, y: 0.46, radius: 0.31, angle: -1.22, strength: 0.068 },
                { x: 0.65, y: 0.57, radius: 0.36, angle: 2.12, strength: 0.064 },
                { x: 0.78, y: 0.34, radius: 0.22, angle: -2.72, strength: 0.056 }
            ]
        },
        {
            key: "autumn",
            shortName: "Autumn",
            roman: "Season III",
            title: "Autumn — Purpose Falls Forward",
            lesson: "A life may change form without losing its purpose.",
            mission: "Shelter Tomorrow",
            gift: "leaf",
            giftName: "Leif’s sheltering leaf",
            consequence: "What falls today has become shelter for tomorrow.",
            reveal: "The kindness Bea shared returns as courage in the changing wind.",
            stormChance: 0.31,
            spawnEvery: 61,
            tint: "rgba(180, 91, 37, 0.17)",
            fog: 0.08,
            targets: [
                { name: "Oak Roots", kind: "roots", x: 0.18, y: 0.48 },
                { name: "Winter Nest", kind: "nest", x: 0.80, y: 0.45 },
                { name: "Sleeping Seed", kind: "seed", x: 0.53, y: 0.72 }
            ],
            currents: [
                { x: 0.25, y: 0.42, radius: 0.36, angle: 0.08, strength: 0.092 },
                { x: 0.68, y: 0.58, radius: 0.39, angle: 3.30, strength: 0.096 },
                { x: 0.52, y: 0.35, radius: 0.25, angle: 1.50, strength: 0.075 }
            ]
        },
        {
            key: "winter",
            shortName: "Winter",
            roman: "Season IV",
            title: "Winter — Faith, Not Sight",
            lesson: "Stillness is not emptiness. Hope may be growing underground.",
            mission: "Carry the Unseen Light",
            gift: "hope",
            giftName: "a spark of unseen hope",
            consequence: "The light was carried home. Winter can no longer hide what the garden has become.",
            reveal: "Leif’s shelter holds. The seeds beneath the frost are still alive.",
            stormChance: 0.36,
            spawnEvery: 58,
            tint: "rgba(52, 77, 132, 0.27)",
            fog: 0.25,
            targets: [
                { name: "Leif", kind: "leaf", x: 0.18, y: 0.36 },
                { name: "Solomon Owl", kind: "owl", x: 0.82, y: 0.38 },
                { name: "Home Hive", kind: "hive", x: 0.53, y: 0.70 }
            ],
            currents: [
                { x: 0.24, y: 0.55, radius: 0.37, angle: -0.82, strength: 0.102 },
                { x: 0.62, y: 0.42, radius: 0.34, angle: 2.58, strength: 0.106 },
                { x: 0.78, y: 0.66, radius: 0.31, angle: -2.12, strength: 0.095 }
            ]
        }
    ];

    const entities = [];
    const particles = [];
    const floaters = [];
    const currentDust = [];
    const keys = { left: false, right: false, up: false, down: false };
    const pointer = { active: false, x: 0, y: 0, type: "mouse" };
    const gamepadPrevious = { pulse: false, pause: false };

    const bee = {
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        size: 54,
        tilt: 0,
        targetTilt: 0,
        initialized: false
    };

    const game = {
        state: STATES.READY,
        resumeState: STATES.PLAYING,
        seasonIndex: 0,
        seasonLinks: 0,
        totalLinks: 0,
        score: 0,
        hope: 3,
        shields: 0,
        faith: 3,
        maxFaith: 3,
        faithReveal: 0,
        pulseWave: 0,
        carriedGift: null,
        spawnTimer: 0,
        missionTimer: 0,
        difficultyTimer: 0,
        stormSpawnStreak: 0,
        lastSpawnType: "",
        invulnerable: 0,
        transitionEnds: 0,
        seasonCompleteAt: 0,
        finaleStartedAt: 0,
        finaleBeat: 0,
        finalePhase: "flight",
        failedInFinale: false,
        finaleCheckpoint: null,
        pausedAt: 0,
        creditsRunning: false,
        guidingGlow: false,
        audioEnabled: true,
        connections: [],
        checkpoint: null,
        stats: {
            stormsWeathered: 0,
            pulsesUsed: 0,
            giftsCarried: 0,
            distance: 0,
            optionalHelp: 0
        }
    };

    let viewWidth = 0;
    let viewHeight = 0;
    let lastTime = 0;
    let animationId = 0;
    let audioCtx = null;
    let toastTimer = 0;
    let captionTimer = 0;
    let toastExpiresAt = 0;
    let captionExpiresAt = 0;
    let toastRemaining = 0;
    let captionRemaining = 0;
    let screenFlash = 0;
    let pseudoFullscreen = false;
    let fullscreenScrollY = 0;
    let viewportSyncFrame = 0;
    let viewportSettleTimer = 0;
    let lockedLayoutWidth = 0;
    let lockedOrientation = "";
    let lastRenderTime = 0;

    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    function lerp(a, b, amount) {
        return a + (b - a) * amount;
    }

    function distanceBetween(a, b) {
        return Math.hypot(a.x - b.x, a.y - b.y);
    }

    function roundedRectPath(context, x, y, width, height, radius) {
        const safeRadius = Math.min(radius, width / 2, height / 2);
        context.beginPath();
        context.moveTo(x + safeRadius, y);
        context.arcTo(x + width, y, x + width, y + height, safeRadius);
        context.arcTo(x + width, y + height, x, y + height, safeRadius);
        context.arcTo(x, y + height, x, y, safeRadius);
        context.arcTo(x, y, x + width, y, safeRadius);
        context.closePath();
    }

    function currentSeason() {
        return seasonDefinitions[game.seasonIndex] || seasonDefinitions[0];
    }

    function playBounds() {
        const compact = viewWidth <= 640;
        const compactLandscape = viewHeight <= 560 && viewWidth > viewHeight;
        const top = compactLandscape
            ? 105
            : Math.min(compact ? 178 : 145, Math.max(105, viewHeight * (compact ? 0.34 : 0.29)));
        const bottom = Math.max(top + 120, viewHeight - 68);
        return { left: 34, right: Math.max(35, viewWidth - 34), top, bottom };
    }

    function pointFromTarget(target) {
        const bounds = playBounds();
        return {
            x: lerp(bounds.left, bounds.right, target.x),
            y: lerp(bounds.top, bounds.bottom, target.y)
        };
    }

    function clearKeys() {
        keys.left = false;
        keys.right = false;
        keys.up = false;
        keys.down = false;
        pointer.active = false;
    }

    function isActivePlayState() {
        return [STATES.TRANSITION, STATES.PLAYING, STATES.PAUSED, STATES.SEASON_COMPLETE, STATES.FINALE].includes(game.state);
    }

    function acceptsFlightInput() {
        return game.state === STATES.PLAYING || (game.state === STATES.FINALE && game.finalePhase === "flight");
    }

    function setFlightControlsInert(inert) {
        gameHud.inert = inert;
        faithButton.inert = inert;
        pauseToggle.inert = inert;
        fullscreenToggle.inert = inert;
        canvas.tabIndex = inert ? -1 : 0;
    }

    function resizeCanvas() {
        const rect = gameContainer.getBoundingClientRect();
        const nextWidth = Math.max(1, rect.width);
        const nextHeight = Math.max(1, rect.height);
        const pixelBudgetDpr = Math.sqrt(4000000 / Math.max(1, nextWidth * nextHeight));
        const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2, pixelBudgetDpr));
        const widthScale = viewWidth > 1 ? nextWidth / viewWidth : 1;
        const heightScale = viewHeight > 1 ? nextHeight / viewHeight : 1;
        const majorResize = viewWidth > 1 && viewHeight > 1
            && Math.max(Math.abs(widthScale - 1), Math.abs(heightScale - 1)) > 0.22;
        const widthChanged = viewWidth <= 1 || Math.abs(nextWidth - viewWidth) >= 0.5;
        const heightChanged = viewHeight <= 1 || Math.abs(nextHeight - viewHeight) >= 0.5;
        const bitmapWidth = Math.round(nextWidth * dpr);
        const bitmapHeight = Math.round(nextHeight * dpr);
        const cssWidth = `${nextWidth}px`;
        const cssHeight = `${nextHeight}px`;

        if (!widthChanged && !heightChanged
            && canvas.width === bitmapWidth
            && canvas.height === bitmapHeight
            && canvas.style.width === cssWidth
            && canvas.style.height === cssHeight) {
            return false;
        }

        if (viewWidth > 1 && widthChanged) {
            bee.x *= widthScale;
            pointer.x *= widthScale;
            entities.forEach(entity => { entity.x *= widthScale; entity.anchorX *= widthScale; });
            particles.forEach(particle => { particle.x *= widthScale; });
            floaters.forEach(floater => { floater.x *= widthScale; });
            currentDust.forEach(dust => { dust.x *= widthScale; });
        }

        if (viewHeight > 1 && heightChanged) {
            bee.y *= heightScale;
            pointer.y *= heightScale;
            entities.forEach(entity => { entity.y *= heightScale; entity.anchorY *= heightScale; });
            particles.forEach(particle => { particle.y *= heightScale; });
            floaters.forEach(floater => { floater.y *= heightScale; });
            currentDust.forEach(dust => { dust.y *= heightScale; });
        }

        viewWidth = nextWidth;
        viewHeight = nextHeight;
        if (canvas.width !== bitmapWidth) canvas.width = bitmapWidth;
        if (canvas.height !== bitmapHeight) canvas.height = bitmapHeight;
        if (canvas.style.width !== cssWidth) canvas.style.width = cssWidth;
        if (canvas.style.height !== cssHeight) canvas.style.height = cssHeight;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        const bounds = playBounds();
        if (!bee.initialized) {
            bee.x = viewWidth / 2;
            bee.y = lerp(bounds.top, bounds.bottom, 0.68);
            bee.initialized = true;
        }
        bee.x = clamp(bee.x, bounds.left, bounds.right);
        bee.y = clamp(bee.y, bounds.top, bounds.bottom);
        if (majorResize) {
            bee.vx = 0;
            bee.vy = 0;
        } else {
            const velocityCap = clamp(Math.min(viewWidth, viewHeight) / 86, 4.6, 7.1);
            const velocity = Math.hypot(bee.vx, bee.vy);
            if (velocity > velocityCap) {
                bee.vx = bee.vx / velocity * velocityCap;
                bee.vy = bee.vy / velocity * velocityCap;
            }
        }
        return true;
    }

    function usableViewportHeight() {
        return Math.max(1, Math.round(window.visualViewport?.height || window.innerHeight || document.documentElement.clientHeight));
    }

    function gameTopInset(viewportHeight = usableViewportHeight()) {
        let inset = 10;
        document.querySelectorAll("#lloamc-staging-banner, .lloamc-home-command, .lloamc-fixed-home").forEach(element => {
            const style = getComputedStyle(element);
            if (style.display === "none" || style.visibility === "hidden") return;
            if (style.position !== "fixed" && style.position !== "sticky") return;
            const rect = element.getBoundingClientRect();
            if (rect.bottom > 0 && rect.top < viewportHeight) inset = Math.max(inset, rect.bottom + 8);
        });
        // Preserve every visible fixed/sticky navigation pixel. On very short
        // landscape viewports the 300px playfield may extend below the fold,
        // but its top must never be trapped underneath the Home command bar.
        return clamp(Math.ceil(inset), 8, Math.max(8, viewportHeight - 120));
    }

    function currentOrientation() {
        return matchMedia("(orientation: portrait)").matches ? "portrait" : "landscape";
    }

    function syncGameViewport({ reveal = false, forceLayout = false } = {}) {
        cancelAnimationFrame(viewportSyncFrame);
        viewportSyncFrame = requestAnimationFrame(() => {
            viewportSyncFrame = 0;
            const nativeFullscreen = nativeFullscreenElement() === gameContainer;
            if (!isActivePlayState() || nativeFullscreen || pseudoFullscreen) {
                if (!isActivePlayState() && gameContainer.style.getPropertyValue("--playfield-height")) {
                    gameContainer.style.removeProperty("--playfield-height");
                }
                resizeCanvas();
                return;
            }

            const layoutWidth = Math.round(document.documentElement.clientWidth || window.innerWidth || 1);
            const orientation = currentOrientation();
            const layoutChanged = forceLayout
                || !lockedLayoutWidth
                || orientation !== lockedOrientation
                || Math.abs(layoutWidth - lockedLayoutWidth) >= 48;
            if (!layoutChanged && !reveal) {
                resizeCanvas();
                return;
            }

            const viewportHeight = usableViewportHeight();
            const topInset = gameTopInset(viewportHeight);
            const bottomInset = 12;
            if (layoutChanged) {
                const compactLandscape = orientation === "landscape" && viewportHeight < 620;
                const minPlayfieldHeight = compactLandscape ? 300 : 360;
                const nextHeight = clamp(Math.floor(viewportHeight - topInset - bottomInset), minPlayfieldHeight, 660);
                gameContainer.style.setProperty("--playfield-height", `${nextHeight}px`);
                lockedLayoutWidth = layoutWidth;
                lockedOrientation = orientation;
            }

            requestAnimationFrame(() => {
                resizeCanvas();
                if (!reveal) return;
                const rect = gameContainer.getBoundingClientRect();
                const desiredTop = gameTopInset();
                const visibleBottom = usableViewportHeight() - bottomInset;
                if (rect.top >= desiredTop - 4 && rect.bottom <= visibleBottom + 4) return;
                const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
                const targetScroll = clamp(window.scrollY + rect.top - desiredTop, 0, maxScroll);
                window.scrollTo({ top: targetScroll, behavior: "auto" });
            });
        });
    }

    function scheduleViewportSync({ reveal = false, forceLayout = false, delay = 150 } = {}) {
        window.clearTimeout(viewportSettleTimer);
        viewportSettleTimer = window.setTimeout(() => syncGameViewport({ reveal, forceLayout }), delay);
    }

    function ensureAudioContext() {
        if (!game.audioEnabled) return null;
        if (audioCtx) return audioCtx;
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) return null;
        audioCtx = new AudioContextClass();
        return audioCtx;
    }

    function playTone({ type = "sine", frequency = 440, duration = 0.12, gain = 0.06, delay = 0 } = {}) {
        const context = ensureAudioContext();
        if (!context) return;
        const now = context.currentTime + delay;
        const oscillator = context.createOscillator();
        const volume = context.createGain();
        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, now);
        volume.gain.setValueAtTime(0.0001, now);
        volume.gain.exponentialRampToValueAtTime(gain, now + 0.01);
        volume.gain.exponentialRampToValueAtTime(0.0001, now + duration);
        oscillator.connect(volume);
        volume.connect(context.destination);
        oscillator.start(now);
        oscillator.stop(now + duration + 0.04);
    }

    function playNoise({ duration = 0.22, gain = 0.045, frequency = 700, filterType = "bandpass" } = {}) {
        const context = ensureAudioContext();
        if (!context) return;
        const now = context.currentTime;
        const bufferSize = Math.max(1, Math.floor(context.sampleRate * duration));
        const buffer = context.createBuffer(1, bufferSize, context.sampleRate);
        const data = buffer.getChannelData(0);
        for (let index = 0; index < bufferSize; index++) data[index] = Math.random() * 2 - 1;
        const source = context.createBufferSource();
        const filter = context.createBiquadFilter();
        const volume = context.createGain();
        source.buffer = buffer;
        filter.type = filterType;
        filter.frequency.setValueAtTime(frequency, now);
        volume.gain.setValueAtTime(0.0001, now);
        volume.gain.exponentialRampToValueAtTime(gain, now + 0.01);
        volume.gain.exponentialRampToValueAtTime(0.0001, now + duration);
        source.connect(filter);
        filter.connect(volume);
        volume.connect(context.destination);
        source.start(now);
    }

    function sfxGift(type) {
        if (type === "leaf") {
            playNoise({ duration: 0.18, gain: 0.035, frequency: 1050, filterType: "highpass" });
            playTone({ frequency: 523.25, gain: 0.035, duration: 0.1 });
        } else if (type === "honey") {
            playTone({ type: "triangle", frequency: 165, gain: 0.05, duration: 0.1 });
            playTone({ frequency: 247, gain: 0.035, duration: 0.11, delay: 0.04 });
        } else {
            playTone({ frequency: 659.25, gain: 0.05, duration: 0.12 });
            playTone({ frequency: 880, gain: 0.04, duration: 0.12, delay: 0.06 });
        }
    }

    function sfxThunder() {
        playNoise({ duration: 0.38, gain: 0.058, frequency: 230, filterType: "lowpass" });
        playTone({ frequency: 55, gain: 0.052, duration: 0.28 });
    }

    function sfxPulse() {
        [392, 523.25, 659.25].forEach((frequency, index) => {
            playTone({ type: "sine", frequency, gain: 0.038, duration: 0.22, delay: index * 0.055 });
        });
    }

    function sfxConnection() {
        [523.25, 659.25, 783.99, 1046.5].forEach((frequency, index) => {
            playTone({ frequency, gain: 0.042, duration: 0.16, delay: index * 0.075 });
        });
    }

    function prepareAudio() {
        try {
            const context = ensureAudioContext();
            if (context && context.state === "suspended") context.resume().catch(() => {});
        } catch (_) {}
        bgMusic.volume = 0.16;
        if (game.audioEnabled) {
            const promise = bgMusic.play();
            if (promise && typeof promise.catch === "function") promise.catch(() => {});
        }
    }

    function setSoundState() {
        bgMusic.muted = !game.audioEnabled;
        soundToggle.textContent = game.audioEnabled ? "♪" : "×";
        soundToggle.setAttribute("aria-label", game.audioEnabled ? "Mute game sound" : "Turn on game sound");
        soundToggle.title = game.audioEnabled ? "Mute game sound" : "Turn on game sound";
    }

    function showToast(message, duration = 1500) {
        window.clearTimeout(toastTimer);
        gameToast.textContent = message;
        gameToast.classList.add("show");
        toastRemaining = duration;
        toastExpiresAt = performance.now() + duration;
        toastTimer = window.setTimeout(hideToast, duration);
    }

    function showCaption(message, duration = 2800) {
        window.clearTimeout(captionTimer);
        storyCaption.textContent = message;
        storyCaption.hidden = false;
        announce(message);
        captionRemaining = duration;
        captionExpiresAt = performance.now() + duration;
        captionTimer = window.setTimeout(hideCaption, duration);
    }

    function hideToast() {
        gameToast.classList.remove("show");
        toastRemaining = 0;
        toastExpiresAt = 0;
    }

    function hideCaption() {
        storyCaption.hidden = true;
        captionRemaining = 0;
        captionExpiresAt = 0;
    }

    function freezeMessageTimers(now) {
        if (toastExpiresAt) {
            toastRemaining = Math.max(0, toastExpiresAt - now);
            window.clearTimeout(toastTimer);
        }
        if (captionExpiresAt) {
            captionRemaining = Math.max(0, captionExpiresAt - now);
            window.clearTimeout(captionTimer);
        }
    }

    function resumeMessageTimers(now) {
        if (toastRemaining > 0 && gameToast.classList.contains("show")) {
            toastExpiresAt = now + toastRemaining;
            toastTimer = window.setTimeout(hideToast, toastRemaining);
        }
        if (captionRemaining > 0 && !storyCaption.hidden) {
            captionExpiresAt = now + captionRemaining;
            captionTimer = window.setTimeout(hideCaption, captionRemaining);
        }
    }

    function announce(message) {
        statusAnnouncer.textContent = message;
    }

    function updateHud(announcement = "") {
        const season = currentSeason();
        const hearts = "♥".repeat(game.hope) + "♡".repeat(Math.max(0, 3 - game.hope));
        beliefValue.textContent = String(game.score);
        shieldValue.textContent = `${hearts} · 🍃${game.shields}`;
        const finaleActive = game.state === STATES.FINALE
            || (game.state === STATES.PAUSED && game.resumeState === STATES.FINALE);
        const finaleFlight = finaleActive && game.finalePhase === "flight";
        seasonValue.textContent = finaleActive ? "Finale" : season.shortName;
        threadValue.textContent = `${game.totalLinks} / 12`;
        threadMeterFill.style.width = `${(game.totalLinks / 12) * 100}%`;
        threadMeterFill.parentElement?.setAttribute("role", "progressbar");
        threadMeterFill.parentElement?.setAttribute("aria-label", "Purpose Thread completion");
        threadMeterFill.parentElement?.setAttribute("aria-valuemin", "0");
        threadMeterFill.parentElement?.setAttribute("aria-valuemax", "12");
        threadMeterFill.parentElement?.setAttribute("aria-valuenow", String(game.totalLinks));
        faithValue.textContent = `${game.faith} ${game.faith === 1 ? "pulse" : "pulses"}`;
        faithButton.disabled = game.faith <= 0 || (game.state !== STATES.PLAYING && !finaleFlight);
        faithButton.setAttribute("aria-label", `Use Faith Pulse. ${game.faith} ${game.faith === 1 ? "charge" : "charges"} available.`);
        missionSeason.textContent = finaleActive ? "Finale" : season.shortName;
        missionTitle.textContent = finaleFlight
            ? "Carry the Seed of Spring to the Heart of the Garden"
            : game.carriedGift
                ? `Carry ${season.giftName} to ${activeTarget()?.name || "its purpose"}`
                : season.mission;
        missionProgress.textContent = finaleFlight ? "Trust the final current" : `${game.seasonLinks} of 3 connections`;
        if (announcement) announce(announcement);
    }

    function activeTarget() {
        return currentSeason().targets[game.seasonLinks] || null;
    }

    function seedCurrentDust() {
        currentDust.length = 0;
        const amount = reducedMotion ? 18 : (viewWidth < 500 ? 28 : 40);
        for (let index = 0; index < amount; index++) {
            currentDust.push({
                x: Math.random() * viewWidth,
                y: Math.random() * viewHeight,
                age: Math.random() * 500,
                size: 0.8 + Math.random() * 1.8
            });
        }
    }

    function saveGuidingGlow() {
        try { localStorage.setItem("beliefCollectorGuidingGlow", game.guidingGlow ? "1" : "0"); } catch (_) {}
    }

    function loadPreferences() {
        try {
            game.guidingGlow = localStorage.getItem("beliefCollectorGuidingGlow") === "1";
            game.audioEnabled = localStorage.getItem("beliefCollectorSound") !== "0";
        } catch (_) {}
        guidingGlowToggle.checked = game.guidingGlow;
        setSoundState();
    }

    gameContainer.dataset.build = BUILD;

    function drawImageCover(image, focusX) {
        if (!image.complete || !image.naturalWidth) {
            const fallback = ctx.createLinearGradient(0, 0, 0, viewHeight);
            fallback.addColorStop(0, "#6e91ba");
            fallback.addColorStop(0.55, "#b9c9b3");
            fallback.addColorStop(1, "#6a9b55");
            ctx.fillStyle = fallback;
            ctx.fillRect(0, 0, viewWidth, viewHeight);
            return;
        }
        const scale = Math.max(viewWidth / image.naturalWidth, viewHeight / image.naturalHeight) * 1.07;
        const width = image.naturalWidth * scale;
        const height = image.naturalHeight * scale;
        const overflowX = Math.max(0, width - viewWidth);
        const overflowY = Math.max(0, height - viewHeight);
        const x = -overflowX * clamp(focusX, 0.08, 0.92);
        const y = -overflowY * 0.61;
        ctx.drawImage(image, x, y, width, height);
    }

    function drawAmbientCloud(x, y, scale, alpha, dark = false) {
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = dark ? "rgba(58, 67, 98, 0.94)" : "rgba(246, 248, 255, 0.92)";
        ctx.beginPath();
        ctx.arc(x, y, 18 * scale, 0, Math.PI * 2);
        ctx.arc(x + 22 * scale, y - 8 * scale, 24 * scale, 0, Math.PI * 2);
        ctx.arc(x + 48 * scale, y, 19 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    function drawForeground(time) {
        const season = currentSeason();
        const baseY = viewHeight + 8;
        const step = Math.max(58, viewWidth / 12);
        const autumn = season.key === "autumn";
        const winter = season.key === "winter";
        ctx.save();
        for (let index = -1; index < Math.ceil(viewWidth / step) + 2; index++) {
            const x = index * step - ((bee.x - viewWidth / 2) * 0.025);
            const sway = reducedMotion ? 0 : Math.sin(time * 0.0018 + index) * 0.07;
            ctx.save();
            ctx.translate(x, baseY);
            ctx.rotate(sway);
            ctx.strokeStyle = winter ? "rgba(70, 99, 88, 0.52)" : "rgba(37, 99, 61, 0.74)";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(3, -25, -3, -53 - (index % 3) * 7);
            ctx.stroke();
            ctx.fillStyle = autumn
                ? (index % 2 ? "rgba(223, 119, 60, 0.88)" : "rgba(255, 200, 74, 0.9)")
                : winter
                    ? "rgba(225, 235, 244, 0.52)"
                    : (index % 3 === 0 ? "rgba(255, 216, 86, 0.9)" : "rgba(239, 138, 197, 0.84)");
            for (let petal = 0; petal < 6; petal++) {
                ctx.save();
                ctx.translate(-3, -54 - (index % 3) * 7);
                ctx.rotate((Math.PI * 2 * petal) / 6);
                ctx.beginPath();
                ctx.ellipse(0, -7, 4, 8, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
            ctx.fillStyle = "#7d5020";
            ctx.beginPath();
            ctx.arc(-3, -54 - (index % 3) * 7, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
        const foregroundGradient = ctx.createLinearGradient(0, viewHeight - 76, 0, viewHeight);
        foregroundGradient.addColorStop(0, "rgba(30, 86, 48, 0)");
        foregroundGradient.addColorStop(1, winter ? "rgba(45, 65, 86, 0.5)" : "rgba(22, 74, 43, 0.43)");
        ctx.fillStyle = foregroundGradient;
        ctx.fillRect(0, viewHeight - 82, viewWidth, 82);
        ctx.restore();
    }

    function drawSunlight(amount) {
        if (amount <= 0.005) return;
        ctx.save();
        const glow = ctx.createRadialGradient(viewWidth * 0.91, viewHeight * 0.04, 10, viewWidth * 0.84, viewHeight * 0.12, viewWidth * 0.74);
        glow.addColorStop(0, `rgba(255, 248, 182, ${0.50 * amount})`);
        glow.addColorStop(0.45, `rgba(255, 224, 104, ${0.19 * amount})`);
        glow.addColorStop(1, "rgba(255, 220, 95, 0)");
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, viewWidth, viewHeight);
        ctx.restore();
    }

    function drawConsequences(time, finaleStrength = 0) {
        const connectionCounts = game.connections.reduce((counts, connection) => {
            counts[connection.season] = (counts[connection.season] || 0) + 1;
            return counts;
        }, {});
        ctx.save();
        const bob = reducedMotion ? 0 : Math.sin(time * 0.0024) * 3;
        const springCount = game.seasonIndex >= 1 || finaleStrength > 0
            ? Math.min(3, connectionCounts.spring || 0)
            : 0;
        if (springCount > 0 || finaleStrength > 0) {
            const flowers = [
                { x: viewWidth * 0.11, y: viewHeight * 0.73 },
                { x: viewWidth * 0.84, y: viewHeight * 0.69 },
                { x: viewWidth * 0.52, y: viewHeight * 0.80 }
            ];
            flowers.slice(0, Math.max(springCount, Math.ceil(finaleStrength * 3))).forEach((flower, index) => {
                drawFlower({ x: flower.x, y: flower.y + bob * (index % 2 ? -1 : 1), age: time * 0.05 + index, rotation: 0, scale: 0.65 + finaleStrength * 0.25 });
            });
        }
        const summerCount = game.seasonIndex >= 2 || finaleStrength > 0.2
            ? Math.min(3, connectionCounts.summer || 0)
            : 0;
        if (summerCount >= 1 || finaleStrength > 0.2) {
            drawCharacterIcon("ant", viewWidth * 0.12, viewHeight * 0.84, 0.72 + finaleStrength * 0.15, 0.78);
        }
        if (summerCount >= 2 || finaleStrength > 0.34) {
            drawCharacterIcon("butterfly", viewWidth * 0.88, viewHeight * 0.47 + bob, 0.86 + finaleStrength * 0.12, 0.84);
        }
        if (summerCount >= 3 || finaleStrength > 0.46) {
            drawCharacterIcon("caterpillar", viewWidth * 0.75, viewHeight * 0.82, 0.74, 0.78);
        }
        const autumnCount = game.seasonIndex >= 3 || finaleStrength > 0.45
            ? Math.min(3, connectionCounts.autumn || 0)
            : 0;
        if (autumnCount > 0 || finaleStrength > 0.45) {
            ctx.globalAlpha = 0.42 + finaleStrength * 0.38;
            ctx.fillStyle = "rgba(106, 75, 39, 0.82)";
            ctx.beginPath();
            ctx.ellipse(viewWidth * 0.32, viewHeight * 0.90, viewWidth * 0.19, 16, 0, 0, Math.PI * 2);
            ctx.fill();
            const leafCount = Math.max(autumnCount * 2 - 1, Math.ceil(finaleStrength * 5));
            for (let index = 0; index < leafCount; index++) {
                drawLeaf({
                    x: viewWidth * (0.23 + index * 0.045),
                    y: viewHeight * 0.86 + (index % 2) * 8,
                    age: index * 12,
                    rotation: index * 0.72,
                    scale: 0.52
                });
            }
        }
        ctx.restore();
    }

    function drawBackground(time, finaleStrength = 0) {
        const season = currentSeason();
        const focus = viewWidth ? bee.x / viewWidth : 0.5;
        const drift = reducedMotion ? 0 : Math.sin(time * 0.00008) * 0.022;
        drawImageCover(backgroundImage, 0.5 + (focus - 0.5) * 0.16 + drift);

        const completion = clamp(game.totalLinks / 12 + finaleStrength * 0.7, 0, 1);
        const veilAlpha = 0.44 * (1 - completion * 0.65);
        const veil = ctx.createLinearGradient(0, 0, 0, viewHeight);
        veil.addColorStop(0, `rgba(23, 39, 89, ${veilAlpha})`);
        veil.addColorStop(1, `rgba(42, 57, 76, ${veilAlpha * 0.50})`);
        ctx.fillStyle = veil;
        ctx.fillRect(0, 0, viewWidth, viewHeight);
        ctx.fillStyle = season.tint;
        ctx.fillRect(0, 0, viewWidth, viewHeight);

        const cloudShift = reducedMotion ? 0 : (time * (0.004 + game.seasonIndex * 0.0015)) % (viewWidth + 300);
        const darkCloud = game.seasonIndex >= 2;
        drawAmbientCloud(viewWidth - cloudShift, viewHeight * 0.22, 0.88, 0.17 + game.seasonIndex * 0.035, darkCloud);
        drawAmbientCloud(viewWidth * 0.36 - cloudShift * 0.38, viewHeight * 0.16, 0.62, 0.13 + game.seasonIndex * 0.026, darkCloud);
        drawSunlight(completion);
        drawConsequences(time, finaleStrength);
        drawForeground(time);

        if (season.fog > 0 && finaleStrength < 0.8) {
            const fog = ctx.createLinearGradient(0, playBounds().top, 0, viewHeight);
            fog.addColorStop(0, `rgba(224, 234, 246, ${season.fog * 0.22})`);
            fog.addColorStop(0.62, `rgba(209, 223, 239, ${season.fog})`);
            fog.addColorStop(1, `rgba(222, 231, 240, ${season.fog * 0.34})`);
            ctx.fillStyle = fog;
            ctx.fillRect(0, playBounds().top, viewWidth, viewHeight);
        }
    }

    function currentVectorAt(x, y) {
        const bounds = playBounds();
        let vx = 0;
        let vy = 0;
        currentSeason().currents.forEach(current => {
            const centerX = lerp(bounds.left, bounds.right, current.x);
            const centerY = lerp(bounds.top, bounds.bottom, current.y);
            const radius = current.radius * Math.min(bounds.right - bounds.left, Math.max(180, bounds.bottom - bounds.top) * 1.65);
            const distance = Math.hypot(x - centerX, y - centerY);
            if (distance >= radius) return;
            const falloff = 1 - distance / radius;
            vx += Math.cos(current.angle) * current.strength * falloff;
            vy += Math.sin(current.angle) * current.strength * falloff;
        });
        return { x: vx, y: vy };
    }

    function drawCurrentField(time) {
        const reveal = game.guidingGlow ? 0.46 : clamp(game.faithReveal / 150, 0, 1);
        const bounds = playBounds();
        ctx.save();
        currentSeason().currents.forEach((current, index) => {
            const x = lerp(bounds.left, bounds.right, current.x);
            const y = lerp(bounds.top, bounds.bottom, current.y);
            const radius = current.radius * Math.min(bounds.right - bounds.left, Math.max(180, bounds.bottom - bounds.top) * 1.65);
            if (reveal > 0.04) {
                ctx.strokeStyle = `rgba(187, 255, 239, ${0.14 + reveal * 0.48})`;
                ctx.lineWidth = 2 + reveal * 2;
                ctx.setLineDash([10, 11]);
                ctx.lineDashOffset = reducedMotion ? 0 : -time * 0.025 - index * 12;
                ctx.beginPath();
                ctx.arc(x, y, radius * 0.62, current.angle - 0.85, current.angle + 0.85);
                ctx.stroke();
                ctx.setLineDash([]);
                const arrowX = x + Math.cos(current.angle) * radius * 0.62;
                const arrowY = y + Math.sin(current.angle) * radius * 0.62;
                ctx.save();
                ctx.translate(arrowX, arrowY);
                ctx.rotate(current.angle);
                ctx.fillStyle = `rgba(225, 255, 248, ${0.30 + reveal * 0.58})`;
                ctx.beginPath();
                ctx.moveTo(13, 0);
                ctx.lineTo(-8, -8);
                ctx.lineTo(-4, 0);
                ctx.lineTo(-8, 8);
                ctx.closePath();
                ctx.fill();
                ctx.restore();
            }
        });

        currentDust.forEach(dust => {
            const alpha = game.guidingGlow ? 0.34 : 0.13 + reveal * 0.44;
            ctx.fillStyle = `rgba(255, 245, 167, ${alpha})`;
            ctx.beginPath();
            ctx.arc(dust.x, dust.y, dust.size + reveal * 0.7, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.restore();
    }

    function drawPurposeThread(time, finaleStrength = 0) {
        if (!game.connections.length) return;
        const reveal = finaleStrength > 0 ? finaleStrength : (game.guidingGlow ? 0.34 : clamp(game.faithReveal / 150, 0, 1));
        if (reveal <= 0.03) return;
        const hive = { x: viewWidth * 0.5, y: viewHeight * 0.84 };
        ctx.save();
        ctx.lineCap = "round";
        game.connections.forEach((connection, index) => {
            const season = seasonDefinitions.find(item => item.key === connection.season) || seasonDefinitions[0];
            const target = season.targets[connection.targetIndex];
            if (!target) return;
            const point = pointFromTarget(target);
            const pulse = reducedMotion ? 0 : Math.sin(time * 0.004 + index) * 0.12;
            ctx.strokeStyle = `rgba(191, 255, 234, ${0.12 + reveal * 0.63 + pulse * reveal})`;
            ctx.lineWidth = 1.4 + reveal * 2.6;
            ctx.shadowColor = "rgba(137, 255, 226, 0.7)";
            ctx.shadowBlur = 8 + reveal * 13;
            ctx.beginPath();
            ctx.moveTo(point.x, point.y);
            const curveX = (point.x + hive.x) / 2 + Math.sin(index * 1.7) * 32;
            const curveY = (point.y + hive.y) / 2 - 30;
            ctx.quadraticCurveTo(curveX, curveY, hive.x, hive.y);
            ctx.stroke();
        });
        ctx.restore();
    }

    function drawCharacterIcon(kind, x, y, scale = 1, alpha = 1) {
        const glyphs = {
            ant: "🐜",
            butterfly: "🦋",
            caterpillar: "🐛",
            owl: "🦉",
            hive: "🍯",
            nest: "🪹",
            roots: "🌱",
            seed: "🌰",
            leaf: "🍂",
            flower: "🌸"
        };
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(x, y);
        ctx.scale(scale, scale);
        ctx.font = "40px 'Segoe UI Emoji', 'Apple Color Emoji', sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.shadowColor = "rgba(20, 31, 64, 0.34)";
        ctx.shadowBlur = 10;
        ctx.fillText(glyphs[kind] || "✦", 0, 0);
        ctx.restore();
    }

    function drawTarget(target, index, time) {
        const point = pointFromTarget(target);
        const isComplete = index < game.seasonLinks;
        const isActive = index === game.seasonLinks;
        const reveal = game.guidingGlow ? 0.65 : clamp(game.faithReveal / 150, 0, 1);
        const carrierAlpha = game.carriedGift && isActive ? 0.64 : 0.22;
        const alpha = isComplete ? 0.58 : Math.max(carrierAlpha, reveal * 0.9);
        if (!isComplete && !isActive) return;

        ctx.save();
        const pulse = reducedMotion ? 0 : Math.sin(time * 0.006 + index) * 3;
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = isComplete ? "rgba(187, 255, 213, 0.9)" : "rgba(255, 233, 139, 0.92)";
        ctx.lineWidth = 3;
        ctx.shadowColor = isComplete ? "rgba(124, 255, 188, 0.72)" : "rgba(255, 224, 112, 0.82)";
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(point.x, point.y, 31 + pulse, 0, Math.PI * 2);
        ctx.stroke();
        drawCharacterIcon(target.kind, point.x, point.y, 0.88, alpha);
        if (reveal > 0.3 || game.guidingGlow || isComplete) {
            ctx.globalAlpha = Math.max(0.72, reveal);
            ctx.font = "800 12px Inter, 'Segoe UI', sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "top";
            const labelWidth = Math.min(150, ctx.measureText(target.name).width + 24);
            ctx.fillStyle = "rgba(23, 35, 60, 0.88)";
            roundedRectPath(ctx, point.x - labelWidth / 2, point.y + 38, labelWidth, 25, 12);
            ctx.fill();
            ctx.fillStyle = "white";
            ctx.fillText(target.name, point.x, point.y + 44);
        }
        ctx.restore();
    }

    function drawTargets(time) {
        currentSeason().targets.forEach((target, index) => drawTarget(target, index, time));
        if (game.carriedGift) {
            const target = activeTarget();
            if (target) {
                const point = pointFromTarget(target);
                ctx.save();
                ctx.strokeStyle = `rgba(255, 247, 183, ${game.guidingGlow || game.faithReveal > 0 ? 0.62 : 0.22})`;
                ctx.lineWidth = 2;
                ctx.setLineDash([7, 9]);
                ctx.beginPath();
                ctx.moveTo(bee.x, bee.y);
                ctx.quadraticCurveTo((bee.x + point.x) / 2, Math.min(bee.y, point.y) - 35, point.x, point.y);
                ctx.stroke();
                ctx.restore();
            }
        }
    }

    function drawFlower(item) {
        const pulse = reducedMotion ? 1 : 1 + Math.sin(item.age * 0.09) * 0.08;
        const scale = item.scale || 1;
        ctx.save();
        ctx.translate(item.x, item.y);
        ctx.rotate(item.rotation || 0);
        ctx.scale(pulse * scale, pulse * scale);
        ctx.shadowColor = "rgba(255, 191, 88, 0.68)";
        ctx.shadowBlur = 16;
        const petalColors = ["#f08bc5", "#e97bbd", "#ffafd7"];
        for (let index = 0; index < 8; index++) {
            ctx.save();
            ctx.rotate((Math.PI * 2 * index) / 8);
            ctx.fillStyle = petalColors[index % petalColors.length];
            ctx.beginPath();
            ctx.ellipse(0, -14, 6, 12, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
        ctx.fillStyle = "#ffd95a";
        ctx.beginPath();
        ctx.arc(0, 0, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    function drawLeaf(item) {
        const scale = item.scale || 1;
        ctx.save();
        ctx.translate(item.x, item.y);
        ctx.rotate((item.rotation || 0) + Math.sin(item.age * 0.04) * 0.35);
        ctx.scale(scale, scale);
        ctx.shadowColor = "rgba(38, 99, 61, 0.42)";
        ctx.shadowBlur = 11;
        const gradient = ctx.createLinearGradient(-18, -12, 18, 14);
        gradient.addColorStop(0, "#9be58a");
        gradient.addColorStop(0.55, "#58b96c");
        gradient.addColorStop(1, "#2f7851");
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(-21, 10);
        ctx.bezierCurveTo(-14, -22, 17, -24, 23, -15);
        ctx.bezierCurveTo(22, 6, 7, 23, -21, 10);
        ctx.fill();
        ctx.strokeStyle = "rgba(233, 255, 226, 0.78)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-17, 10);
        ctx.quadraticCurveTo(2, 0, 19, -16);
        ctx.stroke();
        ctx.restore();
    }

    function drawHoney(item) {
        ctx.save();
        ctx.translate(item.x, item.y);
        ctx.rotate(Math.sin(item.age * 0.045) * 0.11);
        ctx.shadowColor = "rgba(117, 74, 22, 0.42)";
        ctx.shadowBlur = 12;
        ctx.fillStyle = "#7d5126";
        roundedRectPath(ctx, -14, -24, 28, 9, 4);
        ctx.fill();
        const gradient = ctx.createLinearGradient(-19, -13, 19, 21);
        gradient.addColorStop(0, "#fff0a1");
        gradient.addColorStop(0.22, "#ffc84e");
        gradient.addColorStop(0.8, "#e7901d");
        gradient.addColorStop(1, "#b76319");
        ctx.fillStyle = gradient;
        roundedRectPath(ctx, -20, -17, 40, 38, 9);
        ctx.fill();
        ctx.strokeStyle = "rgba(111, 68, 25, 0.7)";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = "rgba(255, 251, 214, 0.86)";
        roundedRectPath(ctx, -14, -5, 28, 14, 6);
        ctx.fill();
        ctx.restore();
    }

    function drawPollen(item) {
        ctx.save();
        ctx.translate(item.x, item.y);
        const pulse = reducedMotion ? 1 : 1 + Math.sin(item.age * 0.08) * 0.16;
        ctx.scale(pulse, pulse);
        const glow = ctx.createRadialGradient(0, 0, 1, 0, 0, 24);
        glow.addColorStop(0, "rgba(255, 255, 230, 1)");
        glow.addColorStop(0.25, "rgba(255, 225, 99, 0.95)");
        glow.addColorStop(1, "rgba(255, 207, 68, 0)");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(0, 0, 25, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#fff3a6";
        for (let index = 0; index < 5; index++) {
            const angle = index * 1.256 + item.age * 0.015;
            ctx.beginPath();
            ctx.arc(Math.cos(angle) * 10, Math.sin(angle) * 10, 2.4, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }

    function drawHope(item) {
        ctx.save();
        ctx.translate(item.x, item.y);
        const pulse = reducedMotion ? 0 : Math.sin(item.age * 0.07) * 3;
        ctx.shadowColor = "rgba(197, 255, 241, 0.9)";
        ctx.shadowBlur = 18 + pulse;
        ctx.fillStyle = "#e8fff7";
        ctx.strokeStyle = "rgba(95, 205, 205, 0.92)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let point = 0; point < 10; point++) {
            const radius = point % 2 === 0 ? 18 : 7;
            const angle = -Math.PI / 2 + point * Math.PI / 5;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            if (point === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    }

    function drawSeed(item) {
        const scale = item.scale || 1;
        ctx.save();
        ctx.translate(item.x, item.y);
        ctx.rotate((item.rotation || 0) + Math.sin(item.age * 0.035) * 0.12);
        ctx.scale(scale, scale);
        ctx.shadowColor = "rgba(255, 231, 142, 0.76)";
        ctx.shadowBlur = 15;
        const gradient = ctx.createLinearGradient(-14, -10, 17, 16);
        gradient.addColorStop(0, "#b77a3c");
        gradient.addColorStop(0.52, "#7c4b2d");
        gradient.addColorStop(1, "#4d2d22");
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.ellipse(0, 2, 15, 20, -0.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(255, 232, 176, 0.7)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-7, 12);
        ctx.quadraticCurveTo(2, 3, 9, -11);
        ctx.stroke();
        ctx.restore();
    }

    function drawStorm(item) {
        if (item.telegraph > 0) {
            const alpha = 0.14 + (1 - item.telegraph / item.telegraphMax) * 0.26;
            ctx.save();
            ctx.strokeStyle = `rgba(255, 225, 112, ${alpha})`;
            ctx.lineWidth = 3;
            ctx.setLineDash([9, 10]);
            ctx.beginPath();
            ctx.moveTo(item.x, playBounds().top);
            ctx.lineTo(item.x, playBounds().bottom);
            ctx.stroke();
            ctx.restore();
        }
        ctx.save();
        ctx.translate(item.x, item.y);
        ctx.shadowColor = "rgba(20, 26, 54, 0.5)";
        ctx.shadowBlur = 16;
        const cloudGradient = ctx.createLinearGradient(0, -25, 0, 21);
        cloudGradient.addColorStop(0, "#77819f");
        cloudGradient.addColorStop(1, "#38415f");
        ctx.fillStyle = cloudGradient;
        ctx.beginPath();
        ctx.arc(-19, 2, 18, 0, Math.PI * 2);
        ctx.arc(-4, -11, 23, 0, Math.PI * 2);
        ctx.arc(20, 1, 19, 0, Math.PI * 2);
        ctx.rect(-20, 0, 40, 18);
        ctx.fill();
        ctx.strokeStyle = "rgba(226, 235, 255, 0.36)";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = "rgba(120, 195, 255, 0.78)";
        for (let index = -1; index <= 1; index++) {
            const dropY = 28 + ((item.age * 1.8 + index * 13) % 17);
            ctx.beginPath();
            ctx.ellipse(index * 14, dropY, 2.8, 6.5, 0.2, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.strokeStyle = "#ffe889";
        ctx.lineWidth = 5;
        ctx.lineJoin = "round";
        ctx.beginPath();
        ctx.moveTo(4, 15);
        ctx.lineTo(-4, 34);
        ctx.lineTo(4, 34);
        ctx.lineTo(-8, 57);
        ctx.stroke();
        ctx.restore();
    }

    function drawEntity(entity) {
        ctx.save();
        if (entity.role === "mission") {
            ctx.strokeStyle = "rgba(255, 247, 181, 0.72)";
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 7]);
            ctx.beginPath();
            ctx.arc(entity.x, entity.y, entity.radius + 10 + Math.sin(entity.age * 0.06) * 3, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
        }
        if (entity.type === "flower") drawFlower(entity);
        else if (entity.type === "pollen") drawPollen(entity);
        else if (entity.type === "leaf") drawLeaf(entity);
        else if (entity.type === "seed") drawSeed(entity);
        else if (entity.type === "hope" || entity.type === "faith") drawHope(entity);
        else if (entity.type === "storm") drawStorm(entity);
        else drawHoney(entity);
        ctx.restore();
    }

    function drawBee(time) {
        const bob = reducedMotion ? 0 : Math.sin(time * 0.008) * 2.4;
        const wing = reducedMotion ? 0.72 : 0.58 + Math.sin(time * 0.038) * 0.18;
        bee.tilt = lerp(bee.tilt, bee.targetTilt, 0.15);
        ctx.save();
        ctx.globalAlpha = game.invulnerable > 0 && !reducedMotion && Math.floor(game.invulnerable / 5) % 2 ? 0.48 : 1;
        ctx.translate(bee.x, bee.y + bob);
        ctx.rotate(bee.tilt);

        if (game.shields > 0) {
            const pulse = reducedMotion ? 0 : Math.sin(time * 0.006) * 3;
            const glow = ctx.createRadialGradient(0, 0, 25, 0, 0, 45 + pulse);
            glow.addColorStop(0.5, "rgba(117, 222, 139, 0.08)");
            glow.addColorStop(0.82, "rgba(117, 222, 139, 0.34)");
            glow.addColorStop(1, "rgba(181, 255, 195, 0)");
            ctx.fillStyle = glow;
            ctx.beginPath();
            ctx.arc(0, 0, 48 + pulse, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "rgba(195, 255, 202, 0.78)";
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        if (game.carriedGift) {
            ctx.save();
            ctx.globalAlpha = 0.74;
            ctx.strokeStyle = "#ffe995";
            ctx.lineWidth = 2.2;
            ctx.shadowColor = "rgba(255, 226, 105, 0.6)";
            ctx.shadowBlur = 9;
            ctx.beginPath();
            ctx.ellipse(0, -45, 18, 5, 0, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }

        ctx.save();
        ctx.globalAlpha = 0.78;
        ctx.fillStyle = "#e9fbff";
        ctx.strokeStyle = "rgba(71, 112, 141, 0.6)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(-17, -17, 13, 22 * wing, -0.65, 0, Math.PI * 2);
        ctx.ellipse(17, -17, 13, 22 * wing, 0.65, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        const bodyGradient = ctx.createLinearGradient(-28, 0, 28, 0);
        bodyGradient.addColorStop(0, "#e69b22");
        bodyGradient.addColorStop(0.32, "#ffd952");
        bodyGradient.addColorStop(0.7, "#ffc431");
        bodyGradient.addColorStop(1, "#b96b18");
        ctx.fillStyle = bodyGradient;
        ctx.beginPath();
        ctx.ellipse(0, 5, 29, 22, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(92, 49, 20, 0.65)";
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.save();
        ctx.beginPath();
        ctx.ellipse(0, 5, 28, 21, 0, 0, Math.PI * 2);
        ctx.clip();
        ctx.fillStyle = "#4a3526";
        ctx.fillRect(-11, -18, 7, 48);
        ctx.fillRect(7, -18, 7, 48);
        ctx.restore();

        ctx.fillStyle = "#f7c73e";
        ctx.beginPath();
        ctx.arc(0, -7, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(92, 49, 20, 0.55)";
        ctx.stroke();
        ctx.fillStyle = "#273047";
        ctx.beginPath();
        ctx.arc(-7, -9, 2.4, 0, Math.PI * 2);
        ctx.arc(7, -9, 2.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(224, 104, 105, 0.42)";
        ctx.beginPath();
        ctx.ellipse(-12, -2, 4.2, 2.6, -0.12, 0, Math.PI * 2);
        ctx.ellipse(12, -2, 4.2, 2.6, 0.12, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#6a3f24";
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(0, -3, 6, 0.15, Math.PI - 0.15);
        ctx.stroke();
        ctx.strokeStyle = "#5b3a28";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-8, -23);
        ctx.quadraticCurveTo(-12, -35, -19, -35);
        ctx.moveTo(8, -23);
        ctx.quadraticCurveTo(12, -35, 19, -35);
        ctx.stroke();
        ctx.fillStyle = "#5b3a28";
        ctx.beginPath();
        ctx.arc(-19, -35, 2.5, 0, Math.PI * 2);
        ctx.arc(19, -35, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    function burst(x, y, colors, amount = 12) {
        const safeAmount = reducedMotion ? Math.min(5, Math.ceil(amount / 3)) : amount;
        for (let index = 0; index < safeAmount && particles.length < 90; index++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1.2 + Math.random() * 2.8;
            particles.push({
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 0.7,
                life: 34 + Math.random() * 24,
                maxLife: 58,
                color: colors[index % colors.length],
                size: 2 + Math.random() * 3
            });
        }
    }

    function addFloater(x, y, text, color) {
        if (floaters.length >= 12) floaters.shift();
        floaters.push({ x, y, text, color, life: 80, maxLife: 80 });
    }

    function updateAndDrawEffects(delta) {
        for (let index = particles.length - 1; index >= 0; index--) {
            const particle = particles[index];
            particle.x += particle.vx * delta;
            particle.y += particle.vy * delta;
            particle.vy += 0.035 * delta;
            particle.life -= delta;
            if (particle.life <= 0) {
                particles.splice(index, 1);
                continue;
            }
            ctx.globalAlpha = particle.life / particle.maxLife;
            ctx.fillStyle = particle.color;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;

        for (let index = floaters.length - 1; index >= 0; index--) {
            const floater = floaters[index];
            floater.y -= 0.42 * delta;
            floater.life -= delta;
            if (floater.life <= 0) {
                floaters.splice(index, 1);
                continue;
            }
            ctx.save();
            ctx.globalAlpha = clamp(floater.life / 24, 0, 1);
            ctx.font = "900 14px Inter, 'Segoe UI', sans-serif";
            ctx.textAlign = "center";
            ctx.fillStyle = floater.color;
            ctx.shadowColor = "rgba(23, 35, 60, 0.65)";
            ctx.shadowBlur = 6;
            ctx.fillText(floater.text, floater.x, floater.y);
            ctx.restore();
        }
    }

    function randomPointInBounds(margin = 46) {
        const bounds = playBounds();
        return {
            x: bounds.left + margin + Math.random() * Math.max(1, bounds.right - bounds.left - margin * 2),
            y: bounds.top + margin + Math.random() * Math.max(1, bounds.bottom - bounds.top - margin * 2)
        };
    }

    function missionEntity() {
        return entities.find(entity => entity.role === "mission");
    }

    function spawnMissionGift() {
        if (game.carriedGift || game.seasonLinks >= 3 || missionEntity()) return;
        let point = randomPointInBounds(58);
        for (let attempt = 0; attempt < 5 && distanceBetween(point, bee) < 120; attempt++) {
            point = randomPointInBounds(58);
        }
        const season = currentSeason();
        entities.push({
            role: "mission",
            type: season.gift,
            x: point.x,
            y: point.y,
            anchorX: point.x,
            anchorY: point.y,
            vx: (Math.random() - 0.5) * 0.42,
            vy: (Math.random() - 0.5) * 0.32,
            speed: 0,
            radius: season.gift === "leaf" ? 24 : 22,
            age: Math.random() * 80,
            rotation: Math.random() * Math.PI * 2,
            spin: (Math.random() - 0.5) * 0.02,
            swayRate: 0.025 + Math.random() * 0.018,
            swayAmplitude: 10 + Math.random() * 12,
            scale: 1
        });
    }

    function spawnBonus() {
        const bonusCount = entities.filter(entity => entity.role === "bonus").length;
        if (bonusCount >= 4) return;
        const roll = Math.random();
        const type = roll < 0.29 ? "leaf" : roll < 0.51 ? "faith" : roll < 0.82 ? "honey" : "flower";
        const point = randomPointInBounds(42);
        entities.push({
            role: "bonus",
            type,
            x: point.x,
            y: point.y,
            anchorX: point.x,
            anchorY: point.y,
            vx: (Math.random() - 0.5) * 0.54,
            vy: 0.16 + Math.random() * 0.24,
            speed: 0,
            radius: type === "flower" ? 23 : 21,
            age: Math.random() * 90,
            rotation: Math.random() * Math.PI * 2,
            spin: (Math.random() - 0.5) * 0.024,
            swayRate: 0.02 + Math.random() * 0.02,
            swayAmplitude: 12 + Math.random() * 16,
            scale: 0.88,
            expires: 680
        });
    }

    function spawnStorm(preferredX = null) {
        const bounds = playBounds();
        const stormLimit = viewWidth < 480 ? 2 : Math.min(4, 2 + game.seasonIndex);
        if (entities.filter(entity => entity.type === "storm").length >= stormLimit) return;
        const minX = bounds.left + 34;
        const maxX = bounds.right - 34;
        const safeGap = Math.min(105, Math.max(72, (maxX - minX) * 0.45));
        const intervals = [];
        if (bee.x - safeGap > minX) intervals.push([minX, Math.min(maxX, bee.x - safeGap)]);
        if (bee.x + safeGap < maxX) intervals.push([Math.max(minX, bee.x + safeGap), maxX]);

        let x = preferredX;
        if (x == null || x < minX || x > maxX || Math.abs(x - bee.x) < safeGap) {
            if (intervals.length) {
                const total = intervals.reduce((sum, interval) => sum + Math.max(1, interval[1] - interval[0]), 0);
                let roll = Math.random() * total;
                const interval = intervals.find(candidate => {
                    roll -= Math.max(1, candidate[1] - candidate[0]);
                    return roll <= 0;
                }) || intervals[intervals.length - 1];
                x = lerp(interval[0], interval[1], Math.random());
            } else {
                x = Math.abs(minX - bee.x) >= Math.abs(maxX - bee.x) ? minX : maxX;
            }
        }
        entities.push({
            role: "hazard",
            type: "storm",
            x,
            y: bounds.top + 26,
            anchorX: x,
            anchorY: bounds.top + 26,
            vx: (Math.random() - 0.5) * (0.34 + game.seasonIndex * 0.09),
            vy: 0,
            speed: (2.05 + game.seasonIndex * 0.38 + Math.random() * 0.42) * (game.guidingGlow ? 0.88 : 1),
            radius: 31,
            age: Math.random() * 20,
            rotation: 0,
            spin: 0,
            swayRate: 0.018 + Math.random() * 0.013,
            swayAmplitude: 18 + Math.random() * 25,
            telegraph: (reducedMotion ? 56 : 42) + (game.guidingGlow ? 18 : 0),
            telegraphMax: (reducedMotion ? 56 : 42) + (game.guidingGlow ? 18 : 0)
        });
    }

    function spawnAmbientEntity() {
        const season = currentSeason();
        const pressure = clamp(game.difficultyTimer / 3600, 0, 1) * 0.07;
        const stormLimit = viewWidth < 480 ? 2 : Math.min(4, 2 + game.seasonIndex);
        const canStorm = entities.filter(entity => entity.type === "storm").length < stormLimit;
        const chooseStorm = canStorm
            && game.stormSpawnStreak < 2
            && Math.random() < season.stormChance + pressure;

        if (chooseStorm) {
            spawnStorm();
            game.stormSpawnStreak += 1;
            game.lastSpawnType = "storm";
            if (viewWidth >= 640 && game.seasonIndex >= 2 && Math.random() < 0.18) {
                const bounds = playBounds();
                const secondX = bee.x < viewWidth / 2 ? bounds.right - 48 : bounds.left + 48;
                spawnStorm(secondX);
            }
            return;
        }

        game.stormSpawnStreak = 0;
        game.lastSpawnType = "relief";
        if (Math.random() < 0.58) spawnBonus();
    }

    function updateCurrentDust(delta) {
        const bounds = playBounds();
        currentDust.forEach(dust => {
            const vector = currentVectorAt(dust.x, dust.y);
            dust.x += (vector.x * 17 + 0.12) * delta;
            dust.y += (vector.y * 17 - 0.03) * delta;
            dust.age += delta;
            if (dust.x > bounds.right + 12) dust.x = bounds.left - 10;
            if (dust.x < bounds.left - 12) dust.x = bounds.right + 10;
            if (dust.y > bounds.bottom + 12) dust.y = bounds.top - 10;
            if (dust.y < bounds.top - 12) dust.y = bounds.bottom + 10;
        });
    }

    function collectMissionGift(entity) {
        const season = currentSeason();
        game.carriedGift = entity.type;
        game.score += 25;
        game.stats.giftsCarried += 1;
        burst(entity.x, entity.y, ["#fff2a1", "#d9fff4", "#ffc84e"], 15);
        addFloater(entity.x, entity.y, "+25 Belief", "#fff2a1");
        sfxGift(entity.type);
        showCaption(`Bea carries ${season.giftName}. Its purpose is near, even when the way is not clear.`);
        updateHud(`${season.giftName} collected. Carry it to ${activeTarget()?.name || "its purpose"}.`);
    }

    function collectBonus(entity) {
        if (entity.type === "leaf") {
            game.shields = Math.min(3, game.shields + 1);
            game.score += 18;
            burst(entity.x, entity.y, ["#8ee294", "#d6ffd3", "#4da866"], 13);
            addFloater(entity.x, entity.y, "+1 Shelter", "#c8ffd0");
            showToast("Leif left shelter in your path.");
        } else if (entity.type === "faith") {
            game.faith = Math.min(game.maxFaith, game.faith + 1);
            game.score += 15;
            burst(entity.x, entity.y, ["#e8fff7", "#94ebdf", "#fff3ad"], 13);
            addFloater(entity.x, entity.y, "+1 Faith Pulse", "#d9fff4");
        } else if (entity.type === "flower") {
            game.score += 32;
            burst(entity.x, entity.y, ["#f08bc5", "#ffd95a", "#ffafd7"], 16);
            addFloater(entity.x, entity.y, "+32 Belief", "#ffd8ed");
        } else {
            game.score += 38;
            burst(entity.x, entity.y, ["#ffc84e", "#fff0a1", "#e7901d"], 14);
            addFloater(entity.x, entity.y, "+38 Belief", "#ffe8a0");
        }
        sfxGift(entity.type);
        updateHud();
    }

    function handleStormHit(entity) {
        if (game.invulnerable > 0) return;
        sfxThunder();
        screenFlash = reducedMotion ? 0.06 : 1;
        game.invulnerable = 92;
        game.stats.stormsWeathered += 1;
        burst(entity.x, entity.y, ["#d5dcff", "#7e8fb8", "#ffe563"], 20);

        if (game.shields > 0) {
            game.shields -= 1;
            addFloater(entity.x, entity.y, "Leif's shelter held", "#d9e5ff");
            showCaption("The storm struck—but a kindness gathered earlier became shelter now.");
            updateHud("A leaf shield protected Bea.");
            return;
        }

        game.hope -= 1;
        if (game.carriedGift && !(game.state === STATES.FINALE && game.finalePhase === "flight")) {
            game.carriedGift = null;
            game.missionTimer = -40;
            addFloater(entity.x, entity.y, "Gift scattered", "#ffe1d8");
        } else {
            addFloater(entity.x, entity.y, "Hope held", "#ffe1d8");
        }
        if (game.hope <= 0) {
            gameOver();
            return;
        }
        showCaption("The wind scattered Bea’s path, not her purpose. Hope remains.");
        updateHud(`Storm weathered. ${game.hope} hope ${game.hope === 1 ? "petal remains" : "petals remain"}.`);
    }

    function completeConnection() {
        const season = currentSeason();
        const targetIndex = game.seasonLinks;
        const target = season.targets[targetIndex];
        if (!target || !game.carriedGift) return;
        const point = pointFromTarget(target);
        game.carriedGift = null;
        game.seasonLinks += 1;
        game.totalLinks += 1;
        game.score += 125 + game.seasonIndex * 25;
        game.faith = Math.min(game.maxFaith, game.faith + 1);
        game.connections.push({ season: season.key, targetIndex, name: target.name });
        burst(point.x, point.y, ["#fff2a1", "#b7fff2", "#f08bc5", "#ffe17b"], 24);
        addFloater(point.x, point.y, "+ Purpose", "#e8fff7");
        sfxConnection();
        game.faithReveal = Math.max(game.faithReveal, 90);
        screenFlash = Math.max(screenFlash, reducedMotion ? 0.06 : 0.38);
        showCaption(season.consequence, 3200);
        updateHud(`${target.name} connected to the Purpose Thread. ${game.totalLinks} of 12 connections complete.`);

        if (game.seasonLinks >= 3) {
            game.state = STATES.SEASON_COMPLETE;
            game.seasonCompleteAt = performance.now() + (reducedMotion ? 1200 : 2700);
            entities.length = 0;
            missionPanel.hidden = true;
            seasonKicker.textContent = `${season.shortName} remembered`;
            seasonName.textContent = "Three Small Acts. One Living Promise.";
            seasonLesson.textContent = season.reveal;
            seasonBanner.hidden = false;
        } else {
            game.missionTimer = -42;
        }
    }

    function updateEntities(delta) {
        const bounds = playBounds();
        game.missionTimer += delta;
        if (game.missionTimer >= 30) spawnMissionGift();

        for (let index = entities.length - 1; index >= 0; index--) {
            const entity = entities[index];
            entity.age += delta;
            entity.rotation += (entity.spin || 0) * delta;

            if (entity.type === "storm") {
                if (entity.telegraph > 0) {
                    entity.telegraph -= delta;
                } else {
                    entity.anchorX += entity.vx * delta;
                    if (entity.anchorX < bounds.left + 28 || entity.anchorX > bounds.right - 28) entity.vx *= -1;
                    entity.y += entity.speed * delta;
                    entity.x = clamp(entity.anchorX + Math.sin(entity.age * entity.swayRate) * entity.swayAmplitude, bounds.left + 25, bounds.right - 25);
                }
            } else {
                entity.anchorX += entity.vx * delta;
                entity.anchorY += entity.vy * delta;
                if (entity.anchorX < bounds.left + 30 || entity.anchorX > bounds.right - 30) entity.vx *= -1;
                if (entity.anchorY < bounds.top + 28 || entity.anchorY > bounds.bottom - 28) entity.vy *= -1;
                entity.anchorX = clamp(entity.anchorX, bounds.left + 28, bounds.right - 28);
                entity.anchorY = clamp(entity.anchorY, bounds.top + 28, bounds.bottom - 28);
                entity.x = entity.anchorX + Math.sin(entity.age * entity.swayRate) * entity.swayAmplitude;
                entity.y = entity.anchorY + Math.cos(entity.age * entity.swayRate * 0.82) * entity.swayAmplitude * 0.42;
            }

            const expired = entity.type === "storm"
                ? entity.y > bounds.bottom + 85
                : entity.role === "bonus" && entity.age > entity.expires;
            if (expired) {
                entities.splice(index, 1);
                continue;
            }

            if (entity.type === "storm" && entity.telegraph > 0) continue;
            if (Math.hypot(bee.x - entity.x, bee.y - entity.y) >= entity.radius + 24) continue;
            entities.splice(index, 1);
            if (entity.role === "mission") collectMissionGift(entity);
            else if (entity.role === "hazard") handleStormHit(entity);
            else collectBonus(entity);
            if (game.state === STATES.OVER) return;
        }

        if (game.carriedGift) {
            const target = activeTarget();
            if (target && distanceBetween(bee, pointFromTarget(target)) < 46) completeConnection();
        }
    }

    function makeCheckpoint() {
        game.checkpoint = {
            seasonIndex: game.seasonIndex,
            totalLinks: game.totalLinks,
            score: game.score,
            shields: game.shields,
            connections: game.connections.map(connection => ({ ...connection })),
            stats: { ...game.stats }
        };
    }

    function restoreCheckpoint() {
        const checkpoint = game.checkpoint;
        if (!checkpoint) return;
        game.seasonIndex = checkpoint.seasonIndex;
        game.totalLinks = checkpoint.totalLinks;
        game.score = checkpoint.score;
        game.shields = checkpoint.shields;
        game.connections = checkpoint.connections.map(connection => ({ ...connection }));
        game.stats = { ...checkpoint.stats };
    }

    function resetSeasonRuntime() {
        const bounds = playBounds();
        entities.length = 0;
        particles.length = 0;
        floaters.length = 0;
        game.carriedGift = null;
        game.seasonLinks = 0;
        game.hope = 3;
        game.faith = game.maxFaith;
        game.faithReveal = 0;
        game.pulseWave = 0;
        game.spawnTimer = 0;
        game.missionTimer = 0;
        game.difficultyTimer = 0;
        game.stormSpawnStreak = 0;
        game.lastSpawnType = "";
        game.invulnerable = 0;
        bee.x = viewWidth / 2;
        bee.y = lerp(bounds.top, bounds.bottom, 0.68);
        bee.vx = 0;
        bee.vy = 0;
        bee.tilt = 0;
        bee.targetTilt = 0;
        seedCurrentDust();
    }

    function beginSeason(index) {
        game.seasonIndex = clamp(index, 0, seasonDefinitions.length - 1);
        resetSeasonRuntime();
        makeCheckpoint();
        const season = currentSeason();
        game.state = STATES.TRANSITION;
        game.transitionEnds = performance.now() + (reducedMotion ? 1050 : 2250);
        seasonKicker.textContent = season.roman;
        seasonName.textContent = season.title;
        seasonLesson.textContent = season.lesson;
        seasonBanner.hidden = false;
        missionPanel.hidden = true;
        faithButton.hidden = false;
        pauseToggle.hidden = false;
        pauseCurtain.hidden = true;
        gameContainer.classList.add("playing");
        gameContainer.classList.remove("finale", "finale-flight");
        setFlightControlsInert(false);
        updateHud(`${season.title}. ${season.lesson}`);
    }

    function startGame() {
        game.seasonIndex = 0;
        game.seasonLinks = 0;
        game.totalLinks = 0;
        game.score = 0;
        game.hope = 3;
        game.shields = 0;
        game.faith = game.maxFaith;
        game.connections = [];
        game.checkpoint = null;
        game.creditsRunning = false;
        game.finaleBeat = 0;
        game.finalePhase = "flight";
        game.failedInFinale = false;
        game.finaleCheckpoint = null;
        game.stats = { stormsWeathered: 0, pulsesUsed: 0, giftsCarried: 0, distance: 0, optionalHelp: game.guidingGlow ? 1 : 0 };
        lastTime = 0;
        screenFlash = 0;
        clearKeys();
        window.clearTimeout(captionTimer);
        window.clearTimeout(toastTimer);
        hideCaption();
        hideToast();
        creditsViewport.scrollTop = 0;
        document.body.classList.add("game-focused");
        startScreen.hidden = true;
        gameOverScreen.hidden = true;
        winScreen.hidden = true;
        seasonBanner.hidden = true;
        pauseCurtain.hidden = true;
        gameContainer.classList.add("playing");
        gameContainer.classList.remove("finale", "finale-flight");
        syncGameViewport({ reveal: true, forceLayout: true });
        prepareAudio();
        beginSeason(0);
        canvas.focus({ preventScroll: true });
    }

    function retryCurrentSeason() {
        if (game.failedInFinale) {
            game.failedInFinale = false;
            startScreen.hidden = true;
            gameOverScreen.hidden = true;
            winScreen.hidden = true;
            document.body.classList.add("game-focused");
            syncGameViewport({ reveal: true, forceLayout: true });
            prepareAudio();
            beginFinale({ retry: true });
            canvas.focus({ preventScroll: true });
            return;
        }
        restoreCheckpoint();
        startScreen.hidden = true;
        gameOverScreen.hidden = true;
        winScreen.hidden = true;
        document.body.classList.add("game-focused");
        gameContainer.classList.add("playing");
        syncGameViewport({ reveal: true, forceLayout: true });
        prepareAudio();
        beginSeason(game.seasonIndex);
        canvas.focus({ preventScroll: true });
    }

    function gameOver() {
        game.failedInFinale = game.state === STATES.FINALE;
        game.state = STATES.OVER;
        clearKeys();
        window.clearTimeout(captionTimer);
        window.clearTimeout(toastTimer);
        hideCaption();
        hideToast();
        gameContainer.classList.remove("playing", "finale", "finale-flight");
        setFlightControlsInert(true);
        missionPanel.hidden = true;
        seasonBanner.hidden = true;
        pauseCurtain.hidden = true;
        gameContainer.style.removeProperty("--playfield-height");
        lockedLayoutWidth = 0;
        lockedOrientation = "";
        bgMusic.pause();
        finalScoreDisplay.textContent = `Belief Collected: ${game.score} · Purpose Thread: ${game.totalLinks} / 12`;
        gameOverScreen.hidden = false;
        announce(game.failedInFinale
            ? "The Great Storm was strong, but the garden is still connected. Retry the final flight."
            : `The storm was strong. Continue from ${currentSeason().shortName}. ${game.totalLinks} Purpose Thread connections are safe.`);
        gameOverScreen.querySelector("[data-retry-season]")?.focus({ preventScroll: true });
    }

    function updatePointerFromEvent(event) {
        const rect = canvas.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        const bounds = playBounds();
        pointer.x = clamp((event.clientX - rect.left) * (viewWidth / rect.width), bounds.left, bounds.right);
        const pointerType = event.pointerType || "mouse";
        const touchLift = pointerType === "touch" || pointerType === "pen"
            ? 46 * (viewHeight / rect.height)
            : 0;
        pointer.y = clamp((event.clientY - rect.top) * (viewHeight / rect.height) - touchLift, bounds.top, bounds.bottom);
        pointer.type = pointerType;
        pointer.active = true;
    }

    function readGamepad() {
        const pads = navigator.getGamepads?.() || [];
        const pad = Array.from(pads).find(candidate => candidate?.connected);
        if (!pad) {
            gamepadPrevious.pulse = false;
            gamepadPrevious.pause = false;
            return { x: 0, y: 0, active: false };
        }
        const deadzone = 0.18;
        const rawAxisX = pad.axes[0] || 0;
        const rawAxisY = pad.axes[1] || 0;
        const rawMagnitude = Math.hypot(rawAxisX, rawAxisY);
        const axisMagnitude = rawMagnitude > deadzone
            ? clamp((rawMagnitude - deadzone) / (1 - deadzone), 0, 1)
            : 0;
        const axisX = rawMagnitude > 0 ? rawAxisX / rawMagnitude * axisMagnitude : 0;
        const axisY = rawMagnitude > 0 ? rawAxisY / rawMagnitude * axisMagnitude : 0;
        const dpadX = (pad.buttons[15]?.pressed ? 1 : 0) - (pad.buttons[14]?.pressed ? 1 : 0);
        const dpadY = (pad.buttons[13]?.pressed ? 1 : 0) - (pad.buttons[12]?.pressed ? 1 : 0);
        const pulsePressed = Boolean(pad.buttons[0]?.pressed);
        const pausePressed = Boolean(pad.buttons[9]?.pressed);
        if (pulsePressed && !gamepadPrevious.pulse) useFaithPulse();
        if (pausePressed && !gamepadPrevious.pause) togglePause();
        gamepadPrevious.pulse = pulsePressed;
        gamepadPrevious.pause = pausePressed;
        let x = dpadX || axisX;
        let y = dpadY || axisY;
        const magnitude = Math.hypot(x, y);
        if (magnitude > 1) {
            x /= magnitude;
            y /= magnitude;
        }
        return { x, y, active: Math.abs(x) > 0.01 || Math.abs(y) > 0.01 };
    }

    function pollMenuGamepad() {
        const pads = navigator.getGamepads?.() || [];
        const pad = Array.from(pads).find(candidate => candidate?.connected);
        if (!pad) {
            gamepadPrevious.pulse = false;
            gamepadPrevious.pause = false;
            return;
        }
        const primaryPressed = Boolean(pad.buttons[0]?.pressed);
        const startPressed = Boolean(pad.buttons[9]?.pressed);
        const primaryEdge = primaryPressed && !gamepadPrevious.pulse;
        const startEdge = startPressed && !gamepadPrevious.pause;

        if (game.state === STATES.PAUSED && (startEdge || primaryEdge)) {
            resumeGame();
        } else if (startEdge && [STATES.TRANSITION, STATES.SEASON_COMPLETE, STATES.FINALE].includes(game.state)) {
            pauseGame();
        } else if (primaryEdge && game.state === STATES.READY) {
            startGame();
        } else if (primaryEdge && game.state === STATES.OVER) {
            retryCurrentSeason();
        } else if (primaryEdge && game.state === STATES.CREDITS) {
            startGame();
        }

        if (game.state === STATES.CREDITS) {
            const axisY = Math.abs(pad.axes[1] || 0) > 0.22 ? pad.axes[1] : 0;
            const dpadY = (pad.buttons[13]?.pressed ? 1 : 0) - (pad.buttons[12]?.pressed ? 1 : 0);
            if (axisY || dpadY) {
                game.creditsRunning = false;
                creditsToggle.textContent = "Play Credits";
                creditsViewport.scrollTop += (axisY || dpadY) * 9;
            }
        }
        gamepadPrevious.pulse = primaryPressed;
        gamepadPrevious.pause = startPressed;
    }

    function updateBeeMovement(delta) {
        const bounds = playBounds();
        const pad = readGamepad();
        const finaleFlight = game.state === STATES.FINALE && game.finalePhase === "flight";
        if (game.state !== STATES.PLAYING && !finaleFlight) return;
        let inputX = 0;
        let inputY = 0;
        let inputActive = false;

        if (pad.active) {
            inputX = pad.x;
            inputY = pad.y;
            inputActive = true;
            pointer.active = false;
        } else if (keys.left || keys.right || keys.up || keys.down) {
            inputX = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
            inputY = (keys.down ? 1 : 0) - (keys.up ? 1 : 0);
            const magnitude = Math.hypot(inputX, inputY) || 1;
            inputX /= magnitude;
            inputY /= magnitude;
            inputActive = true;
            pointer.active = false;
        } else if (pointer.active) {
            const dx = pointer.x - bee.x;
            const dy = pointer.y - bee.y;
            const distance = Math.hypot(dx, dy);
            if (distance > 3) {
                const strength = clamp(distance / 92, 0.12, 1);
                inputX = dx / distance * strength;
                inputY = dy / distance * strength;
                inputActive = true;
            }
        }

        const maxSpeed = clamp(Math.min(viewWidth, viewHeight) / 86, 4.6, 7.1);
        const current = currentVectorAt(bee.x, bee.y);
        const desiredX = (inputActive ? inputX * maxSpeed : 0) + current.x * 18;
        const desiredY = (inputActive ? inputY * maxSpeed : 0) + current.y * 18;
        const response = 1 - Math.pow(inputActive ? 0.74 : 0.82, delta);
        bee.vx = lerp(bee.vx, desiredX, response);
        bee.vy = lerp(bee.vy, desiredY, response);
        bee.x += bee.vx * delta;
        bee.y += bee.vy * delta;

        if (bee.x < bounds.left || bee.x > bounds.right) {
            bee.x = clamp(bee.x, bounds.left, bounds.right);
            bee.vx *= -0.18;
        }
        if (bee.y < bounds.top || bee.y > bounds.bottom) {
            bee.y = clamp(bee.y, bounds.top, bounds.bottom);
            bee.vy *= -0.18;
        }
        bee.targetTilt = clamp(bee.vx * 0.052, -0.34, 0.34);
        game.stats.distance += Math.hypot(bee.vx, bee.vy) * delta;
    }

    function useFaithPulse() {
        const finaleFlight = game.state === STATES.FINALE && game.finalePhase === "flight";
        if ((game.state !== STATES.PLAYING && !finaleFlight) || game.faith <= 0) return;
        game.faith -= 1;
        game.faithReveal = 165;
        game.pulseWave = 0.02;
        game.stats.pulsesUsed += 1;
        faithButton.classList.add("pulsing");
        window.setTimeout(() => faithButton.classList.remove("pulsing"), 220);
        sfxPulse();
        const target = activeTarget();
        showToast(target ? `Faith reveals a way toward ${target.name}.` : "The unseen current becomes visible.", 1900);
        updateHud(`Faith Pulse used. ${game.faith} ${game.faith === 1 ? "charge remains" : "charges remain"}.`);
    }

    function drawFaithWave() {
        if (game.pulseWave <= 0 || game.pulseWave >= 1) return;
        const radius = game.pulseWave * Math.max(viewWidth, viewHeight) * 0.72;
        ctx.save();
        ctx.strokeStyle = `rgba(221, 255, 246, ${(1 - game.pulseWave) * 0.78})`;
        ctx.lineWidth = 4 - game.pulseWave * 2;
        ctx.shadowColor = "rgba(154, 255, 225, 0.84)";
        ctx.shadowBlur = 18;
        ctx.beginPath();
        ctx.arc(bee.x, bee.y, radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }

    function drawTouchDestination() {
        if (!pointer.active || (pointer.type !== "touch" && pointer.type !== "pen")) return;
        ctx.save();
        ctx.strokeStyle = "rgba(255, 247, 181, 0.72)";
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 5]);
        ctx.beginPath();
        ctx.arc(pointer.x, pointer.y, 13, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = "rgba(255, 247, 181, 0.7)";
        ctx.beginPath();
        ctx.arc(pointer.x, pointer.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    function drawCarriedGift(time) {
        if (!game.carriedGift) return;
        const item = {
            x: bee.x + 24,
            y: bee.y + 22,
            age: time * 0.05,
            rotation: -0.25,
            scale: 0.48
        };
        ctx.save();
        ctx.globalAlpha = 0.94;
        if (game.carriedGift === "leaf") drawLeaf(item);
        else if (game.carriedGift === "seed") drawSeed(item);
        else if (game.carriedGift === "honey") {
            ctx.translate(item.x, item.y);
            ctx.scale(0.56, 0.56);
            drawHoney({ ...item, x: 0, y: 0 });
        } else if (game.carriedGift === "hope") {
            ctx.translate(item.x, item.y);
            ctx.scale(0.62, 0.62);
            drawHope({ ...item, x: 0, y: 0 });
        } else {
            ctx.translate(item.x, item.y);
            ctx.scale(0.65, 0.65);
            drawPollen({ ...item, x: 0, y: 0 });
        }
        ctx.restore();
    }

    function pauseGame(force = false) {
        if (game.state === STATES.PAUSED) return;
        const pausable = [STATES.TRANSITION, STATES.PLAYING, STATES.SEASON_COMPLETE, STATES.FINALE].includes(game.state);
        if (!pausable) return;
        game.resumeState = game.state;
        game.state = STATES.PAUSED;
        game.pausedAt = performance.now();
        freezeMessageTimers(game.pausedAt);
        setFlightControlsInert(true);
        clearKeys();
        pauseCurtain.hidden = false;
        pauseToggle.textContent = "▶";
        pauseToggle.setAttribute("aria-pressed", "true");
        pauseToggle.setAttribute("aria-label", "Resume game");
        pauseToggle.title = "Resume game";
        bgMusic.pause();
        resumeFlight.focus({ preventScroll: true });
        if (!force) announce("Flight paused.");
    }

    function resumeGame() {
        if (game.state !== STATES.PAUSED) return;
        const now = performance.now();
        const pausedDuration = Math.max(0, now - game.pausedAt);
        if (game.resumeState === STATES.TRANSITION) game.transitionEnds += pausedDuration;
        if (game.resumeState === STATES.SEASON_COMPLETE) game.seasonCompleteAt += pausedDuration;
        if (game.resumeState === STATES.FINALE) game.finaleStartedAt += pausedDuration;
        game.state = game.resumeState;
        resumeMessageTimers(now);
        setFlightControlsInert(false);
        if (game.state === STATES.FINALE && game.finalePhase !== "flight") canvas.tabIndex = -1;
        pauseCurtain.hidden = true;
        pauseToggle.textContent = "Ⅱ";
        pauseToggle.setAttribute("aria-pressed", "false");
        pauseToggle.setAttribute("aria-label", "Pause game");
        pauseToggle.title = "Pause game";
        prepareAudio();
        if (acceptsFlightInput()) canvas.focus({ preventScroll: true });
        else pauseToggle.focus({ preventScroll: true });
        announce("Flight resumed.");
    }

    function togglePause() {
        if (game.state === STATES.PAUSED) resumeGame();
        else pauseGame();
    }

    function nativeFullscreenElement() {
        return document.fullscreenElement || document.webkitFullscreenElement || null;
    }

    function updateFullscreenButton() {
        const expanded = nativeFullscreenElement() === gameContainer || pseudoFullscreen;
        fullscreenToggle.setAttribute("aria-pressed", String(expanded));
        fullscreenToggle.setAttribute("aria-label", expanded ? "Exit full screen" : "Enter full screen");
        fullscreenToggle.title = expanded ? "Exit full screen" : "Enter full screen";
        fullscreenToggle.querySelector(".fullscreen-icon").textContent = expanded ? "×" : "⛶";
        fullscreenToggle.querySelector(".fullscreen-label").textContent = expanded ? "Exit Full Screen" : "Full Screen";
        window.requestAnimationFrame(resizeCanvas);
    }

    function setPseudoFullscreen(expanded) {
        if (pseudoFullscreen === expanded) {
            updateFullscreenButton();
            return;
        }
        if (expanded) {
            fullscreenScrollY = window.scrollY;
            document.body.style.setProperty("--game-scroll-lock-top", `${-fullscreenScrollY}px`);
        }
        pseudoFullscreen = expanded;
        gameContainer.classList.toggle("pseudo-fullscreen", expanded);
        document.body.classList.toggle("game-expanded", expanded);
        if (!expanded) {
            document.body.style.removeProperty("--game-scroll-lock-top");
            requestAnimationFrame(() => {
                window.scrollTo({ top: fullscreenScrollY, behavior: "auto" });
                syncGameViewport({ reveal: isActivePlayState() });
            });
        }
        updateFullscreenButton();
    }

    function waitForNativeFullscreen(timeout = 700) {
        if (nativeFullscreenElement() === gameContainer) return Promise.resolve(true);
        return new Promise(resolve => {
            let timer = 0;
            const finish = value => {
                clearTimeout(timer);
                document.removeEventListener("fullscreenchange", check);
                document.removeEventListener("webkitfullscreenchange", check);
                resolve(value);
            };
            const check = () => {
                if (nativeFullscreenElement() === gameContainer) finish(true);
            };
            document.addEventListener("fullscreenchange", check);
            document.addEventListener("webkitfullscreenchange", check);
            timer = window.setTimeout(() => finish(nativeFullscreenElement() === gameContainer), timeout);
        });
    }

    async function tryNativeFullscreen(enter) {
        try {
            const request = enter.call(gameContainer);
            if (request && typeof request.then === "function") {
                await Promise.race([request.catch(() => {}), new Promise(resolve => window.setTimeout(resolve, 250))]);
            }
        } catch (_) {
            return false;
        }
        return waitForNativeFullscreen();
    }

    async function toggleFullscreen() {
        const nativeElement = nativeFullscreenElement();
        if (nativeElement === gameContainer || pseudoFullscreen) {
            if (nativeElement === gameContainer) {
                const exitFullscreen = document.exitFullscreen || document.webkitExitFullscreen;
                if (exitFullscreen) {
                    try { await exitFullscreen.call(document); } catch (_) {}
                }
            }
            if (pseudoFullscreen) setPseudoFullscreen(false);
            updateFullscreenButton();
            return;
        }
        const enter = gameContainer.requestFullscreen || gameContainer.webkitRequestFullscreen;
        if (enter && await tryNativeFullscreen(enter)) {
            updateFullscreenButton();
            return;
        }
        setPseudoFullscreen(true);
    }

    function updatePlaying(delta) {
        game.faithReveal = Math.max(0, game.faithReveal - delta);
        game.invulnerable = Math.max(0, game.invulnerable - delta);
        if (game.pulseWave > 0) {
            game.pulseWave += 0.022 * delta;
            if (game.pulseWave >= 1) game.pulseWave = 0;
        }
        updateBeeMovement(delta);
        if (game.state !== STATES.PLAYING) return;
        updateCurrentDust(delta);
        game.spawnTimer += delta;
        game.difficultyTimer += delta;
        const spawnEvery = Math.max(44, currentSeason().spawnEvery - Math.min(10, game.difficultyTimer / 720));
        if (game.spawnTimer >= spawnEvery) {
            game.spawnTimer = 0;
            spawnAmbientEntity();
        }
        updateEntities(delta);
    }

    function drawFinaleCast(time, strength) {
        if (strength <= 0.12) return;
        const bounds = playBounds();
        const cast = [
            { kind: "ant", x: 0.12, y: 0.72, delay: 0.20 },
            { kind: "butterfly", x: 0.84, y: 0.35, delay: 0.28 },
            { kind: "caterpillar", x: 0.73, y: 0.74, delay: 0.36 },
            { kind: "leaf", x: 0.20, y: 0.38, delay: 0.44 },
            { kind: "owl", x: 0.83, y: 0.59, delay: 0.52 },
            { kind: "hive", x: 0.50, y: 0.82, delay: 0.62 }
        ];
        cast.forEach((member, index) => {
            const reveal = clamp((strength - member.delay) * 3.2, 0, 1);
            if (reveal <= 0) return;
            const bob = reducedMotion ? 0 : Math.sin(time * 0.003 + index) * 3;
            drawCharacterIcon(
                member.kind,
                lerp(bounds.left, bounds.right, member.x),
                lerp(bounds.top, bounds.bottom, member.y) + bob,
                0.72 + reveal * 0.30,
                reveal
            );
        });
    }

    function finaleTargetPoint() {
        const bounds = playBounds();
        return { x: viewWidth / 2, y: lerp(bounds.top, bounds.bottom, 0.18) };
    }

    function drawFinaleObjective(time) {
        const point = finaleTargetPoint();
        const pulse = reducedMotion ? 0 : Math.sin(time * 0.006) * 5;
        ctx.save();
        const glow = ctx.createRadialGradient(point.x, point.y, 4, point.x, point.y, 68 + pulse);
        glow.addColorStop(0, "rgba(255, 250, 197, 0.94)");
        glow.addColorStop(0.35, "rgba(173, 255, 220, 0.42)");
        glow.addColorStop(1, "rgba(146, 255, 219, 0)");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(point.x, point.y, 74 + pulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(226, 255, 238, 0.88)";
        ctx.lineWidth = 3;
        ctx.setLineDash([8, 8]);
        ctx.beginPath();
        ctx.arc(point.x, point.y, 42 + pulse * 0.35, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        drawCharacterIcon("roots", point.x, point.y, 1.12, 1);
        ctx.font = "900 12px Inter, 'Segoe UI', sans-serif";
        ctx.textAlign = "center";
        ctx.fillStyle = "white";
        ctx.shadowColor = "rgba(20, 31, 64, 0.8)";
        ctx.shadowBlur = 7;
        ctx.fillText("HEART OF THE GARDEN", point.x, point.y + 55);
        ctx.restore();
    }

    function drawFinaleScene(time, delta = 1) {
        if (game.finalePhase === "flight") {
            drawBackground(time, 0.08);
            ctx.fillStyle = "rgba(20, 28, 62, 0.34)";
            ctx.fillRect(0, 0, viewWidth, viewHeight);
            drawCurrentField(time);
            drawPurposeThread(time, 0.34);
            drawFinaleObjective(time);
            entities.forEach(drawEntity);
            drawFaithWave();
            drawCarriedGift(time);
            updateAndDrawEffects(game.state === STATES.PAUSED ? 0 : delta);
            drawBee(time);
            drawTouchDestination();
            return;
        }

        const elapsed = Math.max(0, time - game.finaleStartedAt);
        const strength = clamp((elapsed - 1550) / 5200, 0, 1);
        drawBackground(time, strength);
        const stormStrength = 1 - clamp((elapsed - 1450) / 3300, 0, 1);
        if (stormStrength > 0) {
            ctx.save();
            ctx.fillStyle = `rgba(20, 28, 62, ${stormStrength * 0.50})`;
            ctx.fillRect(0, 0, viewWidth, viewHeight);
            const drift = reducedMotion ? 0 : (time * 0.025) % (viewWidth + 250);
            drawAmbientCloud(viewWidth * 0.12 + drift * 0.22, viewHeight * 0.23, 1.34, 0.62 * stormStrength, true);
            drawAmbientCloud(viewWidth * 0.62 - drift * 0.16, viewHeight * 0.31, 1.12, 0.55 * stormStrength, true);
            if (!reducedMotion && Math.floor(elapsed / 760) % 3 === 1) {
                ctx.strokeStyle = `rgba(255, 242, 159, ${0.42 * stormStrength})`;
                ctx.lineWidth = 5;
                ctx.beginPath();
                ctx.moveTo(viewWidth * 0.72, playBounds().top - 20);
                ctx.lineTo(viewWidth * 0.66, viewHeight * 0.40);
                ctx.lineTo(viewWidth * 0.70, viewHeight * 0.40);
                ctx.lineTo(viewWidth * 0.61, viewHeight * 0.67);
                ctx.stroke();
            }
            ctx.restore();
        }
        drawPurposeThread(time, Math.max(0.05, strength));
        drawFinaleCast(time, strength);
        const bounds = playBounds();
        bee.x = lerp(bee.x, viewWidth / 2, reducedMotion ? 0.08 : 0.025);
        bee.y = lerp(bee.y, lerp(bounds.top, bounds.bottom, 0.52), reducedMotion ? 0.08 : 0.025);
        bee.targetTilt = 0;
        drawBee(time);
        drawFaithWave();
        if (strength > 0.62) {
            ctx.save();
            const glow = ctx.createRadialGradient(bee.x, bee.y, 20, bee.x, bee.y, Math.max(viewWidth, viewHeight) * 0.72);
            glow.addColorStop(0, `rgba(255, 249, 191, ${(strength - 0.62) * 0.52})`);
            glow.addColorStop(1, "rgba(255, 242, 157, 0)");
            ctx.fillStyle = glow;
            ctx.fillRect(0, 0, viewWidth, viewHeight);
            ctx.restore();
        }
    }

    function beginFinale({ retry = false } = {}) {
        const bounds = playBounds();
        game.state = STATES.FINALE;
        game.finalePhase = "flight";
        game.finaleStartedAt = performance.now();
        game.finaleBeat = 0;
        game.failedInFinale = false;
        game.carriedGift = "seed";
        game.hope = 3;
        if (retry && game.finaleCheckpoint) {
            game.score = game.finaleCheckpoint.score;
            game.shields = game.finaleCheckpoint.shields;
            game.stats = { ...game.finaleCheckpoint.stats };
        } else {
            game.shields = Math.max(1, game.shields);
            game.finaleCheckpoint = {
                score: game.score,
                shields: game.shields,
                stats: { ...game.stats }
            };
        }
        game.faith = game.maxFaith;
        game.faithReveal = 200;
        game.pulseWave = 0.02;
        game.spawnTimer = -20;
        game.difficultyTimer = 0;
        game.stormSpawnStreak = 0;
        game.invulnerable = 80;
        entities.length = 0;
        particles.length = 0;
        floaters.length = 0;
        bee.x = viewWidth / 2;
        bee.y = lerp(bounds.top, bounds.bottom, 0.84);
        bee.vx = 0;
        bee.vy = 0;
        clearKeys();
        gameContainer.classList.add("finale", "finale-flight", "playing");
        setFlightControlsInert(false);
        faithButton.hidden = false;
        missionPanel.hidden = false;
        pauseToggle.hidden = false;
        seasonKicker.textContent = "Finale · Playable";
        seasonName.textContent = "The Great Storm";
        seasonLesson.textContent = "Carry the Seed of Spring through the final unseen current.";
        seasonBanner.hidden = false;
        updateHud("Final flight. Carry the Seed of Spring to the Heart of the Garden.");
        showCaption("Every season has led here. Carry the Seed of Spring through the Great Storm.", 3300);
        announce("Final playable flight. Carry the Seed of Spring to the Heart of the Garden.");
        sfxThunder();
    }

    function completeFinaleFlight() {
        game.finalePhase = "cinematic";
        game.finaleStartedAt = performance.now();
        game.finaleBeat = 0;
        game.carriedGift = null;
        game.score += 500;
        canvas.tabIndex = -1;
        entities.length = 0;
        missionPanel.hidden = true;
        faithButton.hidden = true;
        gameContainer.classList.remove("finale-flight");
        seasonKicker.textContent = "Purpose Revealed";
        seasonName.textContent = "The Garden Remembers";
        seasonLesson.textContent = "No faithful act was ever alone.";
        seasonBanner.hidden = false;
        screenFlash = reducedMotion ? 0.06 : 0.72;
        burst(bee.x, bee.y, ["#fff2a1", "#b7fff2", "#f08bc5", "#ffe17b"], 34);
        sfxConnection();
        showCaption("The Seed reached the garden’s heart—and every unseen thread answered.", 2800);
        updateHud("The final connection is complete.");
    }

    function updateFinaleFlight(delta) {
        game.faithReveal = Math.max(0, game.faithReveal - delta);
        game.invulnerable = Math.max(0, game.invulnerable - delta);
        if (game.pulseWave > 0) {
            game.pulseWave += 0.022 * delta;
            if (game.pulseWave >= 1) game.pulseWave = 0;
        }
        updateBeeMovement(delta);
        if (game.state !== STATES.FINALE) return;
        updateCurrentDust(delta);
        game.spawnTimer += delta;
        game.difficultyTimer += delta;
        if (game.spawnTimer >= (viewWidth < 480 ? 64 : 52)) {
            game.spawnTimer = 0;
            spawnStorm();
            if (Math.random() < 0.24) spawnBonus();
        }
        updateEntities(delta);
        if (game.state !== STATES.FINALE) return;
        if (distanceBetween(bee, finaleTargetPoint()) < 52) completeFinaleFlight();
    }

    function updateFinale(timestamp, delta) {
        if (game.finalePhase === "flight") {
            if (timestamp - game.finaleStartedAt > 1500) seasonBanner.hidden = true;
            updateFinaleFlight(delta);
            return;
        }
        const elapsed = timestamp - game.finaleStartedAt;
        const beats = [
            { at: 1900, text: "But every promise Bea carried answered at once." },
            { at: 3900, text: "Leif became shelter. The flowers became food. Small lives became a living network." },
            { at: 6100, text: "The garden remembered." },
            { at: 7900, text: "And Bea finally saw what faith had built." }
        ];
        if (elapsed > 1500) seasonBanner.hidden = true;
        while (game.finaleBeat < beats.length && elapsed >= beats[game.finaleBeat].at) {
            const beat = beats[game.finaleBeat];
            showCaption(beat.text, game.finaleBeat === beats.length - 1 ? 2600 : 2300);
            if (game.finaleBeat === 1) sfxConnection();
            if (game.finaleBeat === 2) {
                sfxPulse();
                screenFlash = reducedMotion ? 0.06 : 0.78;
            }
            game.finaleBeat += 1;
        }
        if (elapsed >= 10300) showCredits();
    }

    function showCredits() {
        if (game.state === STATES.CREDITS) return;
        game.state = STATES.CREDITS;
        clearKeys();
        window.clearTimeout(captionTimer);
        window.clearTimeout(toastTimer);
        hideCaption();
        hideToast();
        gameContainer.classList.remove("playing", "finale", "finale-flight");
        setFlightControlsInert(true);
        missionPanel.hidden = true;
        faithButton.hidden = true;
        pauseToggle.hidden = true;
        seasonBanner.hidden = true;
        pauseCurtain.hidden = true;
        winScoreDisplay.textContent = `Belief Collected: ${game.score} · 12 connections · ${game.stats.stormsWeathered} storms weathered`;
        winScreen.hidden = false;
        creditsViewport.scrollTop = 0;
        game.creditsRunning = !reducedMotion;
        creditsToggle.textContent = game.creditsRunning ? "Pause Credits" : "Play Credits";
        sfxConnection();
        window.setTimeout(() => sfxPulse(), 180);
        announce("The garden remembers. The end credits are now playing.");
        creditsViewport.focus({ preventScroll: true });
    }

    function toggleCredits() {
        if (game.state !== STATES.CREDITS) return;
        const maxScroll = Math.max(0, creditsViewport.scrollHeight - creditsViewport.clientHeight);
        if (creditsViewport.scrollTop >= maxScroll - 2) creditsViewport.scrollTop = 0;
        game.creditsRunning = !game.creditsRunning;
        creditsToggle.textContent = game.creditsRunning ? "Pause Credits" : "Play Credits";
    }

    function updateCredits(delta) {
        if (!game.creditsRunning) return;
        const maxScroll = Math.max(0, creditsViewport.scrollHeight - creditsViewport.clientHeight);
        creditsViewport.scrollTop = Math.min(maxScroll, creditsViewport.scrollTop + delta * 0.58);
        if (creditsViewport.scrollTop >= maxScroll - 1) {
            game.creditsRunning = false;
            creditsToggle.textContent = "Replay Credits";
        }
    }

    function advanceJourney(timestamp, delta) {
        if (game.state === STATES.TRANSITION && timestamp >= game.transitionEnds) {
            game.state = STATES.PLAYING;
            seasonBanner.hidden = true;
            missionPanel.hidden = false;
            spawnMissionGift();
            const season = currentSeason();
            showCaption(game.seasonIndex === 0 ? season.lesson : season.reveal, 3000);
            updateHud(`${season.mission}. Find ${season.giftName}.`);
        } else if (game.state === STATES.SEASON_COMPLETE && timestamp >= game.seasonCompleteAt) {
            seasonBanner.hidden = true;
            if (game.seasonIndex >= seasonDefinitions.length - 1) beginFinale();
            else beginSeason(game.seasonIndex + 1);
        } else if (game.state === STATES.FINALE) {
            updateFinale(timestamp, delta);
        }
    }

    function drawScene(timestamp, delta) {
        ctx.clearRect(0, 0, viewWidth, viewHeight);
        if (game.state === STATES.FINALE || (game.state === STATES.PAUSED && game.resumeState === STATES.FINALE)) {
            drawFinaleScene(timestamp, delta);
        } else {
            drawBackground(timestamp);
            drawCurrentField(timestamp);
            drawPurposeThread(timestamp);
            drawTargets(timestamp);
            entities.forEach(drawEntity);
            drawFaithWave();
            drawCarriedGift(timestamp);
            updateAndDrawEffects(game.state === STATES.PAUSED ? 0 : delta);
            drawBee(timestamp);
            drawTouchDestination();
        }

        if (screenFlash > 0.01) {
            ctx.fillStyle = `rgba(236, 243, 255, ${screenFlash * 0.55})`;
            ctx.fillRect(0, 0, viewWidth, viewHeight);
            if (game.state !== STATES.PAUSED) screenFlash *= reducedMotion ? 0.18 : 0.80;
        }
    }

    function gameLoop(timestamp) {
        const delta = lastTime ? clamp((timestamp - lastTime) / 16.667, 0, 2.2) : 1;
        lastTime = timestamp;
        const movementState = game.state === STATES.PLAYING
            || (game.state === STATES.FINALE && game.finalePhase === "flight");
        if (!movementState) pollMenuGamepad();
        advanceJourney(timestamp, delta);
        if (game.state === STATES.PLAYING) updatePlaying(delta);
        if (game.state === STATES.CREDITS) updateCredits(delta);
        const staticOverlay = [STATES.READY, STATES.PAUSED, STATES.OVER, STATES.CREDITS].includes(game.state);
        if (!staticOverlay || timestamp - lastRenderTime >= 180) {
            const renderTimestamp = game.state === STATES.PAUSED ? game.pausedAt : timestamp;
            drawScene(renderTimestamp, game.state === STATES.PAUSED ? 0 : delta);
            lastRenderTime = timestamp;
        }
        animationId = requestAnimationFrame(gameLoop);
    }

    document.querySelectorAll("[data-start-game]").forEach(button => {
        button.addEventListener("click", startGame);
    });
    document.querySelector("[data-retry-season]")?.addEventListener("click", retryCurrentSeason);

    soundToggle.addEventListener("click", event => {
        event.stopPropagation();
        game.audioEnabled = !game.audioEnabled;
        try { localStorage.setItem("beliefCollectorSound", game.audioEnabled ? "1" : "0"); } catch (_) {}
        setSoundState();
        if (game.audioEnabled && isActivePlayState() && game.state !== STATES.PAUSED) prepareAudio();
        else bgMusic.pause();
    });

    guidingGlowToggle.addEventListener("change", () => {
        game.guidingGlow = guidingGlowToggle.checked;
        game.stats.optionalHelp = game.guidingGlow ? 1 : 0;
        saveGuidingGlow();
        if (game.guidingGlow) showToast("Guiding Glow will keep the unseen current softly visible.", 2200);
    });

    faithButton.addEventListener("click", event => {
        event.stopPropagation();
        useFaithPulse();
        canvas.focus({ preventScroll: true });
    });
    pauseToggle.addEventListener("click", event => {
        event.stopPropagation();
        togglePause();
    });
    resumeFlight.addEventListener("click", event => {
        event.stopPropagation();
        resumeGame();
    });
    pauseCurtain.addEventListener("click", event => {
        if (event.target === pauseCurtain) resumeGame();
    });
    pauseCurtain.addEventListener("keydown", event => {
        if (event.key === "Tab") {
            event.preventDefault();
            resumeFlight.focus({ preventScroll: true });
        }
    });
    creditsToggle.addEventListener("click", toggleCredits);
    fullscreenToggle.addEventListener("click", event => {
        event.stopPropagation();
        toggleFullscreen();
    });

    canvas.addEventListener("pointermove", event => {
        if (!acceptsFlightInput()) return;
        if (event.pointerType === "mouse" || pointer.active) updatePointerFromEvent(event);
        if (event.pointerType !== "mouse") event.preventDefault();
    });
    canvas.addEventListener("pointerdown", event => {
        if (!acceptsFlightInput()) return;
        updatePointerFromEvent(event);
        canvas.setPointerCapture?.(event.pointerId);
        event.preventDefault();
    });
    canvas.addEventListener("pointerup", event => {
        if (event.pointerType !== "mouse") pointer.active = false;
        canvas.releasePointerCapture?.(event.pointerId);
    });
    canvas.addEventListener("pointercancel", event => {
        if (event.pointerType !== "mouse") pointer.active = false;
    });

    function keyName(event) {
        return event.key.length === 1 ? event.key.toLowerCase() : event.key;
    }

    window.addEventListener("keydown", event => {
        const key = keyName(event);
        const fromControl = event.target instanceof HTMLButtonElement
            || event.target instanceof HTMLInputElement
            || event.target instanceof HTMLAnchorElement;
        if (key === "Escape" && pseudoFullscreen) {
            setPseudoFullscreen(false);
            event.preventDefault();
            return;
        }
        if ((key === "p" || key === "Escape") && isActivePlayState()) {
            if (!event.repeat) togglePause();
            event.preventDefault();
            return;
        }
        if (!acceptsFlightInput() || fromControl) return;
        if (["ArrowLeft", "a"].includes(key)) keys.left = true;
        else if (["ArrowRight", "d"].includes(key)) keys.right = true;
        else if (["ArrowUp", "w"].includes(key)) keys.up = true;
        else if (["ArrowDown", "s"].includes(key)) keys.down = true;
        else if (key === " " || key === "Spacebar") {
            if (!event.repeat) useFaithPulse();
        }
        else return;
        pointer.active = false;
        event.preventDefault();
    });

    window.addEventListener("keyup", event => {
        const key = keyName(event);
        if (["ArrowLeft", "a"].includes(key)) keys.left = false;
        if (["ArrowRight", "d"].includes(key)) keys.right = false;
        if (["ArrowUp", "w"].includes(key)) keys.up = false;
        if (["ArrowDown", "s"].includes(key)) keys.down = false;
    });

    function handleFullscreenChange() {
        updateFullscreenButton();
        scheduleViewportSync({ reveal: isActivePlayState(), forceLayout: true, delay: 120 });
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("visibilitychange", () => {
        if (document.hidden) pauseGame(true);
    });
    window.addEventListener("blur", () => pauseGame(true));

    const resizeObserver = new ResizeObserver(() => resizeCanvas());
    resizeObserver.observe(gameContainer);
    backgroundImage.addEventListener("load", () => drawScene(performance.now(), 0));
    window.addEventListener("resize", () => scheduleViewportSync({ delay: 150 }));
    window.visualViewport?.addEventListener("resize", () => scheduleViewportSync({ delay: 190 }));
    window.addEventListener("orientationchange", () => {
        pauseGame(true);
        scheduleViewportSync({ reveal: isActivePlayState(), forceLayout: true, delay: 360 });
    });

    function seedDebugProgress(count = 12) {
        game.connections = [];
        let remaining = count;
        seasonDefinitions.forEach(season => {
            season.targets.forEach((target, targetIndex) => {
                if (remaining <= 0) return;
                game.connections.push({ season: season.key, targetIndex, name: target.name });
                remaining -= 1;
            });
        });
        game.totalLinks = Math.min(count, 12);
        game.score = game.totalLinks * 150;
        game.seasonIndex = clamp(Math.floor(Math.max(0, game.totalLinks - 1) / 3), 0, 3);
        game.stats.stormsWeathered = Math.ceil(game.totalLinks * 0.7);
        updateHud();
    }

    if (debugAllowed) {
        window.BeliefJourneyDebug = Object.freeze({
            build: BUILD,
            getState: () => ({
                state: game.state,
                finalePhase: game.finalePhase,
                season: currentSeason().key,
                seasonLinks: game.seasonLinks,
                totalLinks: game.totalLinks,
                score: game.score,
                hope: game.hope,
                shields: game.shields,
                faith: game.faith,
                carriedGift: game.carriedGift,
                bee: { x: bee.x, y: bee.y, vx: bee.vx, vy: bee.vy },
                pointer: { active: pointer.active, x: pointer.x, y: pointer.y },
                target: (() => {
                    if (game.state === STATES.FINALE && game.finalePhase === "flight") {
                        return { name: "Heart of the Garden", ...finaleTargetPoint() };
                    }
                    const target = activeTarget();
                    return target ? { name: target.name, ...pointFromTarget(target) } : null;
                })(),
                entities: entities.map(entity => ({ type: entity.type, role: entity.role, x: entity.x, y: entity.y }))
            }),
            useFaithPulse,
            showCredits: () => {
                seedDebugProgress(12);
                showCredits();
            },
            beginFinale: () => {
                seedDebugProgress(12);
                startScreen.hidden = true;
                gameOverScreen.hidden = true;
                winScreen.hidden = true;
                document.body.classList.add("game-focused");
                beginFinale();
            }
        });
    }

    loadPreferences();
    reducedMotionQuery.addEventListener?.("change", event => {
        reducedMotion = event.matches;
        if (reducedMotion) screenFlash = Math.min(screenFlash, 0.06);
        seedCurrentDust();
    });
    resizeCanvas();
    seedCurrentDust();
    updateHud();
    updateFullscreenButton();
    drawScene(performance.now(), 0);
    animationId = requestAnimationFrame(gameLoop);

    if (debugMode === "credits") {
        window.setTimeout(() => window.BeliefJourneyDebug.showCredits(), 80);
    } else if (debugMode === "finale") {
        window.setTimeout(() => window.BeliefJourneyDebug.beginFinale(), 80);
    } else if (debugMode === "winter") {
        window.setTimeout(() => {
            startGame();
            seedDebugProgress(9);
            beginSeason(3);
        }, 80);
    }
})();
