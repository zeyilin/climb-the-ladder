import BaseScene from '../scenes/BaseScene.js';
import Theme from './Theme.js';

/**
 * HUDScene — Persistent overlay.
 * "Corporate Cyber-Retro" Style.
 */
export default class HUDScene extends BaseScene {
    constructor() {
        super({ key: 'HUDScene' });
    }

    init() {
        this.statManager = this.registry.get('statManager');
        this.timeManager = this.registry.get('timeManager');
        this.relationshipManager = this.registry.get('relationshipManager');
    }

    create() {
        // --- Background ---
        this.bg = this.add.graphics();
        this.border = this.add.graphics();

        // --- Date Display (Far Left) ---
        this.weekLabel = this.add.text(0, 0, '', {
            ...Theme.STYLES.HEADER_SM,
            color: '#8888aa',
        }).setDepth(101);

        this.dayDisplay = this.add.text(0, 0, '', {
            ...Theme.STYLES.BODY_LG,
            color: '#ffffff',
            shadow: { offsetX: 2, offsetY: 2, color: '#000000', fill: true }
        }).setDepth(101);

        // --- Career Progress ---
        this.careerLabel = this.add.text(0, 0, 'CAREER LADDER', {
            ...Theme.STYLES.HEADER_SM,
            color: Theme.toHex(Theme.COLORS.NEON_CYAN),
        }).setOrigin(0, 0.5).setDepth(101);

        this.progBg = this.add.graphics().setDepth(101);
        this.progressFill = this.add.graphics().setDepth(102);

        // --- Stat Bars (Center/Right) ---
        this.statDisplays = {};
        this.createStatObjects('gpa', 'GPA', '📚', Theme.COLORS.NEON_CYAN);
        this.createStatObjects('network', 'NETWORK', '🤝', Theme.COLORS.NEON_YELLOW);
        this.createStatObjects('authenticity', 'SELF', '🎭', Theme.COLORS.NEON_GREEN);
        this.createStatObjects('burnout', 'BURNOUT', '🔥', Theme.COLORS.DANGER);

        // --- Relationship Toggle (Far Right) ---
        this.btnContainer = this.add.container(0, 42);

        const btnBg = this.add.graphics();
        this.btnBg = btnBg;
        this.drawTabButton(btnBg, Theme.COLORS.MUTED);

        const btnIcon = this.add.text(-80, 0, 'TAB', {
            ...Theme.STYLES.HEADER_SM,
            color: '#ffffff',
            backgroundColor: '#333',
            padding: { x: 4, y: 4 },
            align: 'center'
        }).setOrigin(0.5);

        const btnText = this.add.text(10, 0, 'CONTACTS', {
            ...Theme.STYLES.HEADER_SM,
            fontSize: '12px',
            color: '#aaa',
        }).setOrigin(0.5);

        this.btnContainer.add([btnBg, btnIcon, btnText]);
        this.btnContainer.setDepth(101);

        this.tweens.add({
            targets: btnIcon,
            alpha: 0.7,
            duration: 800,
            yoyo: true,
            repeat: -1
        });

        this.btnContainer.setInteractive(new Phaser.Geom.Rectangle(-100, -18, 200, 36), Phaser.Geom.Rectangle.Contains);
        this.btnContainer.on('pointerdown', () => {
            if (this.scene.isActive('RelationshipPanelScene')) {
                this.scene.stop('RelationshipPanelScene');
            } else {
                this.scene.launch('RelationshipPanelScene');
            }
        });

        this.btnContainer.on('pointerover', () => {
            document.body.style.cursor = 'pointer';
            this.drawTabButton(this.btnBg, 0xffffff);
        });

        this.btnContainer.on('pointerout', () => {
            document.body.style.cursor = 'default';
            this.drawTabButton(this.btnBg, Theme.COLORS.MUTED);
        });

        // --- Listeners ---
        this.input.keyboard.on('keydown-TAB', () => {
            if (this.scene.isActive('RelationshipPanelScene')) {
                this.scene.stop('RelationshipPanelScene');
            } else {
                this.scene.launch('RelationshipPanelScene');
            }
        });

        this.input.keyboard.on('keydown', (event) => {
            if (event.key === '?') {
                if (this.scene.isActive('InstructionsScene')) {
                    this.scene.stop('InstructionsScene');
                } else {
                    this.scene.launch('InstructionsScene');
                }
            }
        });

        // --- Resize + lifecycle ---
        this.registerResizeHandler(this.handleResize);
        this.initBaseScene();

        this.updateHUD();
    }

    drawTabButton(gfx, color, width = 200) {
        const halfW = width / 2;
        gfx.clear();
        gfx.lineStyle(2, color, 1);
        gfx.strokeRoundedRect(-halfW, -18, width, 36, 4);
        gfx.fillStyle(0x000000, 0.5);
        gfx.fillRoundedRect(-halfW, -18, width, 36, 4);
    }

    createStatObjects(key, labelName, icon, color) {
        const iconText = this.add.text(0, 0, icon, {
            fontSize: '14px',
        }).setOrigin(0.5);

        const labelText = this.add.text(0, 0, labelName, {
            ...Theme.STYLES.HEADER_SM,
            fontSize: '8px',
            color: '#8888aa',
        }).setOrigin(0, 0.5);

        const valueText = this.add.text(0, 0, '0', {
            ...Theme.STYLES.BODY_MD,
            fontSize: '20px',
            color: '#ffffff',
        }).setOrigin(1, 0.5);

        const barBg = this.add.graphics();
        const barFill = this.add.graphics();

        this.statDisplays[key] = {
            iconText, labelText, valueText, barBg, barFill, color,
        };
    }

