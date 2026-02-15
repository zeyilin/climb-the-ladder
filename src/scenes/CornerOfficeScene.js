import Phaser from 'phaser';
import BaseScene from './BaseScene.js';

/**
 * CornerOfficeScene — Act IV Overworld.
 * Corner office, conference rooms, private clubs, airport lounges.
 * Gold and black — opulent but isolating. Your most frequent contact is a DoorDash driver.
 */
export default class CornerOfficeScene extends BaseScene {
    constructor() {
        super({ key: 'CornerOfficeScene' });
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
        this.cameras.main.setBackgroundColor('#0a0804');
        this.cameras.main.fadeIn(800);

        // Gold-and-black tiles
        for (let x = 0; x < width; x += 32) {
            for (let y = 0; y < height; y += 32) {
                const isRoad = (x % 128 < 32) || (y % 128 < 32);
                this.add.rectangle(x + 16, y + 16, 32, 32,
                    isRoad ? 0x1a1508 : 0x12100a
                ).setStrokeStyle(1, 0x0d0b06);
            }
        }

        // Locations
        const locations = [
            { label: '🏢 CORNER OFFICE', x: 600, y: 100, color: 0x3a3018, action: 'office' },
            { label: '🏠 PENTHOUSE', x: 120, y: 100, color: 0x2a2010, action: 'penthouse' },
            { label: '🥂 PRIVATE CLUB', x: 120, y: 400, color: 0x2a1a2a, action: 'club' },
            { label: '✈️ AIRPORT LOUNGE', x: 600, y: 400, color: 0x1a2a3a, action: 'lounge' },
            { label: '🏥 THERAPIST', x: 360, y: 260, color: 0x1a2a1a, action: 'therapy' },
        ];

        for (const loc of locations) {
            this.add.rectangle(loc.x, loc.y, 130, 80, loc.color)
                .setStrokeStyle(2, 0x3a3018);
            this.add.text(loc.x, loc.y - 15, loc.label, {
                fontFamily: '"Press Start 2P"', fontSize: '7px', color: '#8a7a5a',
            }).setOrigin(0.5);
        }

        // Player
        this.player = this.physics.add.sprite(width / 2, height / 2, 'player');
        this.player.setCollideWorldBounds(true);
        this.cursors = this.input.keyboard.createCursorKeys();
        this.interactKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

        // Mentor NPC
        this.createMentor(360, 160);

        // DoorDash contact tracking
        const doorDashCount = this.registry.get('doorDashOrders') || 0;
        this.registry.set('doorDashOrders', doorDashCount);

        // HUD
        if (!this.scene.isActive('HUDScene')) this.scene.launch('HUDScene');

        // Day planning
        if (this.timeManager.currentSlot === 0) {
            this.time.delayedCall(500, () => {
                this.scene.pause();
                this.scene.launch('TimeAllocationScene');
            });
        }

        // Random mirror moments
        this.scheduleMirrorMoment();

        // Quarter check
        this.checkQuarterEnd();

        // Lifestyle text
        this.showLifestyleText();

        // Resume key
        this.input.keyboard.on('keydown-R', () => {
            if (!this.scene.isActive('ResumeViewScene')) {
                this.scene.launch('ResumeViewScene');
            } else {
                this.scene.stop('ResumeViewScene');
            }
        });

        // --- Register auto-cleanup ---
        this.initBaseScene();
    }

    createMentor(x, y) {
        const npc = this.physics.add.sprite(x, y, 'npc_mentor').setImmovable(true);
        this.add.text(x, y - 22, 'The Mentor', {
            fontFamily: '"VT323", monospace', fontSize: '9px', color: '#8a7a5a',
        }).setOrigin(0.5);

        this.physics.add.overlap(this.player, npc, () => {
            if (!this.interacting && Phaser.Input.Keyboard.JustDown(this.interactKey)) {
                this.interacting = true;
                this.showMentorDialogue();
            }
        });
    }

