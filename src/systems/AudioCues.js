/**
 * AudioCues — Programmatic audio for emotional moments.
 * Uses Web Audio API to generate tones without any external assets.
 *
 * Two cues:
 * 1. Piano sting — soft, sad note when you miss a relationship event
 * 2. Burnout airhorn — one tiny, stupid airhorn when burnout maxes out
 */
export default class AudioCues {
    constructor() {
        this.ctx = null;
        this.airHornPlayed = false; // only once, ever
    }

    reset() {
        this.airHornPlayed = false;
    }

    /** Lazy-init AudioContext (requires user gesture on most browsers) */
    getContext() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        return this.ctx;
    }

    /**
     * Soft piano sting — a single minor note that fades.
     * The same note, every time. Players will learn to dread it.
     */
    playRelationshipDecayPing() {
        try {
            const ctx = this.getContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.value = 523.25; // C5 — middle-high, soft, melancholic
            osc.connect(gain);
            gain.connect(ctx.destination);

            // Soft attack, slow fade — like a music box winding down
            gain.gain.setValueAtTime(0, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.0);

            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 2.0);
        } catch (e) {
            // Audio not available — fail silently
        }
    }

    /**
     * Tiny airhorn. Just once. It's stupid. It's perfect.
     * Only plays the FIRST time burnout hits 100.
     */
    playBurnoutAirhorn() {
        if (this.airHornPlayed) return;
        this.airHornPlayed = true;

        try {
            const ctx = this.getContext();

            // Layer 1: harsh buzz
            const osc1 = ctx.createOscillator();
            const gain1 = ctx.createGain();
            osc1.type = 'sawtooth';
            osc1.frequency.value = 440;
            osc1.connect(gain1);
            gain1.connect(ctx.destination);
            gain1.gain.setValueAtTime(0, ctx.currentTime);
            gain1.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.01);
            gain1.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 0.15);
            gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
            osc1.start(ctx.currentTime);
            osc1.stop(ctx.currentTime + 0.5);

            // Layer 2: higher overtone
            const osc2 = ctx.createOscillator();
            const gain2 = ctx.createGain();
            osc2.type = 'square';
            osc2.frequency.value = 587.33; // D5
            osc2.connect(gain2);
            gain2.connect(ctx.destination);
            gain2.gain.setValueAtTime(0, ctx.currentTime);
            gain2.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 0.01);
            gain2.gain.linearRampToValueAtTime(0.025, ctx.currentTime + 0.15);
            gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
            osc2.start(ctx.currentTime);
            osc2.stop(ctx.currentTime + 0.4);
        } catch (e) {
            // Audio not available — fail silently
        }
    }
}
