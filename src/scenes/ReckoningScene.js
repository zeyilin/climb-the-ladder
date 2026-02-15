import Phaser from 'phaser';

/**
 * ReckoningScene — Act V Overworld.
 * Revisit key locations from earlier acts. Everything's smaller than you remember.
 * Warm golden tones, muted. No mini-games. Just walking and talking.
 */
export default class ReckoningScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ReckoningScene' });
    }

    init() {
        this.statManager = this.registry.get('statManager');
        this.timeManager = this.registry.get('timeManager');
        this.relationshipManager = this.registry.get('relationshipManager');
    }

    create() {
        const { width, height } = this.cameras.main;
        this.cameras.main.setBackgroundColor('#1a1508');
        this.cameras.main.fadeIn(1500);

        // Muted warm golden tones — Act I palette but faded
        for (let x = 0; x < width; x += 32) {
            for (let y = 0; y < height; y += 32) {
                const warmth = 0.3 + Math.random() * 0.15;
                const r = Math.floor(40 * warmth);
                const g = Math.floor(35 * warmth);
                const b = Math.floor(20 * warmth);
                this.add.rectangle(x + 16, y + 16, 32, 32,
                    Phaser.Display.Color.GetColor(r, g, b)
                ).setStrokeStyle(1, 0x1a1508);
            }
        }

        // Title card
        const titleBg = this.add.rectangle(width / 2, height / 2, 500, 120, 0x000000, 0.7);
        const title = this.add.text(width / 2, height / 2 - 25, 'ACT V — THE RECKONING', {
            fontFamily: '"Press Start 2P"', fontSize: '14px', color: '#d4a853',
        }).setOrigin(0.5).setAlpha(0);
        const subtitle = this.add.text(width / 2, height / 2 + 10, 'No more mini-games. The grind is over.', {
            fontFamily: '"VT323", monospace', fontSize: '12px', color: '#8a7a5a', fontStyle: 'italic',
        }).setOrigin(0.5).setAlpha(0);
        const sub2 = this.add.text(width / 2, height / 2 + 35, 'Now comes the harder part.', {
            fontFamily: '"VT323", monospace', fontSize: '11px', color: '#6a5a3a',
        }).setOrigin(0.5).setAlpha(0);

        this.tweens.add({ targets: title, alpha: 1, duration: 1500, delay: 500 });
        this.tweens.add({ targets: subtitle, alpha: 1, duration: 1500, delay: 1500 });
        this.tweens.add({ targets: sub2, alpha: 1, duration: 1000, delay: 2500 });

        // After title card, show locations
        this.time.delayedCall(5000, () => {
            titleBg.destroy();
            title.destroy();
            subtitle.destroy();
            sub2.destroy();
            this.buildLocationMap();
        });
    }

    buildLocationMap() {
        const { width, height } = this.cameras.main;

        const locations = [
            {
                label: '🏫 HIGH SCHOOL',
                x: 150, y: 120,
                color: 0x2a1a0a,
                flavor: 'Smaller than you remember.',
                scene: 'highschool',
            },
            {
                label: '🎓 COLLEGE',
                x: 600, y: 120,
                color: 0x1a2a1a,
                flavor: 'New buildings. Unfamiliar faces.',
                scene: 'college',
            },
            {
                label: '🏙️ FIRST APARTMENT',
                x: 150, y: 380,
                color: 0x1a1a2a,
                flavor: 'Someone else lives here now.',
                scene: 'apartment',
            },
            {
                label: '🏠 CHILDHOOD HOME',
                x: 600, y: 380,
                color: 0x2a2a0a,
                flavor: 'The porch light is on.',
                scene: 'home',
            },
        ];

        this.player = this.physics.add.sprite(width / 2, height / 2, 'player');
        this.player.setCollideWorldBounds(true);
        this.cursors = this.input.keyboard.createCursorKeys();

        for (const loc of locations) {
            const rect = this.add.rectangle(loc.x, loc.y, 140, 85, loc.color)
                .setStrokeStyle(2, 0x3a2a1a);
            this.add.text(loc.x, loc.y - 18, loc.label, {
                fontFamily: '"Press Start 2P"', fontSize: '7px', color: '#a89060',
            }).setOrigin(0.5);
            this.add.text(loc.x, loc.y + 12, loc.flavor, {
                fontFamily: '"VT323", monospace', fontSize: '9px', color: '#6a5a3a', fontStyle: 'italic',
            }).setOrigin(0.5);

            const zone = this.add.zone(loc.x, loc.y, 140, 85);
            this.physics.add.existing(zone, true);
            this.physics.add.overlap(this.player, zone, () => {
                if (Phaser.Input.Keyboard.JustDown(this.input.keyboard.addKey('E'))) {
                    this.visitLocation(loc.scene);
                }
            });
        }

        // Instruction
        this.add.text(width / 2, height - 25, 'Move with arrows. Press E to visit.', {
            fontFamily: '"VT323", monospace', fontSize: '9px', color: '#4a3a2a',
        }).setOrigin(0.5);

        // Track visits
        this.visited = new Set();

        // HUD
        if (!this.scene.isActive('HUDScene')) this.scene.launch('HUDScene');
    }

    visitLocation(locationId) {
        this.visited.add(locationId);

        // Record scrapbook moment
        const scrapbook = this.registry.get('scrapbook') || [];
        const flavors = {
            highschool: 'You walked the hallways. Your locker was repainted. Someone else\'s name is on it.',
            college: 'The quad has a new statue. Your bench is still there. The tree is bigger.',
            apartment: 'The buzzer list has new names. Your window is someone else\'s now.',
            home: 'The door is the same color. Mom\'s tulips are still in the garden.',
        };
        scrapbook.push({
            location: locationId,
            text: flavors[locationId] || 'You were here once.',
            visited: true,
        });
        this.registry.set('scrapbook', scrapbook);

        // Launch reconciliation attempt
        this.scene.pause();
        this.scene.launch('ReconciliationScene', { location: locationId });

        // If all 4 visited, trigger scrapbook
        if (this.visited.size >= 4) {
            this.events.once('resume', () => {
                this.time.delayedCall(1000, () => {
                    this.scene.start('ScrapbookScene');
                });
            });
        }
    }

    update() {
        if (!this.player || !this.cursors) return;
        const speed = 140;
        this.player.setVelocity(0);
        if (this.cursors.left.isDown) this.player.setVelocityX(-speed);
        else if (this.cursors.right.isDown) this.player.setVelocityX(speed);
        if (this.cursors.up.isDown) this.player.setVelocityY(-speed);
        else if (this.cursors.down.isDown) this.player.setVelocityY(speed);
    }
}
