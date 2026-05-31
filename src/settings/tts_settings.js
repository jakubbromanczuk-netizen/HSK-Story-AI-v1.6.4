// Ustawienia TTS lektor systemowy 
(function(){
    function init(generatorSettingsContainer, settingsModalOverlay) {
        try {
            const parent = generatorSettingsContainer || settingsModalOverlay;
            if (!parent) return;

            const audioBtn = document.createElement('button');
            audioBtn.type = 'button';
            audioBtn.id = 'audio-settings-btn';
            audioBtn.textContent = 'Ustawienia audio';
            audioBtn.style.marginLeft = '8px';
            audioBtn.style.background = '#556';
            audioBtn.style.color = '#fff';
            audioBtn.style.border = 'none';
            audioBtn.style.padding = '6px 8px';
            audioBtn.style.borderRadius = '6px';
            audioBtn.style.cursor = 'pointer';

            const panel = document.createElement('div');
            panel.id = 'audio-settings-panel';
            panel.style.display = 'none';
            panel.style.marginTop = '8px';
            panel.style.padding = '8px';
            panel.style.border = '1px solid #333';
            panel.style.background = '#0b0b0b';
            panel.style.borderRadius = '6px';

            const label = document.createElement('label');
            label.textContent = 'Prędkość lektora: ';
            label.style.color = '#ddd';
            label.style.marginRight = '8px';

            const valueDisplay = document.createElement('span');
            valueDisplay.id = 'tts-rate-value';
            valueDisplay.style.color = '#7747ef';
            valueDisplay.style.minWidth = '48px';
            valueDisplay.textContent = (window.ttsRate || 1.0).toFixed(2);

            const slider = document.createElement('input');
            slider.type = 'range';
            slider.id = 'tts-rate-slider';
            slider.min = '0.25';
            slider.max = '2.0';
            slider.step = '0.01';
            slider.value = (localStorage.getItem('tts_rate') || (window.ttsRate || 1.0)).toString();
            slider.style.width = '100%';
            slider.style.marginTop = '6px';
            try { slider.style.accentColor = '#7747ef'; } catch(e){}

            const pitchLabel = document.createElement('label');
            pitchLabel.textContent = 'Ton lektora: ';
            pitchLabel.style.color = '#ddd';
            pitchLabel.style.marginTop = '8px';
            pitchLabel.style.display = 'inline-block';

            const pitchValue = document.createElement('span');
            pitchValue.id = 'tts-pitch-value';
            pitchValue.style.color = '#7747ef';
            pitchValue.style.minWidth = '48px';
            pitchValue.textContent = (window.ttsPitch || 1.0).toFixed(2) + ' ';

            const pitchSlider = document.createElement('input');
            pitchSlider.type = 'range';
            pitchSlider.id = 'tts-pitch-slider';
            pitchSlider.min = '0.5';
            pitchSlider.max = '2.0';
            pitchSlider.step = '0.01';
            pitchSlider.value = (localStorage.getItem('tts_pitch') || (window.ttsPitch || 1.0)).toString();
            pitchSlider.style.width = '100%';
            pitchSlider.style.marginTop = '6px';
            try { pitchSlider.style.accentColor = '#7747ef'; } catch(e){}

            const voiceLabel = document.createElement('label');
            voiceLabel.textContent = 'Wybierz głos:';
            voiceLabel.style.color = '#ddd';
            voiceLabel.style.display = 'block';
            voiceLabel.style.marginTop = '8px';

            const voiceSelect = document.createElement('select');
            voiceSelect.id = 'tts-voice-select';
            voiceSelect.style.width = '100%';
            voiceSelect.style.marginTop = '6px';
            voiceSelect.style.background = '#071021';
            voiceSelect.style.color = '#ddd';
            voiceSelect.style.border = '1px solid #333';
            voiceSelect.style.padding = '6px';
            voiceSelect.style.borderRadius = '4px';

            const volLabel = document.createElement('label');
            volLabel.textContent = 'Głośność lektora: ';
            volLabel.style.color = '#ddd';
            volLabel.style.display = 'inline-block';
            volLabel.style.marginTop = '8px';

            const volValue = document.createElement('span');
            volValue.id = 'tts-vol-value';
            volValue.style.color = '#7747ef';
            volValue.style.minWidth = '48px';
            volValue.textContent = (window.ttsVolume || 100).toString();

            const volSlider = document.createElement('input');
            volSlider.type = 'range';
            volSlider.id = 'tts-vol-slider';
            volSlider.min = '0';
            volSlider.max = '100';
            volSlider.step = '1';
            volSlider.value = (localStorage.getItem('tts_volume') || (window.ttsVolume || 100)).toString();
            volSlider.style.width = '100%';
            volSlider.style.marginTop = '6px';
            try { volSlider.style.accentColor = '#7747ef'; } catch(e){}

            panel.appendChild(voiceLabel); panel.appendChild(voiceSelect);
            panel.appendChild(label); panel.appendChild(valueDisplay); panel.appendChild(document.createElement('br')); panel.appendChild(slider);
            panel.appendChild(pitchLabel); panel.appendChild(pitchValue); panel.appendChild(document.createElement('br')); panel.appendChild(pitchSlider);
            panel.appendChild(volLabel); panel.appendChild(volValue); panel.appendChild(document.createElement('br')); panel.appendChild(volSlider);

            parent.appendChild(audioBtn); parent.appendChild(panel);

            // load saved values
            try {
                const saved = parseFloat(localStorage.getItem('tts_rate'));
                if (!isNaN(saved) && saved >= 0.25 && saved <= 2.0) {
                    window.ttsRate = saved; slider.value = saved.toString(); valueDisplay.textContent = window.ttsRate.toFixed(2);
                }
                const savedPitch = parseFloat(localStorage.getItem('tts_pitch'));
                if (!isNaN(savedPitch) && savedPitch >= 0.5 && savedPitch <= 2.0) {
                    window.ttsPitch = savedPitch; pitchSlider.value = savedPitch.toString(); pitchValue.textContent = window.ttsPitch.toFixed(2);
                }
                const savedVol = parseInt(localStorage.getItem('tts_volume'));
                if (!isNaN(savedVol) && savedVol >= 0 && savedVol <= 100) { window.ttsVolume = savedVol; volSlider.value = savedVol.toString(); volValue.textContent = window.ttsVolume.toString(); }
            } catch(e) { console.warn('Failed to load tts_rate/tts_pitch', e); }

            audioBtn.addEventListener('click', () => { panel.style.display = panel.style.display === 'none' ? 'block' : 'none'; });

            slider.addEventListener('input', () => {
                const v = parseFloat(slider.value); if (isNaN(v)) return;
                window.ttsRate = Math.max(0.25, Math.min(2.0, v)); valueDisplay.textContent = window.ttsRate.toFixed(2);
                try { localStorage.setItem('tts_rate', window.ttsRate.toString()); } catch(e){}
                try { if (window.lastAudioElem) window.lastAudioElem.playbackRate = window.ttsRate; } catch(e){}
                try { if (window.userRecordedAudioElem) window.userRecordedAudioElem.playbackRate = window.ttsRate; } catch(e){}
                if (typeof window.showTtsStatus === 'function') window.showTtsStatus('Prędkość lektora: ' + window.ttsRate.toFixed(2), 1200);
            });

            pitchSlider.addEventListener('input', () => {
                const v = parseFloat(pitchSlider.value); if (isNaN(v)) return;
                window.ttsPitch = Math.max(0.5, Math.min(2.0, v)); pitchValue.textContent = window.ttsPitch.toFixed(2) + ' ';
                try { localStorage.setItem('tts_pitch', window.ttsPitch.toString()); } catch(e){}
                if (typeof window.showTtsStatus === 'function') window.showTtsStatus('Ton lektora: ' + window.ttsPitch.toFixed(2), 1000);
            });

            volSlider.addEventListener('input', () => {
                const v = parseInt(volSlider.value, 10); if (isNaN(v)) return;
                window.ttsVolume = Math.max(0, Math.min(100, v)); volValue.textContent = window.ttsVolume.toString();
                try { localStorage.setItem('tts_volume', window.ttsVolume.toString()); } catch(e){}
                try { if (window.lastAudioElem) window.lastAudioElem.volume = window.ttsVolume/100; } catch(e){}
                try { if (window.userRecordedAudioElem) window.userRecordedAudioElem.volume = window.ttsVolume/100; } catch(e){}
                try {
                    if (window.speechSynthesis && window.speechSynthesis.speaking) {
                        const remaining = window.currentSynthText && window.currentSynthCharIndex ? window.currentSynthText.substring(window.currentSynthCharIndex) : window.currentSynthText;
                        window.speechSynthesis.cancel();
                        if (remaining && remaining.length > 0) setTimeout(() => { if (typeof window.speakChinese === 'function') window.speakChinese(remaining); }, 60);
                    }
                } catch (e) {}
                if (typeof window.showTtsStatus === 'function') window.showTtsStatus('Głośność lektora: ' + window.ttsVolume + '%', 1000);
            });

            function populateVoiceList() {
                try {
                    const voices = window.speechSynthesis.getVoices() || [];
                    voiceSelect.innerHTML = '';
                    const empty = document.createElement('option'); empty.value = ''; empty.textContent = '-- domyślny --'; voiceSelect.appendChild(empty);
                    const chinese = voices.filter(v => /zh|chinese|mandarin/i.test((v.lang || '') + ' ' + (v.name || '')));
                    for (const v of chinese) {
                        const opt = document.createElement('option'); opt.value = v.name || v.voiceURI || (v.lang + ' ' + v.name); opt.textContent = `${v.name} (${v.lang})`; voiceSelect.appendChild(opt);
                    }
                    const savedVoice = localStorage.getItem('tts_voice') || '';
                    if (savedVoice) voiceSelect.value = savedVoice;
                } catch (e) { console.warn('populateVoiceList error', e); }
            }

            populateVoiceList(); if (typeof window.speechSynthesis !== 'undefined') window.speechSynthesis.onvoiceschanged = populateVoiceList;
            voiceSelect.addEventListener('change', () => { try { localStorage.setItem('tts_voice', voiceSelect.value); } catch(e){}; if (typeof window.showTtsStatus === 'function') window.showTtsStatus('Wybrano głos: ' + (voiceSelect.options[voiceSelect.selectedIndex] && voiceSelect.options[voiceSelect.selectedIndex].text), 1200); });

        } catch (e) { console.warn('setupAudioSettingsUI error', e); }
    }

    window.SETTINGS_TTS = window.SETTINGS_TTS || {};
    window.SETTINGS_TTS.init = init;
    window.SETTINGS_TTS.initPlaybackControls = function(){
        try {
            // Reuse existing init logic from script.js: createPlaybackControlsRow
            const lengthInput = window.DOM && window.DOM.lengthInput;
            const generateButton = window.DOM && window.DOM.generateButton;
            const translationOutput = window.DOM && window.DOM.translationOutput;
            const translationErrorMessage = window.DOM && window.DOM.translationErrorMessage;

            const controlsRow = document.createElement('div');
            controlsRow.id = 'tts-controls-row';
            controlsRow.style.display = 'flex';
            controlsRow.style.gap = '12px';
            controlsRow.style.marginTop = '10px';
            controlsRow.style.alignItems = 'center';
            controlsRow.style.justifyContent = 'flex-start';
            controlsRow.style.width = '100%';

            const playBtn = document.createElement('button');
            playBtn.id = 'tts-play-btn';
            playBtn.type = 'button';
            playBtn.title = 'Play last TTS';
            playBtn.innerHTML = '<i class="fas fa-play"></i>';
            playBtn.style.background = '#7747ef'; playBtn.style.color = '#fff'; playBtn.style.border = 'none'; playBtn.style.padding = '6px 10px'; playBtn.style.borderRadius = '6px'; playBtn.style.cursor = 'pointer'; playBtn.style.boxShadow = '0 2px 6px rgba(0,0,0,0.4)';

            const stopBtn = document.createElement('button');
            stopBtn.id = 'tts-stop-btn'; stopBtn.type = 'button'; stopBtn.title = 'Stop'; stopBtn.innerHTML = '<i class="fas fa-stop"></i>';
            stopBtn.style.background = '#7747ef'; stopBtn.style.color = '#fff'; stopBtn.style.border = 'none'; stopBtn.style.padding = '6px 10px'; stopBtn.style.borderRadius = '6px'; stopBtn.style.cursor = 'pointer'; stopBtn.style.boxShadow = '0 2px 6px rgba(0,0,0,0.4)';

            const rewindBtn = document.createElement('button');
            rewindBtn.id = 'tts-rewind-btn'; rewindBtn.type = 'button'; rewindBtn.title = 'Rewind to start'; rewindBtn.innerHTML = '<i class="fas fa-undo"></i>';
            rewindBtn.style.background = '#7747ef'; rewindBtn.style.color = '#fff'; rewindBtn.style.border = 'none'; rewindBtn.style.padding = '6px 10px'; rewindBtn.style.borderRadius = '6px'; rewindBtn.style.cursor = 'pointer'; rewindBtn.style.boxShadow = '0 2px 6px rgba(0,0,0,0.4)';

            const loopBtn = document.createElement('button');
            loopBtn.id = 'tts-loop-btn'; loopBtn.type = 'button'; loopBtn.title = 'Loop'; loopBtn.innerHTML = '<i class="fas fa-sync-alt"></i>';
            loopBtn.style.background = '#7747ef'; loopBtn.style.color = '#fff'; loopBtn.style.border = 'none'; loopBtn.style.padding = '6px 10px'; loopBtn.style.borderRadius = '6px'; loopBtn.style.cursor = 'pointer'; loopBtn.style.boxShadow = '0 2px 6px rgba(0,0,0,0.4)';

            const leftGroup = document.createElement('div'); leftGroup.style.display = 'flex'; leftGroup.style.gap = '8px'; leftGroup.style.alignItems = 'center';
            const centerWrapper = document.createElement('div'); centerWrapper.style.display = 'flex'; centerWrapper.style.alignItems = 'center'; centerWrapper.style.justifyContent = 'center'; centerWrapper.style.flex = '0 0 auto';
            const rightGroup = document.createElement('div'); rightGroup.style.display = 'flex'; rightGroup.style.gap = '8px'; rightGroup.style.alignItems = 'center';

            leftGroup.appendChild(playBtn); leftGroup.appendChild(stopBtn); leftGroup.appendChild(rewindBtn); leftGroup.appendChild(loopBtn);
            const recordMainBtn = document.createElement('button'); recordMainBtn.id = 'tts-record-btn'; recordMainBtn.type = 'button'; recordMainBtn.title = 'Nagraj głos (mikrofon)'; recordMainBtn.textContent = ''; recordMainBtn.style.background = '#444'; recordMainBtn.style.color = '#fff'; recordMainBtn.style.border = 'none'; recordMainBtn.style.padding = '6px 10px'; recordMainBtn.style.borderRadius = '6px'; recordMainBtn.style.cursor = 'pointer'; recordMainBtn.style.boxShadow = '0 2px 6px rgba(0,0,0,0.4)';
            const recDot = document.createElement('span'); recDot.id = 'record-dot'; recDot.style.display = 'inline-block'; recDot.style.width = '10px'; recDot.style.height = '10px'; recDot.style.marginLeft = '6px'; recDot.style.borderRadius = '50%'; recDot.style.background = 'transparent'; recordMainBtn.appendChild(recDot);

            const vis = document.createElement('canvas'); vis.id = 'tts-visualiser'; vis.width = 260; vis.height = 48; vis.style.width = '260px'; vis.style.height = '48px'; vis.style.margin = '0 12px'; vis.style.border = '1px solid #7747ef'; vis.style.borderRadius = '4px'; vis.style.background = '#071021'; centerWrapper.appendChild(vis);

            rightGroup.appendChild(recordMainBtn);
            controlsRow.appendChild(leftGroup); controlsRow.appendChild(centerWrapper); controlsRow.appendChild(rightGroup);

            if (lengthInput && lengthInput.parentNode) {
                const insertAfter = lengthInput.parentNode;
                if (insertAfter.parentNode) insertAfter.parentNode.insertBefore(controlsRow, insertAfter.nextSibling);
                else document.body.appendChild(controlsRow);
            } else if (generateButton && generateButton.parentNode) {
                generateButton.parentNode.insertBefore(controlsRow, generateButton.nextSibling);
            } else {
                document.body.appendChild(controlsRow);
            }

            // Handlers
            playBtn.addEventListener('click', () => { try { if (window.TTS && typeof window.TTS.playLastTts === 'function') return window.TTS.playLastTts(); if (window.playLastTts) return window.playLastTts(); } catch(e){} });
            stopBtn.addEventListener('click', () => { try { if (window.TTS && typeof window.TTS.stopLastTts === 'function') return window.TTS.stopLastTts(); if (window.stopLastTts) return window.stopLastTts(); } catch(e){} });
            rewindBtn.addEventListener('click', () => { try { if (window.TTS && typeof window.TTS.rewindLastTts === 'function') return window.TTS.rewindLastTts(); if (window.rewindLastTts) return window.rewindLastTts(); } catch(e){} });
            loopBtn.addEventListener('click', () => {
                window.ttsLoop = !window.ttsLoop;
                loopBtn.style.opacity = window.ttsLoop ? '1.0' : '0.6';
                try { if (typeof window.showTtsStatus === 'function') window.showTtsStatus(window.ttsLoop ? 'Pętla włączona' : 'Pętla wyłączona'); } catch(e){}
                try { if (window.lastAudioElem) window.lastAudioElem.loop = window.ttsLoop; } catch(e){}
            });

            // Recording main button
            (function setupMainRecorder() {
                let micStream = null;
                let mediaRecorder = null;
                let recordedChunks = [];
                recordMainBtn.addEventListener('click', async () => {
                    try {
                        if (!mediaRecorder || mediaRecorder.state === 'inactive') {
                            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                            micStream = stream;
                            recordedChunks = [];
                            mediaRecorder = new MediaRecorder(stream);
                            mediaRecorder.ondataavailable = (ev) => { if (ev.data && ev.data.size > 0) recordedChunks.push(ev.data); };
                            mediaRecorder.onstop = () => {
                                try {
                                    const blob = new Blob(recordedChunks, { type: 'audio/webm' });
                                    if (window.userRecordedAudioElem) { try { window.userRecordedAudioElem.pause(); } catch(e){} try { URL.revokeObjectURL(window.userRecordedUrl); } catch(e){} window.userRecordedAudioElem = null; window.userRecordedUrl = null; }
                                    window.userRecordedUrl = URL.createObjectURL(blob);
                                    window.userRecordedAudioElem = new Audio(window.userRecordedUrl);
                                    try { window.userRecordedAudioElem.playbackRate = window.ttsRate; window.userRecordedAudioElem.volume = window.ttsVolume / 100; } catch(e){}
                                    window.lastAudioElem = window.userRecordedAudioElem;
                                    window.lastTts = { type: 'audio', text: 'user_recording', audioUrl: window.userRecordedUrl };
                                    try { if (window.TTS && typeof window.TTS.attachAnalyserToAudio === 'function') window.TTS.attachAnalyserToAudio(window.userRecordedAudioElem); } catch(e){}
                                    try { if (typeof window.showTtsStatus === 'function') window.showTtsStatus('Nagranie gotowe'); } catch(e){}
                                } catch (e) { console.warn('Failed to finalize recording', e); }
                                try { if (micStream) { micStream.getTracks().forEach(t => t.stop()); micStream = null; } } catch(e){}
                                recordMainBtn.title = 'Nagraj głos'; recordMainBtn.style.background = '#444'; recDot.style.background = 'transparent';
                            };
                            mediaRecorder.start();
                            recordMainBtn.title = 'Zatrzymaj nagrywanie'; recordMainBtn.style.background = '#d33'; recDot.style.background = '#f33';
                            try { if (typeof window.showTtsStatus === 'function') window.showTtsStatus('Nagrywanie...'); } catch(e){}
                        } else {
                            try { mediaRecorder.stop(); } catch(e){}
                        }
                    } catch (e) { console.warn('Recording failed', e); try { if (typeof window.showTtsStatus === 'function') window.showTtsStatus('Błąd nagrywania'); } catch(e){} }
                });
            })();

        } catch (e) { console.warn('initPlaybackControls error', e); }
    };
})();
