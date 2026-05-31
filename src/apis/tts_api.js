/* Moduł TTS odtwarzanie, wizualizator i pomocnicze funkcje (krótkie)
*/
(function(){
    // Shared state (use window.* so other scripts can still access if needed)
    window.lastLocalAudioUrl = window.lastLocalAudioUrl || null;
    window.lastTts = window.lastTts || null;
    window.lastAudioElem = window.lastAudioElem || null;
    window.ttsLoop = window.ttsLoop || false;

    // Visualiser state
    let audioCtx = null;
    let analyser = null;
    let dataArray = null;
    let sourceNode = null;
    let animationId = null;
    let fakeAnimationId = null;
    let fakeBars = [];
    let fakeBarCount = 0;

    function showTtsStatus(message, timeout = 3000) {
        let el = document.getElementById('tts-status-toast');
        if (!el) {
            el = document.createElement('div');
            el.id = 'tts-status-toast';
            el.style.position = 'fixed';
            el.style.right = '12px';
            el.style.bottom = '12px';
            el.style.background = 'rgba(0,0,0,0.75)';
            el.style.color = '#fff';
            el.style.padding = '8px 12px';
            el.style.borderRadius = '6px';
            el.style.zIndex = 9999;
            el.style.fontSize = '13px';
            document.body.appendChild(el);
        }
        el.textContent = message;
        el.style.display = 'block';
        clearTimeout(el._hideTimeout);
        el._hideTimeout = setTimeout(() => { el.style.display = 'none'; }, timeout);
    }

    function tryUnlockAudio() {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            if (ctx.state === 'suspended') ctx.resume().then(() => console.debug('AudioContext resumed'));
        } catch (e) { /* ignore */ }
    }

    function ensureAnalyser() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            analyser = audioCtx.createAnalyser();
            analyser.fftSize = 2048;
            const bufferLength = analyser.frequencyBinCount;
            dataArray = new Uint8Array(bufferLength);
        }
    }

    function attachAnalyserToAudio(audioEl) {
        try {
            ensureAnalyser();
            if (sourceNode) { try { sourceNode.disconnect(); } catch(e){} sourceNode = null; }
            sourceNode = audioCtx.createMediaElementSource(audioEl);
            sourceNode.connect(analyser);
            analyser.connect(audioCtx.destination);
            startVisualiser();
        } catch (e) { console.warn('attachAnalyser error', e); }
    }

    function startVisualiser() {
        const canvas = document.getElementById('tts-visualiser');
        if (!canvas) return;
        ensureAnalyser();
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        analyser.smoothingTimeConstant = 0.8;

        let visualMax = 0.0001;
        const decay = 0.96;

        function drawWaveform() {
            animationId = requestAnimationFrame(drawWaveform);
            const timeData = new Float32Array(analyser.fftSize);
            analyser.getFloatTimeDomainData(timeData);

            let peak = 0;
            let minS = 1, maxS = -1;
            for (let i = 0; i < timeData.length; i++) {
                const s = timeData[i];
                if (s > maxS) maxS = s;
                if (s < minS) minS = s;
                const abs = Math.abs(s);
                if (abs > peak) peak = abs;
            }

            visualMax = Math.max(peak, visualMax * decay);
            const scale = visualMax > 0 ? (height / 2) / visualMax : 1;

            try { const imageData = ctx.getImageData(1, 0, width - 1, height); ctx.putImageData(imageData, 0, 0); } catch(e){}

            const columnX = width - 1;
            const center = Math.floor(height / 2);
            const yTop = Math.max(0, Math.floor(center - maxS * scale));
            const yBottom = Math.min(height - 1, Math.floor(center - minS * scale));

            const grad = ctx.createLinearGradient(0, yTop, 0, yBottom);
            grad.addColorStop(0, '#bba5f3');
            grad.addColorStop(0.6, '#7747ef');
            grad.addColorStop(1, '#38226e');

            ctx.fillStyle = grad;
            ctx.fillRect(columnX, yTop, 1, Math.max(1, yBottom - yTop));
        }

        if (animationId) cancelAnimationFrame(animationId);
        drawWaveform();
    }

    function stopVisualiser() {
        if (animationId) { cancelAnimationFrame(animationId); animationId = null; }
        const canvas = document.getElementById('tts-visualiser');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0,0,canvas.width,canvas.height);
            ctx.fillStyle = '#0b0b0b';
            ctx.fillRect(0,0,canvas.width,canvas.height);
        }
        try { if (sourceNode) { sourceNode.disconnect(); sourceNode = null; } } catch(e){}
    }

    function startFakeVisualiser() {
        const canvas = document.getElementById('tts-visualiser');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        fakeBarCount = Math.max(8, Math.floor(width / 6));
        if (fakeBars.length !== fakeBarCount) fakeBars = new Array(fakeBarCount).fill(0);

        let lastT = performance.now();

        function drawScroll() {
            fakeAnimationId = requestAnimationFrame(drawScroll);
            const now = performance.now();
            const dt = Math.max(1, now - lastT);
            lastT = now;
            for (let i = 0; i < fakeBars.length; i++) fakeBars[i] = Math.max(0, fakeBars[i] - 0.0012 * dt);
            try { const imageData = ctx.getImageData(1, 0, width - 1, height); ctx.putImageData(imageData, 0, 0); } catch(e){}
            const columnX = width - 1;
            const energy = fakeBars.length ? Math.max(...fakeBars) : 0;
            const v = Math.min(1, energy);
            const h = Math.max(1, Math.floor(v * height));
            const grad = ctx.createLinearGradient(0, (height - h) / 2, 0, (height + h) / 2);
            grad.addColorStop(0, '#bba5f3');
            grad.addColorStop(0.6, '#7747ef');
            grad.addColorStop(1, '#38226e');
            ctx.fillStyle = grad;
            ctx.fillRect(columnX, Math.round((height - h) / 2), 1, h);
        }

        if (fakeAnimationId) cancelAnimationFrame(fakeAnimationId);
        drawScroll();
    }

    function pulseFakeVisualiser(strength = 1.0) {
        if (!fakeBars || fakeBars.length === 0) return;
        const center = Math.floor(fakeBars.length / 2);
        for (let i = 0; i < fakeBars.length; i++) {
            const dist = Math.abs(i - center);
            const spread = Math.max(1, fakeBars.length / 3);
            const k = Math.max(0, 1 - dist / spread);
            const noise = Math.random() * 0.15;
            fakeBars[i] = Math.max(fakeBars[i], Math.min(1, strength * (0.25 + 0.75 * k) + noise));
        }
    }

    function stopFakeVisualiser() {
        if (fakeAnimationId) { cancelAnimationFrame(fakeAnimationId); fakeAnimationId = null; }
        const canvas = document.getElementById('tts-visualiser');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#0b0b0b';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        fakeBars = [];
    }

    function resetVisualiser() { stopVisualiser(); stopFakeVisualiser(); }

    function ensureVisualiserRunningForAudio(audioEl) {
        if (audioEl) {
            try { attachAnalyserToAudio(audioEl); } catch (e) { console.warn('ensureVisualiserRunningForAudio error', e); }
        } else {
            startFakeVisualiser();
        }
    }

    // Playback control functions
    async function playLastTts() {
        if (!window.lastTts) { showTtsStatus('Brak zapamiętanego audio'); return; }

        if (window.lastTts.type === 'audio') {
            try {
                if (!window.lastAudioElem) window.lastAudioElem = new Audio(window.lastTts.audioUrl);
                try { window.lastAudioElem.playbackRate = window.ttsRate; window.lastAudioElem.volume = Math.max(0, Math.min(1, (window.ttsVolume||100)/100)); } catch(e){}
                window.lastAudioElem.loop = window.ttsLoop;
                window.lastAudioElem.currentTime = 0;
                window.lastAudioElem.play().then(() => { console.debug('Playing last audio'); attachAnalyserToAudio(window.lastAudioElem); }).catch(e => console.warn('Play failed', e));
            } catch (e) { console.error('playLastTts audio error', e); }
        } else if (window.lastTts.type === 'synth') {
            try {
                if (speechSynthesis.speaking) {
                    if (speechSynthesis.paused) { speechSynthesis.resume(); return; }
                    speechSynthesis.cancel();
                }
                const utter = new SpeechSynthesisUtterance(window.lastTts.text);
                utter.lang = 'zh-CN';
                utter.rate = window.ttsRate;
                utter.volume = Math.max(0, Math.min(1, (window.ttsVolume||100) / 100));
                utter.pitch = window.ttsPitch;
                try { if (window.lastTts.voiceName) { const v = window.speechSynthesis.getVoices().find(x => x.name === window.lastTts.voiceName || x.voiceURI === window.lastTts.voiceName); if (v) utter.voice = v; } } catch (e) {}
                utter.onstart = () => { startFakeVisualiser(); };
                utter.onboundary = (ev) => { try { pulseFakeVisualiser(1.0); } catch(e){} };
                utter.onend = () => { stopFakeVisualiser(); if (window.ttsLoop) { playLastTts(); } };
                speechSynthesis.speak(utter);
            } catch (e) { console.error('playLastTts synth error', e); }
        }
    }

    function stopLastTts() {
        if (!window.lastTts) return;
        if (window.lastTts.type === 'audio') {
            try { if (window.lastAudioElem) { window.lastAudioElem.pause(); window.lastAudioElem.currentTime = 0; } } catch(e){}
        } else if (window.lastTts.type === 'synth') {
            try { speechSynthesis.cancel(); } catch(e){}
        }
        showTtsStatus('Zatrzymano');
        stopVisualiser();
        stopFakeVisualiser();
    }

    function rewindLastTts() {
        if (!window.lastTts) { showTtsStatus('Brak zapamiętanego audio'); return; }
        if (window.lastTts.type === 'audio') {
            try { if (window.lastAudioElem) { window.lastAudioElem.currentTime = 0; showTtsStatus('Przewinięto do początku'); } } catch(e){}
        } else if (window.lastTts.type === 'synth') {
            try { speechSynthesis.cancel(); showTtsStatus('Gotowe do odtworzenia od początku'); } catch(e){}
        }
        resetVisualiser();
    }

    // Public API
    window.TTS = {
        speak: async function(text){
            tryUnlockAudio();
            const toSpeak = (text && text.trim().length>0) ? text : (window.currentGeneratedChineseText || '');
            if (!toSpeak) return;

            if ('speechSynthesis' in window) {
                try {
                    const synth = window.speechSynthesis;
                    const utter = new SpeechSynthesisUtterance(toSpeak);
                    utter.lang = 'zh-CN';
                    utter.rate = (typeof window.ttsRate !== 'undefined') ? window.ttsRate : 1.0;
                    utter.pitch = (typeof window.ttsPitch !== 'undefined') ? window.ttsPitch : 1.0;
                    utter.volume = Math.max(0, Math.min(1, (typeof window.ttsVolume !== 'undefined') ? window.ttsVolume/100 : 1));
                    synth.cancel();
                    synth.speak(utter);
                    window.lastTts = { type: 'synth', text: toSpeak };
                    return;
                } catch (e) { console.warn('TTS Web Speech fallback failed:', e); }
            }

            if (window.BACKEND_API && typeof window.BACKEND_API.localTtsFetch === 'function' && window.LOCAL_TTS_URL) {
                try {
                    const res = await window.BACKEND_API.localTtsFetch(window.LOCAL_TTS_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: toSpeak }) });
                    if (!res || !res.ok) throw new Error('Local TTS responded ' + (res ? res.status : 'no response'));
                    const blob = await res.blob();
                    const url = URL.createObjectURL(blob);
                    if (window.lastLocalAudioUrl) try{ URL.revokeObjectURL(window.lastLocalAudioUrl); }catch(e){}
                    window.lastLocalAudioUrl = url;
                    if (window.lastAudioElem) try{ window.lastAudioElem.pause(); }catch(e){}
                    const a = new Audio(url);
                    try { a.playbackRate = window.ttsRate || 1.0; a.volume = Math.max(0, Math.min(1, (window.ttsVolume||100)/100)); }catch(e){}
                    window.lastAudioElem = a;
                    window.lastTts = { type: 'audio', text: toSpeak, audioUrl: url };
                    await a.play();
                    a.addEventListener('ended', () => { try { if (!window.ttsLoop) { URL.revokeObjectURL(url); if (window.lastLocalAudioUrl === url) window.lastLocalAudioUrl = null; } } catch(e){} });
                    return;
                } catch (e) { console.warn('Local TTS failed:', e); }
            }
            console.warn('No TTS available.');
        },
        stop: function(){ try { if ('speechSynthesis' in window) window.speechSynthesis.cancel(); } catch(e){} try { if (window.lastAudioElem) { window.lastAudioElem.pause(); window.lastAudioElem = null; } } catch(e){} },
        showTtsStatus,
        tryUnlockAudio,
        ensureAnalyser,
        attachAnalyserToAudio,
        startVisualiser,
        stopVisualiser,
        startFakeVisualiser,
        pulseFakeVisualiser,
        stopFakeVisualiser,
        resetVisualiser,
        ensureVisualiserRunningForAudio,
        playLastTts,
        stopLastTts,
        rewindLastTts
    };

    // Export legacy global names for compatibility
    window.showTtsStatus = showTtsStatus;
    window.tryUnlockAudio = tryUnlockAudio;
    window.ensureAnalyser = ensureAnalyser;
    window.attachAnalyserToAudio = attachAnalyserToAudio;
    window.startVisualiser = startVisualiser;
    window.stopVisualiser = stopVisualiser;
    window.startFakeVisualiser = startFakeVisualiser;
    window.pulseFakeVisualiser = pulseFakeVisualiser;
    window.stopFakeVisualiser = stopFakeVisualiser;
    window.resetVisualiser = resetVisualiser;
    window.ensureVisualiserRunningForAudio = ensureVisualiserRunningForAudio;
    window.playLastTts = playLastTts;
    window.stopLastTts = stopLastTts;
    window.rewindLastTts = rewindLastTts;
})();
