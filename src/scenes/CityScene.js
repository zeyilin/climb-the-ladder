import Phaser from 'phaser';

/**
 * CityScene — Act III Overworld.
 * Tiny apartment → gleaming office tower → sad Sweetgreen → subway at midnight.
 * Desaturated grey-blue palette. The fluorescent lighting energy of your twenties.
 */
export default class CityScene extends Phaser.Scene {
    constructor() {
        super({ key: 'CityScene' });
    }

    init() {
        this.statManager = this.registry.get('statManager');
        this.timeManager = this.registry.get('timeManager');
        this.relationshipManager = this.registry.get('relationshipManager');
        this.resumeSystem = this.registry.get('resumeSystem');
        this.careerTrack = this.registry.get('careerTrack') || 'consulting';
        this.hoursWorked = this.registry.get('hoursWorked') || 0;
        this.hoursWithPeople = this.registry.get('hoursWithPeople') || 0;
    }

    create() {
        const { width, height } = this.cameras.main;
        this.cameras.main.setBackgroundColor('#0a0c12');
        this.cameras.main.fadeIn(800);

        // Add Act III characters if not already present
        this.addAct3Characters();

        // Build city map
        this.buildCityMap();

        // Player
        this.player = this.physics.add.sprite(width / 2, height / 2, 'player');
        this.player.setCollideWorldBounds(true);

        // Controls
        this.cursors = this.input.keyboard.createCursorKeys();
        this.interactKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

        // Launch HUD
        if (!this.scene.isActive('HUDScene')) {
            this.scene.launch('HUDScene');
        }

        // Show day planning at start of each day
        if (this.timeManager.currentSlot === 0) {
            this.time.delayedCall(500, () => {
                this.scene.pause();
                this.scene.launch('TimeAllocationScene');
            });
        }

        // Check for quarter-end performance review
        this.checkQuarterEnd();

        // Resume key (R)
        this.input.keyboard.on('keydown-R', () => {
            if (!this.scene.isActive('ResumeViewScene')) {
                this.scene.launch('ResumeViewScene');
            } else {
                this.scene.stop('ResumeViewScene');
            }
        });

        // Lifestyle inflation flavor text
        this.showLifestyleText();

        // --- Cleanup on shutdown ---
        this.events.on('shutdown', () => {
            this.input.keyboard.removeAllListeners();
        });
    }

    addAct3Characters() {
        const chars = this.cache.json.get('act3_characters');
        if (chars && chars.characters) {
            for (const c of chars.characters) {
                this.relationshipManager.addRelationship(c.id, c);
            }
        }
    }

    buildCityMap() {
        const { width, height } = this.cameras.main;

        // City grid background — desaturated grey-blue tiles
        for (let x = 0; x < width; x += 32) {
            for (let y = 0; y < height; y += 32) {
                const isRoad = (x % 128 < 32) || (y % 128 < 32);
                this.add.rectangle(x + 16, y + 16, 32, 32,
                    isRoad ? 0x15171f : 0x1a1e2a
                ).setStrokeStyle(1, 0x0d0f15);
            }
        }

        // Locations
        const locations = [
            { label: '🏢 OFFICE', x: 600, y: 120, color: 0x2a3a5e, action: 'office' },
            { label: '🏠 APT', x: 120, y: 120, color: 0x2a2a3e, action: 'apartment' },
            { label: '🥗 SWEETGREEN', x: 120, y: 400, color: 0x1a3a2a, action: 'sweetgreen' },
            { label: '🚇 SUBWAY', x: 600, y: 400, color: 0x3a2a2a, action: 'subway' },
            { label: '🍺 BAR', x: 360, y: 260, color: 0x3a2a3e, action: 'bar' },
        ];

        this.locationZones = [];
        for (const loc of locations) {
            const bg = this.add.rectangle(loc.x, loc.y, 120, 80, loc.color)
                .setStrokeStyle(2, 0x3a3a5e);

            this.add.text(loc.x, loc.y - 15, loc.label, {
                fontFamily: '"Press Start 2P"', fontSize: '8px', color: '#8a8aaa',
            }).setOrigin(0.5);

            // Create zone
            const zone = this.add.zone(loc.x, loc.y, 130, 90).setInteractive();
            zone.locationAction = loc.action;
            this.locationZones.push(zone);
        }

        // NPCs at locations
        this.createNPC(580, 150, 'npc_derek', 'Derek', 'derek');
        this.createNPC(340, 240, 'npc_colleague', 'Jamie', 'colleague');
        this.createNPC(620, 150, 'npc_boss', 'Patricia', 'boss');
    }