    showMentorDialogue() {
        const { width, height } = this.cameras.main;
        const sorted = this.relationshipManager.getSorted();
        const avgConnection = sorted.reduce((s, r) => s + r.connection, 0) / (sorted.length || 1);

        let line;
        if (avgConnection < 20) {
            line = '"I had everything. Corner office, the title, the money. My daughter invited me to her wedding on LinkedIn."';
        } else if (avgConnection < 50) {
            line = '"You know what my biggest regret is? I\'ll tell you after this earnings call. ...I forgot what I was saying."';
        } else {
            line = '"You\'re doing better than I did. I can tell because you still have people who call you by your first name."';
        }

        const bg = this.add.rectangle(width / 2, height - 70, 620, 80, 0x0a0804, 0.95)
            .setStrokeStyle(1, 0x3a3018).setDepth(10);
        const name = this.add.text(width / 2 - 290, height - 95, 'The Mentor', {
            fontFamily: '"Press Start 2P"', fontSize: '8px', color: '#ffd93d',
        }).setDepth(11);
        const text = this.add.text(width / 2, height - 70, line, {
            fontFamily: '"VT323", monospace', fontSize: '11px', color: '#c8c8a8',
            fontStyle: 'italic', wordWrap: { width: 580 },
        }).setOrigin(0.5).setDepth(11);

        this.time.delayedCall(4000, () => {
            bg.destroy(); name.destroy(); text.destroy();
            this.interacting = false;
        });
    }

    scheduleMirrorMoment() {
        // 30% chance per scene create of triggering a mirror moment
        if (Math.random() < 0.3) {
            const delay = 5000 + Math.random() * 10000;
            this.time.delayedCall(delay, () => {
                this.scene.pause();
                this.scene.launch('MirrorMomentScene');
            });
        }
    }

    checkQuarterEnd() {
        const week = this.timeManager.currentWeek;
        if (week > 1 && week % 4 === 1 && this.timeManager.currentDay === 1) {
            this.time.delayedCall(1000, () => {
                this.scene.pause();
                this.scene.launch('PerformanceReviewScene');
            });
        }
    }

    showLifestyleText() {
        const { width } = this.cameras.main;
        const lines = [
            'Your apartment costs $4,500/month. You\'re there 6 hours a day. That\'s $25/hour to sleep.',
            'You have a wine subscription. You don\'t drink wine. It seemed like a "you" thing to do.',
            'Your DoorDash driver Miguel knows your order. He\'s your most consistent relationship.',
            'You\'re on a first-name basis with the TSA agent at Terminal B. You see him more than your dad.',
            'The Peloton has become a $2,400 coat rack. You still pay the subscription.',
        ];
        const line = lines[Math.floor(Math.random() * lines.length)];
        this.add.text(width / 2, 30, line, {
            fontFamily: '"VT323", monospace', fontSize: '9px', color: '#5a4a3a', fontStyle: 'italic',
        }).setOrigin(0.5).setDepth(5);
    }

    processDayResults(activities) {
        for (const activity of activities) {
            switch (activity.id) {
                case 'work':
                    this.hoursWorked += 10;
                    this.launchEscalatedMiniGame();
                    return;
                case 'manage_team':
                    this.hoursWorked += 6;
                    this.scene.pause();
                    this.scene.launch('TeamManagementScene');
                    return;
                case 'attend_gala':
                    this.hoursWorked += 4;
                    this.statManager.modifyStat('network', 6);
                    this.statManager.modifyStat('prestige', 5);
                    this.statManager.modifyStat('burnout', 5);
                    break;
                case 'call_jordan':
                    this.hoursWithPeople += 1;
                    this.relationshipManager.modifyConnection('jordan', 8);
                    this.statManager.modifyStat('authenticity', 5);
                    break;
                case 'visit_dad':
                    this.hoursWithPeople += 4;
                    this.relationshipManager.modifyConnection('dad', 10);
                    this.relationshipManager.modifyConnection('mom', 5);
                    this.statManager.modifyStat('authenticity', 5);
                    this.statManager.modifyStat('burnout', -3);
                    break;
                case 'therapy':
                    this.statManager.modifyStat('burnout', -10);
                    this.statManager.modifyStat('authenticity', 3);
                    break;
                case 'rest':
                    this.statManager.modifyStat('burnout', -5);
                    this.registry.set('doorDashOrders', (this.registry.get('doorDashOrders') || 0) + 1);
                    break;
            }
        }

        this.registry.set('hoursWorked', this.hoursWorked);
        this.registry.set('hoursWithPeople', this.hoursWithPeople);

        this.relationshipManager.applyDailyDecay();
        const result = this.timeManager.advanceDay();
        if (result === 'act_over') {
            this.scene.start('UltimatePromotionScene');
        }
    }

    launchEscalatedMiniGame() {
        this.scene.start('EscalatedMiniGame');
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
