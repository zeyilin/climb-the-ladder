import Phaser from 'phaser';

/**
 * HighSchoolScene — Top-down exploration of the school environment.
 * Walk around, interact with NPCs and locations. HUD overlay shows stats.
 */
export default class HighSchoolScene extends Phaser.Scene {
    constructor() {
        super({ key: 'HighSchoolScene' });
    }

    init() {
        // Access shared systems from registry
        this.statManager = this.registry.get('statManager');
        this.relationshipManager = this.registry.get('relationshipManager');
        this.timeManager = this.registry.get('timeManager');
        this.dialogueSystem = this.registry.get('dialogueSystem');
        this.consecutiveRestDays = this.registry.get('consecutiveRestDays') || 0;
        this.hoursWorked = this.registry.get('hoursWorked') || 0;
        this.hoursWithPeople = this.registry.get('hoursWithPeople') || 0;
    }

    create() {
        const { width, height } = this.cameras.main;
        this.cameras.main.setBackgroundColor('#0f0f1a');
        this.cameras.main.fadeIn(500);

        // --- BUILD THE MAP ---
        this.buildMap();

        // --- PLAYER ---
        this.player = this.physics.add.sprite(width / 2, height / 2, 'player');
        this.player.setCollideWorldBounds(true);
        this.player.setDepth(10);

        // --- NPCs ---
        this.npcs = {};
        this.createNPC('mom', 'npc_mom', 150, 400, 'dialogue_mom');
        this.createNPC('dad', 'npc_dad', 200, 400, 'dialogue_dad');
        this.createNPC('jordan', 'npc_jordan', 550, 350, 'dialogue_jordan');
        this.createNPC('sam', 'npc_sam', 600, 200, 'dialogue_sam');

        // --- INTERACTION ZONES ---
        this.interactionZones = [];
        this.createZone('School', 400, 120, 80, 60, 0x3a2a2a, '🏫');
        this.createZone('Bedroom', 100, 120, 60, 60, 0x2a2a4e, '🛏️');
        this.createZone('Park', 650, 400, 80, 60, 0x1a3a1a, '🌳');

        // --- CONTROLS ---
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
        });
        this.interactKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
        this.tabKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TAB);

        // --- HUD ---
        this.scene.launch('HUDScene');

        // --- INTERACTION PROMPT ---
        this.promptText = this.add.text(width / 2, height - 40, '', {
            fontFamily: '"Press Start 2P"',
            fontSize: '8px',
            color: '#ffd93d',
            align: 'center',
        }).setOrigin(0.5).setDepth(20).setAlpha(0);

        // --- DAY START: Launch time allocation ---
        this.startNewDay();

        // --- Tab for relationship panel ---
        this.tabKey.on('down', () => {
            if (this.scene.isActive('RelationshipPanelScene')) {
                this.scene.stop('RelationshipPanelScene');
            } else {
                this.scene.launch('RelationshipPanelScene');
            }
        });

        // --- INSTRUCTIONS ---
        this.instructionText = this.add.text(width / 2, 20, 'WASD to move • E to interact • TAB for relationships', {
            fontFamily: 'Inter',
            fontSize: '10px',
            color: '#4a4a6a',
        }).setOrigin(0.5).setDepth(20);

        this.tweens.add({
            targets: this.instructionText,
            alpha: 0,
            delay: 5000,
            duration: 1000,
        });
    }

    buildMap() {
        const { width, height } = this.cameras.main;

        // Simple floor
        const gfx = this.add.graphics();

        // Ground
        gfx.fillStyle(0x151520);
        gfx.fillRect(0, 0, width, height);

        // Paths
        gfx.fillStyle(0x222235);
        gfx.fillRect(width / 2 - 20, 0, 40, height); // vertical path
        gfx.fillRect(0, height / 2 - 20, width, 40); // horizontal path

        // School building
        gfx.fillStyle(0x3a2a2a);
        gfx.fillRect(360, 80, 80, 60);
        this.add.text(400, 78, '🏫', { fontSize: '20px' }).setOrigin(0.5);
        this.add.text(400, 150, 'School', {
            fontFamily: '"Press Start 2P"', fontSize: '7px', color: '#6a5a5a'
        }).setOrigin(0.5);

        // House (bedroom)
        gfx.fillStyle(0x2a2a4e);
        gfx.fillRect(70, 80, 70, 60);
        this.add.text(105, 78, '🏠', { fontSize: '20px' }).setOrigin(0.5);
        this.add.text(105, 150, 'Home', {
            fontFamily: '"Press Start 2P"', fontSize: '7px', color: '#5a5a8a'
        }).setOrigin(0.5);

        // Park
        gfx.fillStyle(0x1a3a1a);
        gfx.fillRect(610, 370, 100, 70);
        this.add.text(660, 368, '🌳', { fontSize: '20px' }).setOrigin(0.5);
        this.add.text(660, 448, 'Park', {
            fontFamily: '"Press Start 2P"', fontSize: '7px', color: '#4a7a4a'
        }).setOrigin(0.5);

        // Decorative elements
        gfx.fillStyle(0x1a1a30);
        for (let i = 0; i < 8; i++) {
            const x = Phaser.Math.Between(50, width - 50);
            const y = Phaser.Math.Between(200, height - 100);
            gfx.fillCircle(x, y, Phaser.Math.Between(3, 6));
        }
    }

    createNPC(id, spriteKey, x, y, dialogueKey) {
        const npc = this.physics.add.sprite(x, y, spriteKey);
        npc.setImmovable(true);
        npc.setDepth(9);

        // Name label
        const rel = this.relationshipManager.getRelationship(id);
        const name = rel?.name || id;
        const label = this.add.text(x, y - 22, name, {
            fontFamily: '"Press Start 2P"',
            fontSize: '6px',
            color: '#aaaacc',
        }).setOrigin(0.5).setDepth(11);

        // Interaction indicator (bouncing dot above)
        const indicator = this.add.sprite(x, y - 30, 'indicator').setDepth(11).setAlpha(0.7);
        this.tweens.add({
            targets: indicator,
            y: y - 36,
            duration: 600,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });

        // Set opacity based on relationship
        const opacity = this.relationshipManager.getPortraitOpacity(id);
        npc.setAlpha(opacity);
        label.setAlpha(opacity);
        indicator.setAlpha(opacity * 0.7);

        this.npcs[id] = { sprite: npc, label, indicator, dialogueKey, id };

        // Collision with player
        this.physics.add.collider(this.player, npc);
    }

    createZone(name, x, y, w, h, color, emoji) {
        this.interactionZones.push({ name, x, y, w, h, emoji });
    }

    startNewDay() {
        if (this.timeManager.isGameOver) {
            // Semester over — college reveal!
            this.scene.stop('HUDScene');
            this.scene.start('CollegeRevealScene');
            return;
        }

        // Launch time allocation overlay
        this.scene.launch('TimeAllocationScene');
        this.scene.pause('HighSchoolScene');
    }

    processDayResults(activities) {
        // Track hours for the end-of-game counter
        let restToday = false;
        let socialToday = false;

        // Process each activity
        for (const activity of activities) {
            if (!activity) continue;

            if (activity.id === 'study') {
                this.hoursWorked += 3;
                // Launch study mini-game
                this.scene.launch('StudyMiniGame');
                this.scene.pause('HighSchoolScene');
                return; // will resume after mini-game
            }

            if (activity.id.startsWith('socialize_')) {
                const charId = activity.id.replace('socialize_', '');
                this.relationshipManager.modifyConnection(charId, 8);
                this.hoursWithPeople += 3;
                socialToday = true;

                // Trigger dialogue if available
                const npc = this.npcs[charId];
                if (npc?.dialogueKey) {
                    this.launchDialogue(npc.dialogueKey, charId);
                    return; // will resume after dialogue
                }
            }

            if (activity.id === 'extracurricular') {
                this.statManager.modifyStat('network', 5);
                this.statManager.modifyStat('prestige', 3);
                this.hoursWorked += 3;
            }

            if (activity.id === 'rest') {
                this.statManager.modifyStat('burnout', -10);
                restToday = true;
            }
        }

        // Track consecutive rest days for guilt popup
        if (restToday && !socialToday) {
            this.consecutiveRestDays++;
        } else {
            this.consecutiveRestDays = 0;
        }

        // Persist counters
        this.registry.set('consecutiveRestDays', this.consecutiveRestDays);
        this.registry.set('hoursWorked', this.hoursWorked);
        this.registry.set('hoursWithPeople', this.hoursWithPeople);

        // Rest guilt popup
        if (this.consecutiveRestDays >= 3) {
            this.showPopup(
                '😰 Are you sure?',
                'Derek from school just got Student of the Month.\nDerek also has an ulcer, but the game doesn\'t mention that.',
                '#ffd93d'
            );
            this.consecutiveRestDays = 0;
            return; // endDay called after popup
        }

        // Burnout event check
        if (this.statManager.getStat('burnout') > 70) {
            this.checkBurnoutEvent();
            return;
        }

        this.endDay();
    }

    checkBurnoutEvent() {
        const burnoutEvents = [
            { title: '🫠 BURNOUT EVENT', text: 'You snapped at Mom over dinner because she asked\nhow school was. She was just asking how school was.', effect: () => { this.relationshipManager.modifyConnection('mom', -8); } },
            { title: '😰 BURNOUT EVENT', text: 'You fell asleep at your desk and drooled on your\ncalc notes. The integral is now illegible.\nIt was probably fine.', effect: () => { this.statManager.modifyStat('gpa', -3); } },
            { title: '😤 BURNOUT EVENT', text: 'Sam texted "wanna hang?" and you replied\n"I literally cannot" with such intensity\nthat Sam hasn\'t texted since.', effect: () => { this.relationshipManager.modifyConnection('sam', -10); } },
            { title: '💀 BURNOUT EVENT', text: 'You cried in the school bathroom for 12 minutes.\nYou then went to debate practice and won.\nThis is not a healthy coping mechanism.', effect: () => { this.statManager.modifyStat('burnout', -15); this.statManager.modifyStat('authenticity', -5); } },
            { title: '🤖 BURNOUT EVENT', text: 'Someone asked how you are. You said "productive."\nThat is not a feeling. You said it like it was.', effect: () => { this.statManager.modifyStat('authenticity', -5); } },
        ];

        // 40% chance of a burnout event firing
        if (Math.random() < 0.4) {
            const event = Phaser.Utils.Array.GetRandom(burnoutEvents);
            event.effect();
            this.showPopup(event.title, event.text, '#FF6B6B');
        } else {
            this.endDay();
        }
    }

    showPopup(title, text, color) {
        const { width, height } = this.cameras.main;

        const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.8).setDepth(50);
        const box = this.add.rectangle(width / 2, height / 2, 440, 180, 0x12121f).setDepth(51);
        this.add.rectangle(width / 2, height / 2, 438, 178, 0x000000, 0).setStrokeStyle(1, 0x2a2a4e).setDepth(51);

        const titleText = this.add.text(width / 2, height / 2 - 50, title, {
            fontFamily: '"Press Start 2P"', fontSize: '10px', color,
        }).setOrigin(0.5).setDepth(52);

        const bodyText = this.add.text(width / 2, height / 2, text, {
            fontFamily: 'Inter', fontSize: '12px', color: '#a8a8c8',
            align: 'center', lineSpacing: 4,
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
        this.scene.launch('DialogueScene', { dialogueKey, characterId });
        this.scene.pause('HighSchoolScene');
    }

    endDay() {
        // Apply daily relationship decay
        const events = this.relationshipManager.applyDailyDecay(1);

        // Update NPC visuals
        this.updateNPCVisuals();

        // Advance time
        const gameOver = this.timeManager.advanceDay();

        if (gameOver) {
            this.time.delayedCall(500, () => {
                this.scene.stop('HUDScene');
                this.scene.start('CollegeRevealScene');
            });
        } else {
            // Start next day
            this.time.delayedCall(300, () => {
                this.startNewDay();
            });
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

        // Movement
        if (this.cursors.left.isDown || this.wasd.left.isDown) {
            this.player.setVelocityX(-speed);
        } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
            this.player.setVelocityX(speed);
        }

        if (this.cursors.up.isDown || this.wasd.up.isDown) {
            this.player.setVelocityY(-speed);
        } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
            this.player.setVelocityY(speed);
        }

        // Check proximity to NPCs for interaction prompt
        let nearNPC = null;
        let minDist = 60;

        for (const [id, npc] of Object.entries(this.npcs)) {
            const dist = Phaser.Math.Distance.Between(
                this.player.x, this.player.y,
                npc.sprite.x, npc.sprite.y
            );
            if (dist < minDist) {
                minDist = dist;
                nearNPC = npc;
            }
        }

        if (nearNPC) {
            this.promptText.setText(`[E] Talk to ${nearNPC.label.text}`);
            this.promptText.setAlpha(1);

            if (Phaser.Input.Keyboard.JustDown(this.interactKey) && nearNPC.dialogueKey) {
                this.launchDialogue(nearNPC.dialogueKey, nearNPC.id);
            }
        } else {
            this.promptText.setAlpha(0);
        }
    }
}
