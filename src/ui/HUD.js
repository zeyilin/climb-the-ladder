import Phaser from 'phaser';

/**
 * HUDScene — Persistent overlay showing day, stats, and progress.
 */
export default class HUDScene extends Phaser.Scene {
    constructor() {
        super({ key: 'HUDScene' });
    }

    init() {
        this.statManager = this.registry.get('statManager');
        this.timeManager = this.registry.get('timeManager');
        this.relationshipManager = this.registry.get('relationshipManager');
    }

    create() {
        const { width } = this.cameras.main;

        // Top bar background
        this.add.rectangle(width / 2, 0, width, 50, 0x0a0a0f, 0.9).setOrigin(0.5, 0).setDepth(100);
        this.add.rectangle(width / 2, 50, width, 1, 0x1a1a2e).setDepth(100);

        // Day/Week display
        this.weekText = this.add.text(15, 8, '', {
            fontFamily: '"Press Start 2P"',
            fontSize: '8px',
            color: '#6c63ff',
        }).setDepth(101);

        this.dayText = this.add.text(15, 24, '', {
            fontFamily: '"Press Start 2P"',
            fontSize: '7px',
            color: '#5a5a7a',
        }).setDepth(101);

        // Progress bar
        const progBarX = 15;
        const progBarY = 40;
        const progBarW = 100;
        this.add.rectangle(progBarX + progBarW / 2, progBarY, progBarW, 4, 0x1a1a2e).setDepth(101);
        this.progressFill = this.add.rectangle(progBarX, progBarY, 0, 4, 0x6c63ff)
            .setOrigin(0, 0.5).setDepth(101);

        // Stat bars
        const statsX = 180;
        this.statDisplays = {};

        this.createStatBar('gpa', '📚', statsX, 10, '#6c63ff');
        this.createStatBar('network', '🤝', statsX + 130, 10, '#FFD93D');
        this.createStatBar('authenticity', '🎭', statsX + 260, 10, '#98D8AA');
        this.createStatBar('burnout', '🔥', statsX + 390, 10, '#FF6B6B');

        // Relationship hint
        this.relHint = this.add.text(width - 15, 35, 'TAB: Relationships', {
            fontFamily: 'Inter',
            fontSize: '9px',
            color: '#3a3a5a',
        }).setOrigin(1, 0.5).setDepth(101);

        this.updateHUD();
    }

    createStatBar(key, icon, x, y, color) {
        const label = this.add.text(x, y, `${icon}`, {
            fontSize: '12px',
        }).setDepth(101);

        const nameText = this.add.text(x + 18, y, key.toUpperCase(), {
            fontFamily: '"Press Start 2P"',
            fontSize: '6px',
            color: '#5a5a7a',
        }).setOrigin(0, 0.5).setDepth(101);

        const barW = 60;
        const barH = 6;
        const barY = y + 14;

        this.add.rectangle(x + 18 + barW / 2, barY, barW, barH, 0x1a1a2e).setDepth(101);
        const fill = this.add.rectangle(x + 18, barY, 0, barH, Phaser.Display.Color.HexStringToColor(color).color)
            .setOrigin(0, 0.5).setDepth(101);

        const valueText = this.add.text(x + 18 + barW + 5, barY, '0', {
            fontFamily: 'Inter',
            fontSize: '9px',
            color: '#6a6a8a',
        }).setOrigin(0, 0.5).setDepth(101);

        this.statDisplays[key] = { fill, valueText, barW };
    }

    updateHUD() {
        // Time
        this.weekText.setText(this.timeManager.getWeekDisplay());
        this.dayText.setText(this.timeManager.getDayDisplay());

        // Progress
        const prog = this.timeManager.getProgress();
        this.progressFill.width = 100 * Math.min(1, prog);

        // Stats
        for (const [key, display] of Object.entries(this.statDisplays)) {
            const val = this.statManager.getStat(key);
            display.fill.width = (val / 100) * display.barW;
            display.valueText.setText(`${val}`);
        }
    }

    update() {
        this.updateHUD();
    }
}