    handleResize(gameSize) {
        if (!gameSize || gameSize.width <= 0 || gameSize.height <= 0) return;
        const width = gameSize.width;
        const height = gameSize.height;
        const barHeight = 84;

        this.cameras.main.setViewport(0, 0, width, height);

        this.bg.clear();
        this.bg.fillStyle(Theme.COLORS.BG_PANEL, 0.95);
        this.bg.fillRect(0, 0, width, barHeight);

        this.border.clear();
        this.border.fillStyle(Theme.COLORS.CORP_BLUE, 1);
        this.border.fillRect(0, barHeight, width, 2);

        const isMobile = width < 600;
        const ex = isMobile ? 10 : 40;
        this.weekLabel.setPosition(ex, 24);
        this.dayDisplay.setPosition(ex, 42);

        if (isMobile) {
            this.weekLabel.setFontSize('10px');
            this.dayDisplay.setFontSize('24px');
        } else {
            this.weekLabel.setFontSize('12px');
            this.dayDisplay.setFontSize('32px');
        }

        this.careerLabel.setVisible(!isMobile);
        this.progBg.setVisible(!isMobile);
        this.progressFill.setVisible(!isMobile);
        this.border.setVisible(true);

        const careerX = ex + 180;
        this.careerLabel.setPosition(careerX, 28);

        const progBarX = careerX;
        const progBarY = 44;
        const progBarW = 200;
        const progBarH = 12;

        this.progBg.clear();
        this.progBg.fillStyle(0x000000, 1);
        this.progBg.fillRect(progBarX, progBarY, progBarW, progBarH);
        this.progBg.lineStyle(2, 0x333333);
        this.progBg.strokeRect(progBarX, progBarY, progBarW, progBarH);

        this.progBarX = progBarX;
        this.progBarY = progBarY;
        this.progBarW = progBarW;
        this.progBarH = progBarH;

        // Tab Button
        const btnW = isMobile ? 60 : 200;
        const btnRightMargin = isMobile ? 40 : 130;
        this.btnContainer.setPosition(width - btnRightMargin, 42);

        this.drawTabButton(this.btnBg, Theme.COLORS.MUTED, btnW);
        this.btnContainer.input.hitArea.setTo(-btnW / 2, -18, btnW, 36);

        const btnIcon = this.btnContainer.list[1];
        const btnText = this.btnContainer.list[2];

        if (isMobile) {
            btnIcon.setPosition(0, 0);
            btnText.setVisible(false);
        } else {
            btnIcon.setPosition(-80, 0);
            btnText.setVisible(true);
            btnText.setPosition(10, 0);
        }

        // Stats
        const centerStart = isMobile ? (ex + 60) : (progBarX + progBarW + 40);
        const centerEnd = width - (btnRightMargin + btnW / 2 + (isMobile ? 10 : 40));
        const availableW = Math.max(0, centerEnd - centerStart);

        const count = 4;
        const slotW = availableW / count;
        const keys = ['gpa', 'network', 'authenticity', 'burnout'];

        keys.forEach((key, i) => {
            const display = this.statDisplays[key];
            const centerX = centerStart + (slotW * i) + (slotW / 2);
            const y = 42;

            const maxBarW = isMobile ? 30 : 80;
            const barW = Math.min(maxBarW, Math.max(10, slotW - (isMobile ? 2 : 20)));
            const barLeft = centerX - barW / 2;
            const barY = y + 8;

            if (isMobile) {
                display.labelText.setVisible(false);
                display.iconText.setVisible(true);
                display.iconText.setPosition(barLeft, y - 10);
                display.iconText.setOrigin(0, 0.5);
                display.iconText.setFontSize('12px');
                display.valueText.setPosition(barLeft + barW, y - 10);
                display.valueText.setFontSize('12px');
            } else {
                display.labelText.setVisible(true);
                display.iconText.setVisible(false);
                display.labelText.setPosition(barLeft, y - 12);
                display.labelText.setFontSize('8px');
                display.valueText.setPosition(barLeft + barW, y - 12);
                display.valueText.setFontSize('20px');
            }

            display.barBg.clear();
            display.barBg.fillStyle(0x000000, 1);
            display.barBg.fillRect(barLeft, barY, barW, 8);
            display.barBg.lineStyle(2, 0x333333);
            display.barBg.strokeRect(barLeft, barY, barW, 8);

            display.barX = barLeft;
            display.barY = barY;
            display.barW = barW;
            display.barH = 8;
        });

        this.updateHUD();
    }

    updateHUD() {
        if (!this.timeManager) return;

        this.weekLabel.setText(this.timeManager.getWeekDisplay().toUpperCase());
        this.dayDisplay.setText(this.timeManager.getDayDisplay());

        const prog = this.timeManager.getProgress();
        if (this.progBarW) {
            const fillW = this.progBarW * Math.min(1, prog);
            this.progressFill.clear();
            this.progressFill.fillStyle(Theme.COLORS.NEON_CYAN, 1);
            this.progressFill.fillRect(this.progBarX, this.progBarY, fillW, 12);
        }

        for (const [key, display] of Object.entries(this.statDisplays)) {
            const val = this.statManager.getStat(key);
            display.valueText.setText(`${val}`);

            if (display.barW) {
                const fillW = (val / 100) * display.barW;
                display.barFill.clear();
                display.barFill.fillStyle(display.color, 1);
                display.barFill.fillRect(display.barX, display.barY, fillW, display.barH);
            }
        }
    }

    update() {
        this.updateHUD();
    }
}
