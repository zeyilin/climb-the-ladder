/**
 * RelationshipManager — Manages character connections with decay.
 * The fading portraits mechanic: connection → opacity mapping.
 */
export default class RelationshipManager {
    constructor() {
        this.relationships = {};
        this.audioCues = null;
    }

    setAudioCues(audioCues) {
        this.audioCues = audioCues;
    }

    /**
     * Initialize relationships from character data
     * @param {Array} characters - array of { id, name, connection, ... }
     */
    init(characters) {
        for (const char of characters) {
            this.relationships[char.id] = {
                name: char.name,
                connection: char.connection ?? 60,
                maxConnection: 100,
                reachesOut: true, // NPC still initiates contact
                lost: false, // permanently lost
            };
        }
    }

    getConnection(id) {
        return this.relationships[id]?.connection ?? 0;
    }

    getRelationship(id) {
        return this.relationships[id] ?? null;
    }

    /**
     * Add a new relationship dynamically (e.g. when entering a new act)
     */
    addRelationship(id, data) {
        if (this.relationships[id]) return; // don't overwrite
        this.relationships[id] = {
            name: data.name,
            connection: data.connection ?? 30,
            maxConnection: 100,
            reachesOut: true,
            lost: false,
        };
    }

    getAll() {
        return { ...this.relationships };
    }

    /**
     * Modify connection by delta.
     * @returns {{ connection, lost, justLost }} updated state
     */
    modifyConnection(id, delta) {
        const rel = this.relationships[id];
        if (!rel || rel.lost) return rel;

        const oldConnection = rel.connection;
        rel.connection = Math.max(0, Math.min(rel.maxConnection, rel.connection + delta));

        // Below 10: NPC stops reaching out
        rel.reachesOut = rel.connection >= 10;

        // At 0: permanently lost
        const justLost = oldConnection > 0 && rel.connection === 0;
        if (justLost) {
            rel.lost = true;
        }

        return { ...rel, justLost };
    }

    /**
     * Apply passive decay to all relationships. Called once per day.
     * @param {number} decayAmount - default 2
     */
    applyDailyDecay(decayAmount = 2) {
        const events = [];
        let pinged = false;
        for (const [id, rel] of Object.entries(this.relationships)) {
            if (rel.lost) continue;
            const before = rel.connection;
            const result = this.modifyConnection(id, -decayAmount);
            // Piano sting on meaningful decay thresholds (every 25%)
            if (!pinged && before > 0) {
                const crossedThreshold = [75, 50, 25, 10].some(t => before > t && result.connection <= t);
                if (crossedThreshold || result.justLost) {
                    if (this.audioCues) this.audioCues.playRelationshipDecayPing();
                    pinged = true; // only one sting per day tick
                }
            }
            if (result.justLost) {
                events.push({ type: 'relationship_lost', characterId: id, name: rel.name });
            }
        }
        return events;
    }

    /**
     * Apply a milestone miss penalty.
     */
    missMilestone(id, penalty = 20) {
        // 🎹 The same note. Every time.
        if (this.audioCues) this.audioCues.playRelationshipDecayPing();
        return this.modifyConnection(id, -penalty);
    }

    /**
     * Get portrait opacity for the fading mechanic.
     * @returns {number} 0.15 (nearly invisible) to 1.0 (full)
     */
    getPortraitOpacity(id) {
        const conn = this.getConnection(id);
        return Math.max(0.15, conn / 100);
    }

    /**
     * Get list of characters sorted by connection (descending)
     */
    getSorted() {
        return Object.entries(this.relationships)
            .map(([id, rel]) => ({ id, ...rel }))
            .sort((a, b) => b.connection - a.connection);
    }
}
