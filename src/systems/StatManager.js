/**
 * StatManager — Manages all player stats for Climb the Ladder.
 * Stats: GPA, Network, Authenticity, Burnout, Wealth, Prestige
 */
export default class StatManager {
    constructor() {
        this.stats = {
            gpa: 50,
            network: 10,
            authenticity: 80,
            burnout: 0,
            wealth: 0,
            prestige: 5,
        };

        // Inverse correlation config: gaining prestige costs authenticity
        this.inversePairs = [
            { stat: 'prestige', inverse: 'authenticity', ratio: 0.5 },
        ];

        this.audioCues = null; // injected after construction
    }

    setAudioCues(audioCues) {
        this.audioCues = audioCues;
    }

    getStat(key) {
        return this.stats[key] ?? 0;
    }

    getAll() {
        return { ...this.stats };
    }

    /**
     * Modify a stat by delta. Applies inverse correlation if applicable.
     * @param {string} key - stat name
     * @param {number} delta - change amount (positive or negative)
     * @param {boolean} applyInverse - whether to trigger inverse correlations
     */
    modifyStat(key, delta, applyInverse = true) {
        if (!(key in this.stats)) return;

        const oldVal = this.stats[key];
        this.stats[key] = Math.max(0, Math.min(100, this.stats[key] + delta));

        // 🎺 Tiny airhorn when burnout maxes out. Just once. It's stupid. It's perfect.
        if (key === 'burnout' && this.stats.burnout >= 100 && oldVal < 100 && this.audioCues) {
            this.audioCues.playBurnoutAirhorn();
        }

        // Apply inverse correlations
        if (applyInverse && delta > 0) {
            for (const pair of this.inversePairs) {
                if (pair.stat === key) {
                    this.stats[pair.inverse] = Math.max(
                        0,
                        this.stats[pair.inverse] - delta * pair.ratio
                    );
                }
            }
        }
    }

    /**
     * Get a formatted display string for a stat
     */
    getDisplay(key) {
        const val = this.getStat(key);
        if (key === 'wealth') return `$${val.toLocaleString()}`;
        return `${val}/100`;
    }

    /**
     * Calculate college tier based on stats.
     * Tier 1: Harvard/Stanford (high GPA + extracurriculars)
     * Tier 2: Solid state school (balanced)
     * Tier 3: Safety school (prioritized relationships)
     */
    getCollegeTier() {
        const gpa = this.stats.gpa;
        const network = this.stats.network;
        const score = gpa * 0.6 + network * 0.4;

        if (score >= 70) return 1;
        if (score >= 45) return 2;
        return 3;
    }

    /**
     * Get burnout degradation effects for mini-games and dialogue.
     * Returns severity levels for control sluggishness, color desaturation, and dialogue corruption.
     */
    getBurnoutEffects() {
        const b = this.stats.burnout;
        return {
            controlDelay: b > 70 ? 200 : b > 50 ? 100 : 0,       // ms delay on inputs
            desaturation: b > 70 ? 0.6 : b > 50 ? 0.3 : 0,       // 0-1 greyscale mix
            corruptDialogue: b > 70,                                // replace options with corporate speak
            performancePenalty: b > 50 ? -(b - 50) * 0.5 : 0,     // mini-game score penalty
            corporateSpeak: [
                'Let\'s circle back on that.',
                'Per my last email...',
                'I\'ll take that offline.',
                'Let\'s put a pin in it.',
                'I think we\'re aligned.',
                'Can we synergize on this?',
                'I\'ll loop in the stakeholders.',
                'Let\'s table this for now.',
            ],
        };
    }

    /**
     * Calculate performance rating for quarterly reviews.
     * Based on GPA (output), Network, and Burnout penalty.
     */
    getPerformanceRating() {
        const output = this.stats.gpa;
        const network = this.stats.network;
        const burnoutPenalty = Math.max(0, this.stats.burnout - 40) * 0.3;
        const score = output * 0.5 + network * 0.3 - burnoutPenalty;

        if (score >= 60) return { rating: 'Exceeds Expectations', tier: 1, raise: 15000 };
        if (score >= 40) return { rating: 'Meets Expectations', tier: 2, raise: 5000 };
        if (score >= 20) return { rating: 'Needs Improvement', tier: 3, raise: 0 };
        return { rating: 'PIP Incoming', tier: 4, raise: -5000 };
    }
}
