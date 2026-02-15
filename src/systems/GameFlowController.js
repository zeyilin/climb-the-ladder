import NarrativeScene from '../scenes/NarrativeScene.js';

/**
 * GameFlowController — Orchestrates the entire game flow.
 * Drives the act → planning → narrative → day_end loop.
 * Registered in Phaser registry, called by PlanningScene and NarrativeScene.
 */
export default class GameFlowController {
    constructor(game) {
        this.game = game;
    }

    get registry() { return this.game.registry; }
    get narrativeEngine() { return this.registry.get('narrativeEngine'); }
    get timeManager() { return this.registry.get('timeManager'); }
    get relationshipManager() { return this.registry.get('relationshipManager'); }
    get statManager() { return this.registry.get('statManager'); }

    /**
     * Start a new act from the beginning
     */
    startAct(actNumber) {
        const manifestKey = `act${actNumber}_manifest`;
        const momentsKey = `act${actNumber}_moments`;

        const scene = this.game.scene.getScene('NarrativeScene') ||
                       this.game.scene.getScene('PlanningScene') ||
                       this.game.scene.getScene('MenuScene');

        const manifestData = scene.cache.json.get(manifestKey);
        const momentsData = scene.cache.json.get(momentsKey);

        if (!manifestData || !momentsData) {
            console.error(`Missing manifest or moments for act ${actNumber}`);
            return;
        }

        this.narrativeEngine.loadAct(actNumber, manifestData, momentsData);
        this.timeManager.currentAct = actNumber;
        this.timeManager.currentDay = 1;
        this.timeManager.currentWeek = 1;
        this.timeManager.currentSlot = 0;
        this.timeManager.totalDays = 0;
        this.timeManager.daySlots = [];
        this.timeManager.isActOver = false;
        this.timeManager.applyActConfig();

        // Add act-specific characters
        this.addActCharacters(actNumber, scene);

        // Process the flow
        this.processNextStep();
    }

    /**
     * Add characters introduced in this act
     */
    addActCharacters(actNumber, scene) {
        if (actNumber === 2) {
            const act2Data = scene.cache.json.get('act2_characters');
            if (act2Data) {
                for (const char of act2Data.characters) {
                    this.relationshipManager.addRelationship(char.id, char);
                }
            }
        } else if (actNumber === 3) {
            const act3Data = scene.cache.json.get('act3_characters');
            if (act3Data) {
                for (const char of act3Data.characters) {
                    this.relationshipManager.addRelationship(char.id, char);
                }
            }
        }
    }

    /**
     * Process the next step in the current act's flow
     */
    processNextStep() {
        const step = this.narrativeEngine.getNextStep();

        if (!step) {
            // Act is complete
            this.handleActComplete();
            return;
        }

        switch (step.type) {
            case 'title_card':
                this.showTitleCard(step);
                break;
            case 'planning':
                this.showPlanning(step);
                break;
            case 'moment':
                this.showMoment(step);
                break;
            case 'day_end':
                this.handleDayEnd();
                break;
            case 'climax':
                this.showClimax(step);
                break;
            case 'act_transition':
                this.handleActTransition(step);
                break;
            case 'career_roulette':
                this.showCareerRoulette();
                break;
            case 'mirror_moment':
                this.showMirrorMoment();
                break;
            case 'scrapbook':
                this.showScrapbook();
                break;
            default:
                console.warn(`Unknown flow step type: ${step.type}`);
                this.processNextStep();
        }
    }

    /**
     * Show a title card (ACT I — THE GOOD KID)
     */
    showTitleCard(step) {
        // Stop all gameplay scenes first
        this.stopGameplayScenes();

        // Register a callback so NarrativeScene can trigger the title card after create
        this.registry.set('pendingTitleCard', {
            title: step.title,
            subtitle: step.subtitle,
            callback: () => this.processNextStep(),
        });

        this.game.scene.start('NarrativeScene', {
            titleCardOnly: true,
            actNumber: this.timeManager.currentAct,
        });
    }

    /**
     * Show the PlanningScene for a day
     */
    showPlanning(step) {
        this.stopGameplayScenes();

        // Register callback for when planning finishes
        this.registry.set('flowController', () => {
            this.processDayMoments();
        });

        this.game.scene.start('PlanningScene');
    }

    /**
     * After planning, process narrative moments for the day
     */
    processDayMoments() {
        this.registry.set('flowController', null);
        this.processNextStep();
    }