    createNPC(x, y, sprite, name, id) {
        const npc = this.physics.add.sprite(x, y, sprite).setImmovable(true);
        npc.npcId = id;
        npc.npcName = name;

        const label = this.add.text(x, y - 22, name, {
            fontFamily: '"VT323", monospace', fontSize: '9px', color: '#6a6a8a',
        }).setOrigin(0.5);

        // Fade based on relationship
        const opacity = this.relationshipManager.getPortraitOpacity(id);
        npc.setAlpha(opacity);
        label.setAlpha(opacity);

        // Overlap detection for interaction
        this.physics.add.overlap(this.player, npc, () => {
            if (!this.interacting && Phaser.Input.Keyboard.JustDown(this.interactKey)) {
                this.interacting = true;
                this.interactWithNPC(id, name);
            }
        });
    }

    interactWithNPC(id, name) {
        const dialogueKey = `dialogue_${id === 'colleague' ? 'colleague' : id}`;
        const data = this.cache.json.get(dialogueKey);

        if (data) {
            this.scene.pause();
            this.scene.launch('DialogueScene', {
                dialogueKey: dialogueKey,
                characterId: id,
                parentSceneKey: 'CityScene',
            });
        } else {
            // Fallback: quick interaction
            this.showQuickDialogue(name, this.getQuickDialogue(id));
        }
    }

    getQuickDialogue(id) {
        const lines = {
            derek: [
                '"Humbled to announce I\'ve been promoted to VP. #blessed #grind"',
                '"I just read that book everyone\'s reading. It changed my perspective. (He finished the introduction.)"',
                '"We should get coffee sometime!" (He will never get coffee with you.)',
            ],
            colleague: [
                '"The Keurig is working again. The darkness lifts. Temporarily."',
                '"Patricia wants us in at 7am tomorrow. I assume that\'s a typo. It\'s not."',
            ],
            boss: [
                '"Quick question!" (It\'s never quick.)',
                '"I need you to take point on the synergy initiative." (There is no initiative. It\'s a test.)',
                '"Great work on the thing. Keep doing... the thing."',
            ],
        };
        const pool = lines[id] || ['"..."'];
        return pool[Math.floor(Math.random() * pool.length)];
    }

    showQuickDialogue(name, text) {
        const { width, height } = this.cameras.main;
        const bg = this.add.rectangle(width / 2, height - 70, 600, 80, 0x0a0a15, 0.95)
            .setStrokeStyle(1, 0x3a3a5e).setDepth(10);
        const nameText = this.add.text(width / 2 - 280, height - 95, name, {
            fontFamily: '"Press Start 2P"', fontSize: '8px', color: '#ffd93d',
        }).setDepth(11);
        const lineText = this.add.text(width / 2, height - 70, text, {
            fontFamily: '"VT323", monospace', fontSize: '11px', color: '#c8c8e8',
            wordWrap: { width: 560 },
        }).setOrigin(0.5).setDepth(11);

        this.time.delayedCall(3000, () => {
            bg.destroy();
            nameText.destroy();
            lineText.destroy();
            this.interacting = false;
        });
    }

    showLifestyleText() {
        const { width } = this.cameras.main;
        const wealth = this.statManager.getStat('wealth');
        const lines = [
            'Your apartment has one lamp. The light is warm. Everything else is not.',
            'You bought a Peloton. You used it twice. It hangs clothes now.',
            'The Sweetgreen salad costs $17. You eat it 4 times a week.',
            'Your phone screen time is 6 hours/day. 2 of those are Slack.',
            'You have 3 unread texts from Sam. The oldest is 2 weeks old.',
        ];
        const line = lines[Math.floor(Math.random() * lines.length)];

        this.add.text(width / 2, 30, line, {
            fontFamily: '"VT323", monospace', fontSize: '9px', color: '#4a4a6a', fontStyle: 'italic',
        }).setOrigin(0.5).setDepth(5);
    }

    checkQuarterEnd() {
        const config = { quarterLength: 5 };
        const week = this.timeManager.currentWeek;
        if (week > 1 && week % config.quarterLength === 1 && this.timeManager.currentDay === 1) {
            this.time.delayedCall(1000, () => {
                this.scene.pause();
                this.scene.launch('PerformanceReviewScene');
            });
        }
    }

