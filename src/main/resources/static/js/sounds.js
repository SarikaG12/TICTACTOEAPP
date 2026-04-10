// Simple Sound System using Web Audio API Synthesizer to avoid large Base64 files
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playTone(frequency, type, duration, vol=0.1) {
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);
    
    gainNode.gain.setValueAtTime(vol, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + duration);
}

const Sounds = {
    move: () => playTone(600, 'sine', 0.1, 0.2),
    win: () => {
        playTone(400, 'square', 0.1, 0.2);
        setTimeout(() => playTone(600, 'square', 0.1, 0.2), 100);
        setTimeout(() => playTone(800, 'square', 0.3, 0.2), 200);
    },
    lose: () => {
        playTone(300, 'sawtooth', 0.1, 0.2);
        setTimeout(() => playTone(250, 'sawtooth', 0.1, 0.2), 150);
        setTimeout(() => playTone(200, 'sawtooth', 0.4, 0.2), 300);
    },
    draw: () => {
        playTone(400, 'triangle', 0.2, 0.2);
        setTimeout(() => playTone(400, 'triangle', 0.2, 0.2), 250);
    },
    hint: () => playTone(800, 'sine', 0.1, 0.1),
    levelUnlock: () => {
        playTone(500, 'square', 0.1, 0.2);
        setTimeout(() => playTone(700, 'square', 0.1, 0.2), 100);
        setTimeout(() => playTone(900, 'square', 0.1, 0.2), 200);
        setTimeout(() => playTone(1200, 'square', 0.4, 0.2), 300);
    }
};