    /**
     * Show a narrative moment
     */
    showMoment(step) {
        const momentData = this.narrativeEngine.loadMoment(step.id);

        if (!momentData) {
            console.warn(`Missing moment: ${step.id}`);
            this.processNextStep();
            return;
        }

        this.stopGameplayScenes();

        this.game.scene.start('NarrativeScene', {
            momentId: step.id,
            momentData: momentData,
            actNumber: this.timeManager.currentAct,
            onComplete: () => this.processNextStep(),
        });
    }

    /**
     * Handle end of day — apply decay, advance time
     */
    handleDayEnd() {
        // Apply daily relationship decay
        this.relationshipManager.applyDailyDecay();

        // Advance the day
        const result = this.timeManager.advanceDay();

        if (result === 'act_over') {
            // Act is over — continue flow (should hit climax or act_transition next)
            this.processNextStep();
        } else {
            // Continue to next day
            this.processNextStep();
        }
    }

    /**
     * Show the climax moment for an act
     */
    showClimax(step) {
        const momentData = this.narrativeEngine.loadMoment(step.id);

        if (!momentData) {
            console.warn(`Missing climax moment: ${step.id}`);
            this.processNextStep();
            return;
        }

        this.stopGameplayScenes();

        this.game.scene.start('NarrativeScene', {
            momentId: step.id,
            momentData: momentData,
            actNumber: this.timeManager.currentAct,
            onComplete: () => this.processNextStep(),
        });
    }

    /**
     * Handle act transition
     */
    handleActTransition(step) {
        const nextAct = step.nextAct;

        if (nextAct > 5) {
            // Game over — show scrapbook then ending
            this.showScrapbook();
            return;
        }

        this.startAct(nextAct);
    }

    /**
     * Show Career Roulette (end of Act II)
     */
    showCareerRoulette() {
        this.stopGameplayScenes();
        // CareerRouletteScene is preserved — it will handle its own transition
        // We need to intercept its completion
        this.game.scene.start('CareerRouletteScene');
    }

    /**
     * Show Mirror Moment (Acts III-IV)
     */
    showMirrorMoment() {
        const activeScene = this.getActiveScene();

        // Update MirrorMomentScene to resume the flow on completion
        this.registry.set('mirrorMomentCallback', () => {
            this.processNextStep();
        });

        this.stopGameplayScenes();
        this.game.scene.start('MirrorMomentScene');
    }

    /**
     * Show Scrapbook (Act V)
     */
    showScrapbook() {
        this.stopGameplayScenes();
        this.game.scene.start('ScrapbookScene');
    }

    /**
     * Handle act completion
     */
    handleActComplete() {
        // This shouldn't normally be reached if manifests are well-formed
        // (they should end with act_transition)
        const currentAct = this.timeManager.currentAct;
        if (currentAct < 5) {
            this.startAct(currentAct + 1);
        } else {
            this.showScrapbook();
        }
    }

    /**
     * Resume from a saved game
     */
    resumeFromSave() {
        const persistence = this.registry.get('persistenceManager');
        if (!persistence) return;

        const narrativeProgress = this.narrativeEngine.getProgress();
        const act = narrativeProgress.currentAct || this.timeManager.currentAct;

        // Reload the act data
        const anyScene = this.getActiveScene() || this.game.scene.getScene('MenuScene');
        const manifestData = anyScene.cache.json.get(`act${act}_manifest`);
        const momentsData = anyScene.cache.json.get(`act${act}_moments`);

        if (manifestData && momentsData) {
            this.narrativeEngine.loadAct(act, manifestData, momentsData);
            this.narrativeEngine.restoreProgress(narrativeProgress);
        }

        // Ensure act-specific characters are available
        for (let a = 2; a <= act; a++) {
            this.addActCharacters(a, anyScene);
        }

        this.processNextStep();
    }

    /**
     * Get any currently active gameplay scene
     */
    getActiveScene() {
        const scenes = ['NarrativeScene', 'PlanningScene', 'MenuScene'];
        for (const key of scenes) {
            const scene = this.game.scene.getScene(key);
            if (scene && this.game.scene.isActive(key)) {
                return scene;
            }
        }
        return null;
    }

    /**
     * Stop all gameplay scenes (not UI overlays)
     */
    stopGameplayScenes() {
        const scenes = ['NarrativeScene', 'PlanningScene', 'MenuScene'];
        for (const key of scenes) {
            try {
                if (this.game.scene.isActive(key)) {
                    this.game.scene.stop(key);
                }
            } catch (e) { /* scene may not exist */ }
        }
    }
}
