/**
 * NarrativeEngine — Manages narrative flow between manifest files and NarrativeScene.
 * Sits between act structure (manifests) and rendering (NarrativeScene).
 * Registered in Phaser registry alongside existing systems.
 */
export default class NarrativeEngine {
    constructor() {
        this.currentAct = null;
        this.manifest = null;
        this.moments = {};
        this.flowIndex = 0;
        this.currentMomentId = null;
        this.completedMoments = [];
        this.choiceHistory = {};
    }

    reset() {
        this.currentAct = null;
        this.manifest = null;
        this.moments = {};
        this.flowIndex = 0;
        this.currentMomentId = null;
        this.completedMoments = [];
        this.choiceHistory = {};
    }

    /**
     * Load an act's flow definition and moments
     * @param {number} actNumber
     * @param {object} manifestData - { act, name, flow: [...] }
     * @param {object} momentsData - { moments: [...] }
     */
    loadAct(actNumber, manifestData, momentsData) {
        this.currentAct = actNumber;
        this.manifest = manifestData;
        this.flowIndex = 0;
        this.currentMomentId = null;

        // Index moments by id for fast lookup
        this.moments = {};
        if (momentsData && momentsData.moments) {
            for (const moment of momentsData.moments) {
                this.moments[moment.id] = moment;
            }
        }
    }

    /**
     * Get the next step in the flow
     * @returns {object|null} { type, ...data } or null if act is done
     */
    getNextStep() {
        if (!this.manifest || this.flowIndex >= this.manifest.flow.length) {
            return null;
        }

        const step = this.manifest.flow[this.flowIndex];
        this.flowIndex++;
        return step;
    }

    /**
     * Peek at the current step without advancing
     */
    peekCurrentStep() {
        if (!this.manifest || this.flowIndex >= this.manifest.flow.length) {
            return null;
        }
        return this.manifest.flow[this.flowIndex];
    }

    /**
     * Load a moment by ID
     * @param {string} momentId
     * @returns {object|null} moment data
     */
    loadMoment(momentId) {
        const moment = this.moments[momentId] || null;
        if (moment) {
            this.currentMomentId = momentId;
        }
        return moment;
    }

    /**
     * Mark a moment as completed with the choice made
     * @param {string} momentId
     * @param {string} choiceId - optional choice identifier
     */
    completeMoment(momentId, choiceId) {
        if (!this.completedMoments.includes(momentId)) {
            this.completedMoments.push(momentId);
        }
        if (choiceId) {
            this.choiceHistory[momentId] = choiceId;
        }
    }

    /**
     * Evaluate a condition against current game state
     * @param {object} condition - { stat, operator, value } or { relationship, operator, value }
     * @param {object} statManager
     * @param {object} relationshipManager
     * @returns {boolean}
     */
    evaluateCondition(condition, statManager, relationshipManager) {
        if (!condition) return true;

        let actual;
        if (condition.stat) {
            actual = statManager.getStat(condition.stat);
        } else if (condition.relationship) {
            actual = relationshipManager.getConnection(condition.relationship);
        } else if (condition.choice) {
            actual = this.choiceHistory[condition.choice];
            return condition.operator === 'eq' ? actual === condition.value : actual !== condition.value;
        } else {
            return true;
        }

        switch (condition.operator) {
            case 'gte': return actual >= condition.value;
            case 'lte': return actual <= condition.value;
            case 'gt': return actual > condition.value;
            case 'lt': return actual < condition.value;
            case 'eq': return actual === condition.value;
            default: return true;
        }
    }

    /**
     * Filter narrative entries by conditions
     * @param {Array} entries - narrative array with optional conditions
     * @param {object} statManager
     * @param {object} relationshipManager
     * @returns {Array} filtered entries
     */
    filterByConditions(entries, statManager, relationshipManager) {
        return entries.filter(entry => {
            if (!entry.condition) return true;
            return this.evaluateCondition(entry.condition, statManager, relationshipManager);
        });
    }

    /**
     * Get save data for persistence
     */
    getProgress() {
        return {
            currentAct: this.currentAct,
            flowIndex: this.flowIndex,
            currentMomentId: this.currentMomentId,
            completedMoments: [...this.completedMoments],
            choiceHistory: { ...this.choiceHistory },
        };
    }

    /**
     * Restore from save data
     */
    restoreProgress(data) {
        if (!data) return;
        this.currentAct = data.currentAct ?? this.currentAct;
        this.flowIndex = data.flowIndex ?? this.flowIndex;
        this.currentMomentId = data.currentMomentId ?? this.currentMomentId;
        this.completedMoments = data.completedMoments ?? this.completedMoments;
        this.choiceHistory = data.choiceHistory ?? this.choiceHistory;
    }
}