    processDayResults(activities) {
        for (const activity of activities) {
            switch (activity.id) {
                case 'work':
                    this.hoursWorked += 8;
                    this.launchCareerMiniGame();
                    return; // mini-game handles the rest
                case 'socialize_colleague':
                    this.hoursWithPeople += 3;
                    this.relationshipManager.modifyConnection('colleague', 10);
                    this.statManager.modifyStat('burnout', -3);
                    break;
                case 'call_mom':
                    this.hoursWithPeople += 1;
                    this.relationshipManager.modifyConnection('mom', 8);
                    this.statManager.modifyStat('authenticity', 3);
                    break;
                case 'text_sam':
                    this.hoursWithPeople += 1;
                    this.relationshipManager.modifyConnection('sam', 5);
                    break;
                case 'attend_event':
                    this.hoursWorked += 4;
                    this.statManager.modifyStat('network', 8);
                    this.statManager.modifyStat('prestige', 3);
                    this.statManager.modifyStat('burnout', 3);
                    break;
                case 'workout':
                    this.statManager.modifyStat('burnout', -8);
                    break;
                case 'pivot_career':
                    this.handlePivot();
                    return;
                case 'rest':
                    this.statManager.modifyStat('burnout', -5);
                    this.registry.set('consecutiveRestDays',
                        (this.registry.get('consecutiveRestDays') || 0) + 1);
                    break;
            }
        }

        this.registry.set('hoursWorked', this.hoursWorked);
        this.registry.set('hoursWithPeople', this.hoursWithPeople);

        // Apply daily relationship decay
        this.relationshipManager.applyDailyDecay();

        // Advance day
        const result = this.timeManager.advanceDay();
        if (result === 'act_over') {
            this.scene.start('PromotionScene');
        }
    }

    launchCareerMiniGame() {
        const track = this.careerTrack;
        const sceneMap = {
            consulting: 'ConsultingMiniGame',
            banking: 'BankingMiniGame',
            startup: 'StartupMiniGame',
            bigtech: 'BigTechMiniGame',
            insurance: 'InsuranceAdjustingMiniGame',
        };
        this.scene.start(sceneMap[track] || 'ConsultingMiniGame');
    }

    handlePivot() {
        const { width, height } = this.cameras.main;

        // Spec: 40% same, 30% different, 20% same again, 10% insurance
        const tracks = ['consulting', 'banking', 'startup', 'bigtech'];
        const current = this.careerTrack;
        const roll = Math.random();

        let newTrack;
        let isInsurance = false;
        if (roll < 0.1) {
            // 10% — Insurance Adjusting (hidden 5th track)
            newTrack = 'insurance';
            isInsurance = true;
        } else if (roll < 0.5) {
            // 40% — same track
            newTrack = current;
        } else {
            // 50% — different track
            const others = tracks.filter(t => t !== current);
            newTrack = others[Math.floor(Math.random() * others.length)];
        }

        this.registry.set('careerTrack', newTrack);
        this.careerTrack = newTrack;

        let msg;
        if (isInsurance) {
            msg = '"The algorithm has spoken."\n\nYou pivoted to... Insurance Adjusting.\nYou fill out forms now. That\'s it. That\'s the job.';
        } else if (newTrack === current) {
            msg = `"Your recruiter said you'd be a great culture fit. Again."\n\nYou pivoted to... ${newTrack}. The same track. The universe has a sense of humor.`;
        } else {
            msg = `You pivoted to ${newTrack}. It cost you a full quarter.\nWas it worth it? You'll find out. Probably not.`;
        }

        // Costs 5 weeks of burnout
        this.statManager.modifyStat('burnout', 15);
        for (let i = 0; i < 5; i++) this.timeManager.advanceDay();

        const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.9).setDepth(20);
        const text = this.add.text(width / 2, height / 2, msg, {
            fontFamily: '"VT323", monospace', fontSize: '12px', color: '#a8a8c8',
            align: 'center', lineSpacing: 6, wordWrap: { width: 500 },
        }).setOrigin(0.5).setDepth(21);

        this.time.delayedCall(4000, () => {
            overlay.destroy();
            text.destroy();
        });
    }

    update() {
        if (!this.player || !this.cursors) return;

        const speed = 160;
        this.player.setVelocity(0);

        if (this.cursors.left.isDown) this.player.setVelocityX(-speed);
        else if (this.cursors.right.isDown) this.player.setVelocityX(speed);

        if (this.cursors.up.isDown) this.player.setVelocityY(-speed);
        else if (this.cursors.down.isDown) this.player.setVelocityY(speed);
    }
}
