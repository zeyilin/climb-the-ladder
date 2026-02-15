export default class PersistenceManager {
    constructor(game) {
        this.game = game;
        this.key = 'climbtheladder_save_v1';
    }

    save() {
        const registry = this.game.registry;
        const data = {
            stats: registry.get('statManager').stats,
            relationships: registry.get('relationshipManager').relationships,
            resume: registry.get('resumeSystem').entries,
            time: {
                week: registry.get('timeManager').currentWeek,
                day: registry.get('timeManager').currentDay,
                act: registry.get('timeManager').currentAct,
            },
            careerTrack: registry.get('careerTrack') || null,
            hoursWorked: registry.get('hoursWorked') || 0,
            hoursWithPeople: registry.get('hoursWithPeople') || 0,
            doorDashOrders: registry.get('doorDashOrders') || 0,
            consecutiveRestDays: registry.get('consecutiveRestDays') || 0,
            scrapbook: registry.get('scrapbook') || [],
            narrativeProgress: registry.get('narrativeEngine')?.getProgress() || null,
            timestamp: Date.now(),
        };

        try {
            localStorage.setItem(this.key, JSON.stringify(data));
            console.log('Game saved.');
        } catch (e) {
            console.error('Save failed:', e);
        }
    }

    load() {
        try {
            const raw = localStorage.getItem(this.key);
            if (!raw) return false;

            const data = JSON.parse(raw);
            const registry = this.game.registry;

            // Restore Stats
            const statMgr = registry.get('statManager');
            if (data.stats) statMgr.stats = { ...statMgr.stats, ...data.stats };

            // Restore Relationships
            const relMgr = registry.get('relationshipManager');
            if (data.relationships) relMgr.relationships = data.relationships;

            // Restore Resume
            const resumeSys = registry.get('resumeSystem');
            if (data.resume) resumeSys.entries = { ...resumeSys.entries, ...data.resume };

            // Restore Time
            const timeMgr = registry.get('timeManager');
            if (data.time) {
                timeMgr.currentWeek = data.time.week;
                timeMgr.currentDay = data.time.day;
                timeMgr.currentAct = data.time.act;
                timeMgr.applyActConfig();
            }

            // Restore registry values
            if (data.careerTrack) registry.set('careerTrack', data.careerTrack);
            registry.set('hoursWorked', data.hoursWorked || 0);
            registry.set('hoursWithPeople', data.hoursWithPeople || 0);
            registry.set('doorDashOrders', data.doorDashOrders || 0);
            registry.set('consecutiveRestDays', data.consecutiveRestDays || 0);
            if (data.scrapbook) registry.set('scrapbook', data.scrapbook);

            // Restore narrative progress
            const narrativeEngine = registry.get('narrativeEngine');
            if (narrativeEngine && data.narrativeProgress) {
                narrativeEngine.restoreProgress(data.narrativeProgress);
            }

            console.log('Game loaded.');
            return true;
        } catch (e) {
            console.error('Load failed:', e);
            return false;
        }
    }

    clear() {
        localStorage.removeItem(this.key);
    }
}
