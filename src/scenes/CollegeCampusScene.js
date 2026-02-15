import Phaser from 'phaser';

/**
 * CollegeCampusScene — Act II overworld.
 * Larger campus with dorms, lecture halls, library, career center.
 * Same top-down exploration as HighSchoolScene but with college activities.
 */
export default class CollegeCampusScene extends Phaser.Scene {
    constructor() {
        super({ key: 'CollegeCampusScene' });
    }

    init() {
        this.statManager = this.registry.get('statManager');
        this.relationshipManager = this.registry.get('relationshipManager');
        this.timeManager = this.registry.get('timeManager');
        this.dialogueSystem = this.registry.get('dialogueSystem');
        this.resumeSystem = this.registry.get('resumeSystem');
        this.hoursWorked = this.registry.get('hoursWorked') || 0;
        this.hoursWithPeople = this.registry.get('hoursWithPeople') || 0;
        this.consecutiveRestDays = this.registry.get('consecutiveRestDays') || 0;
    }

    create() {
        const { width, height } = this.cameras.main;
        this.cameras.main.setBackgroundColor('#0a0a20');
        this.cameras.main.fadeIn(500);

        // Initialize Act II characters
        this.initializeAct2Characters();

        // Build campus map
        this.buildCampus();

        // Player
        this.player = this.physics.add.sprite(width / 2, height / 2, 'player');
        this.player.setCollideWorldBounds(true);
        this.player.setDepth(10);

        // NPCs
        this.npcs = {};
        this.createNPC('priya', 'npc_priya', 300, 180, 'dialogue_priya');
        this.createNPC('morgan', 'npc_morgan', 520, 380, 'dialogue_morgan');

        // Controls
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
        });
        this.interactKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
        this.tabKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TAB);
        this.resumeKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);

        // HUD
        this.scene.launch('HUDScene');

        // Prompt
        this.promptText = this.add.text(width / 2, height - 40, '', {
            fontFamily: '"Press Start 2P"', fontSize: '8px', color: '#ffd93d', align: 'center',
        }).setOrigin(0.5).setDepth(20).setAlpha(0);

        // Start day
        this.startNewDay();

        // TAB for relationships
        this.tabKey.on('down', () => {
            if (this.scene.isActive('RelationshipPanelScene')) {
                this.scene.stop('RelationshipPanelScene');
            } else {
                this.scene.launch('RelationshipPanelScene');
            }
        });

        // R for résumé
        this.resumeKey.on('down', () => {
            if (this.scene.isActive('ResumeViewScene')) {
                this.scene.stop('ResumeViewScene');
            } else {
                this.scene.launch('ResumeViewScene');
            }
        });

        // Instructions
        const inst = this.add.text(width / 2, 20, 'WASD move • E interact • TAB relationships • R résumé', {
            fontFamily: '"VT323", monospace', fontSize: '10px', color: '#4a4a6a',
        }).setOrigin(0.5).setDepth(20);
        this.tweens.add({ targets: inst, alpha: 0, delay: 5000, duration: 1000 });

        // Phone notification system (old friends texting)
        this.setupPhoneNotifications();

        // --- Cleanup on shutdown ---
        this.events.on('shutdown', () => {
            this.input.keyboard.removeAllListeners();
        });
    }

    initializeAct2Characters() {
        const rm = this.relationshipManager;
        // Add new college characters
        if (!rm.getRelationship('priya')) {
            rm.addRelationship('priya', { name: 'Priya', connection: 30, color: '#E88D67', emoji: '👩‍💻' });
        }
        if (!rm.getRelationship('morgan')) {
            rm.addRelationship('morgan', { name: 'Morgan', connection: 20, color: '#C084FC', emoji: '💜' });
        }
    }

    buildCampus() {
        const { width, height } = this.cameras.main;
        const gfx = this.add.graphics();

        // Ground - blue/crimson palette
        gfx.fillStyle(0x0a0a20);
        gfx.fillRect(0, 0, width, height);

        // Paths (wider, brick-like)
        gfx.fillStyle(0x1a1a35);
        gfx.fillRect(width / 2 - 25, 0, 50, height);
        gfx.fillRect(0, height / 2 - 25, width, 50);

        // Diagonal path
        gfx.lineStyle(40, 0x1a1a35);
        gfx.lineBetween(0, 0, width, height);

        // Dorm
        gfx.fillStyle(0x3a2a4e);
        gfx.fillRect(50, 50, 100, 80);
        this.add.text(100, 38, '🏠', { fontSize: '20px' }).setOrigin(0.5);
        this.add.text(100, 140, 'Dorm', {
            fontFamily: '"Press Start 2P"', fontSize: '7px', color: '#7a5aaa',
        }).setOrigin(0.5);

        // Lecture Hall
        gfx.fillStyle(0x2a3a4e);
        gfx.fillRect(340, 50, 120, 80);
        this.add.text(400, 38, '🎓', { fontSize: '20px' }).setOrigin(0.5);
        this.add.text(400, 140, 'Lecture Hall', {
            fontFamily: '"Press Start 2P"', fontSize: '7px', color: '#5a7aaa',
        }).setOrigin(0.5);

        // Library
        gfx.fillStyle(0x2a2a3e);
        gfx.fillRect(580, 50, 100, 80);
        this.add.text(630, 38, '📚', { fontSize: '20px' }).setOrigin(0.5);
        this.add.text(630, 140, 'Library', {
            fontFamily: '"Press Start 2P"', fontSize: '7px', color: '#5a5a8a',
        }).setOrigin(0.5);

        // Career Center
        gfx.fillStyle(0x4a3a2a);
        gfx.fillRect(50, 350, 110, 80);
        this.add.text(105, 338, '💼', { fontSize: '20px' }).setOrigin(0.5);
        this.add.text(105, 440, 'Career Center', {
            fontFamily: '"Press Start 2P"', fontSize: '7px', color: '#aa8a5a',
        }).setOrigin(0.5);

        // Frat Row / Social area
        gfx.fillStyle(0x3a1a1a);
        gfx.fillRect(580, 350, 100, 80);
        this.add.text(630, 338, '🎉', { fontSize: '20px' }).setOrigin(0.5);
        this.add.text(630, 440, 'Social Row', {
            fontFamily: '"Press Start 2P"', fontSize: '7px', color: '#aa5a5a',
        }).setOrigin(0.5);

        // Decorative trees
        gfx.fillStyle(0x0d1a0d);
        for (let i = 0; i < 12; i++) {
            const x = Phaser.Math.Between(50, width - 50);
            const y = Phaser.Math.Between(160, 320);
            gfx.fillCircle(x, y, Phaser.Math.Between(3, 7));
        }
    }

    createNPC(id, spriteKey, x, y, dialogueKey) {
        const npc = this.physics.add.sprite(x, y, spriteKey);
        npc.setImmovable(true).setDepth(9);

        const rel = this.relationshipManager.getRelationship(id);
        const name = rel?.name || id;
        const label = this.add.text(x, y - 22, name, {
            fontFamily: '"Press Start 2P"', fontSize: '6px', color: '#aaaacc',
        }).setOrigin(0.5).setDepth(11);

        const indicator = this.add.sprite(x, y - 30, 'indicator').setDepth(11).setAlpha(0.7);
        this.tweens.add({ targets: indicator, y: y - 36, duration: 600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

        const opacity = this.relationshipManager.getPortraitOpacity(id);
        npc.setAlpha(opacity);
        label.setAlpha(opacity);
        indicator.setAlpha(opacity * 0.7);

        this.npcs[id] = { sprite: npc, label, indicator, dialogueKey, id };
        this.physics.add.collider(this.player, npc);
    }

    setupPhoneNotifications() {
        // Old friends text you periodically
        this.time.addEvent({
            delay: 15000,
            loop: true,
            callback: () => {
                if (Math.random() < 0.3) {
                    this.showPhoneNotification();
                }
            },
        });
    }

    showPhoneNotification() {
        const { width } = this.cameras.main;
        const messages = [
            { from: 'Sam', text: 'yo you alive? lol', emoji: '📱' },
            { from: 'Mom', text: 'Hi sweetie! Just checking in ❤️', emoji: '📞' },
            { from: 'Jordan', text: 'i learned to juggle 4 things now. FOUR.', emoji: '🤹' },
            { from: 'Dad', text: 'How is school? The garage misses you', emoji: '🏠' },
            { from: 'Sam', text: 'remember when we used to actually hang out', emoji: '📱' },
            { from: 'Mom', text: 'Your father made turkey. He used YouTube again.', emoji: '📞' },
        ];

        const msg = Phaser.Utils.Array.GetRandom(messages);
        const notif = this.add.container(width + 200, 60).setDepth(30);

        const bg = this.add.rectangle(0, 0, 280, 45, 0x1a1a2e, 0.95).setStrokeStyle(1, 0x3a3a5e);
        const icon = this.add.text(-125, -8, msg.emoji, { fontSize: '16px' });
        const name = this.add.text(-100, -12, msg.from, {
            fontFamily: '"Press Start 2P"', fontSize: '7px', color: '#ffd93d',
        });
        const text = this.add.text(-100, 3, msg.text, {
            fontFamily: '"VT323", monospace', fontSize: '9px', color: '#8888aa',
        });

        notif.add([bg, icon, name, text]);

        // Slide in
        this.tweens.add({
            targets: notif, x: width - 160, duration: 500, ease: 'Back.easeOut',
            onComplete: () => {
                // Slide out after 3 seconds
                this.tweens.add({
                    targets: notif, x: width + 200, delay: 3000, duration: 400,
                    ease: 'Back.easeIn', onComplete: () => notif.destroy(),
                });
            },
        });
    }

    startNewDay() {
        if (this.timeManager.isActOver) {
            this.scene.stop('HUDScene');
            this.scene.start('CareerRouletteScene');
            return;
        }

        this.scene.launch('TimeAllocationScene');
        this.scene.pause('CollegeCampusScene');
    }

    processDayResults(activities) {
        let restToday = false;
        let socialToday = false;

        for (const activity of activities) {
            if (!activity) continue;

            if (activity.id === 'study') {
                this.hoursWorked += 4;
                this.scene.launch('StudyMiniGame');
                this.scene.pause('CollegeCampusScene');
                return;
            }

            if (activity.id.startsWith('socialize_')) {
                const charId = activity.id.replace('socialize_', '');
                this.relationshipManager.modifyConnection(charId, 8);
                this.hoursWithPeople += 4;
                socialToday = true;

                const npc = this.npcs[charId];
                if (npc?.dialogueKey) {
                    this.launchDialogue(npc.dialogueKey, charId);
                    return;
                }
            }

            if (activity.id === 'text_sam') {
                this.relationshipManager.modifyConnection('sam', 5);
                this.hoursWithPeople += 4;
                socialToday = true;
            }

            if (activity.id === 'text_family') {
                this.relationshipManager.modifyConnection('mom', 4);
                this.relationshipManager.modifyConnection('dad', 4);
                this.relationshipManager.modifyConnection('jordan', 3);
                this.hoursWithPeople += 4;
                socialToday = true;
            }

            if (activity.id === 'networking') {
                this.hoursWorked += 4;
                this.scene.launch('NetworkingMiniGame');
                this.scene.pause('CollegeCampusScene');
                return;
            }

            if (activity.id === 'internship_prep') {
                this.hoursWorked += 4;
                this.scene.launch('InternshipMiniGame');
                this.scene.pause('CollegeCampusScene');
                return;
            }

            if (activity.id === 'club') {
                this.statManager.modifyStat('network', 4);
                this.statManager.modifyStat('prestige', 3);
                this.hoursWorked += 4;
            }

            if (activity.id === 'rest') {
                this.statManager.modifyStat('burnout', -12);
                restToday = true;
            }
        }

        // Rest tracking
        if (restToday && !socialToday) {
            this.consecutiveRestDays++;
        } else {
            this.consecutiveRestDays = 0;
        }

        this.registry.set('consecutiveRestDays', this.consecutiveRestDays);
        this.registry.set('hoursWorked', this.hoursWorked);
        this.registry.set('hoursWithPeople', this.hoursWithPeople);

        // Burnout check
        if (this.statManager.getStat('burnout') > 70 && Math.random() < 0.45) {
            this.showBurnoutEvent();
            return;
        }

        this.endDay();
    }

    showBurnoutEvent() {
        const { width, height } = this.cameras.main;
        const events = [
            { title: '🫠 BURNOUT EVENT', text: 'You fell asleep in lecture. The professor noticed.\nHe\'s used to it. That\'s worse somehow.', effect: () => { this.statManager.modifyStat('gpa', -3); } },
            { title: '😤 BURNOUT EVENT', text: 'Priya asked if you wanted coffee and you said\n"I don\'t have TIME for coffee" like a person\nwho has lost the plot entirely.', effect: () => { this.relationshipManager.modifyConnection('priya', -8); } },
            { title: '💀 BURNOUT EVENT', text: 'You pulled an all-nighter. Your essay is 12 pages.\n8 of them are coherent. The other 4 may be\nin a language you invented at 4am.', effect: () => { this.statManager.modifyStat('gpa', 2); this.statManager.modifyStat('burnout', 5); } },
            { title: '📱 BURNOUT EVENT', text: 'Mom called. You watched it ring.\nYou texted "in class" at 11pm.\nShe knows you don\'t have class at 11pm.', effect: () => { this.relationshipManager.modifyConnection('mom', -12); } },
            { title: '🤖 BURNOUT EVENT', text: 'Morgan asked what you did today and you said\n"I optimized my workflow." Morgan stared at you\nfor 6 full seconds.', effect: () => { this.relationshipManager.modifyConnection('morgan', -5); this.statManager.modifyStat('authenticity', -5); } },
        ];

        const event = Phaser.Utils.Array.GetRandom(events);
        event.effect();

        const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.8).setDepth(50);
        const box = this.add.rectangle(width / 2, height / 2, 440, 180, 0x12121f).setDepth(51);
        this.add.rectangle(width / 2, height / 2, 438, 178, 0x000000, 0).setStrokeStyle(1, 0x2a2a4e).setDepth(51);

        const titleText = this.add.text(width / 2, height / 2 - 50, event.title, {
            fontFamily: '"Press Start 2P"', fontSize: '10px', color: '#FF6B6B',
        }).setOrigin(0.5).setDepth(52);

        const bodyText = this.add.text(width / 2, height / 2, event.text, {
            fontFamily: '"VT323", monospace', fontSize: '12px', color: '#a8a8c8', align: 'center', lineSpacing: 4,
        }).setOrigin(0.5).setDepth(52);

        this.time.delayedCall(1500, () => {
            const btn = this.add.text(width / 2, height / 2 + 65, '[ Okay ]', {
                fontFamily: '"Press Start 2P"', fontSize: '8px', color: '#6c63ff',
            }).setOrigin(0.5).setDepth(52).setInteractive({ useHandCursor: true });
            btn.on('pointerover', () => btn.setColor('#9a93ff'));
            btn.on('pointerout', () => btn.setColor('#6c63ff'));
            btn.on('pointerdown', () => {
                overlay.destroy(); box.destroy(); titleText.destroy(); bodyText.destroy(); btn.destroy();
                this.endDay();
            });
        });
    }

    launchDialogue(dialogueKey, characterId) {
        this.scene.launch('DialogueScene', { dialogueKey, characterId, parentSceneKey: 'CollegeCampusScene' });
        this.scene.pause('CollegeCampusScene');
    }

    endDay() {
        this.relationshipManager.applyDailyDecay(1);
        this.updateNPCVisuals();

        const result = this.timeManager.advanceDay();

        if (result === 'act_over') {
            this.time.delayedCall(500, () => {
                this.scene.stop('HUDScene');
                this.scene.start('CareerRouletteScene');
            });
        } else {
            this.time.delayedCall(300, () => this.startNewDay());
        }
    }

    updateNPCVisuals() {
        for (const [id, npc] of Object.entries(this.npcs)) {
            const opacity = this.relationshipManager.getPortraitOpacity(id);
            npc.sprite.setAlpha(opacity);
            npc.label.setAlpha(opacity);
            npc.indicator.setAlpha(opacity * 0.7);
        }
    }

    update() {
        if (!this.player || !this.player.body) return;
        const speed = 160;
        this.player.setVelocity(0);

        if (this.cursors.left.isDown || this.wasd.left.isDown) this.player.setVelocityX(-speed);
        else if (this.cursors.right.isDown || this.wasd.right.isDown) this.player.setVelocityX(speed);

        if (this.cursors.up.isDown || this.wasd.up.isDown) this.player.setVelocityY(-speed);
        else if (this.cursors.down.isDown || this.wasd.down.isDown) this.player.setVelocityY(speed);

        // NPC proximity check
        let nearNPC = null;
        let minDist = 60;
        for (const [id, npc] of Object.entries(this.npcs)) {
            const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, npc.sprite.x, npc.sprite.y);
            if (dist < minDist) { minDist = dist; nearNPC = npc; }
        }

        if (nearNPC) {
            this.promptText.setText(`[E] Talk to ${nearNPC.label.text}`).setAlpha(1);
            if (Phaser.Input.Keyboard.JustDown(this.interactKey) && nearNPC.dialogueKey) {
                this.launchDialogue(nearNPC.dialogueKey, nearNPC.id);
            }
        } else {
            this.promptText.setAlpha(0);
        }
    }
}
