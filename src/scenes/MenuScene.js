import Phaser from 'phaser';
import Theme from '../ui/Theme.js';

/**
 * MenuScene — Title screen.
 * "Corporate Cyber-Retro" Style.
 */
export default class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    create() {
        const { width, height } = this.cameras.main;

        // --- Stop any zombie scenes from a previous game ---
        const zombieScenes = ['HUDScene', 'RelationshipPanelScene', 'ResumeViewScene', 'InstructionsScene'];
        zombieScenes.forEach(key => {
            if (this.scene.isActive(key) || this.scene.isPaused(key)) {
                this.scene.stop(key);
            }
        });

        // --- Background ---
        this.cameras.main.setBackgroundColor(Theme.COLORS.BG_DARK);

        // Container for all menu elements
        this.menuContainer = this.add.container(0, 0);

        // Grid Background
        this.gridGraphics = this.add.graphics();
        this.menuContainer.add(this.gridGraphics);

        // --- Animated Ladder (Abstract) ---
        // Two rails going up
        this.ladderContainer = this.add.container(0, 0);
        this.menuContainer.add(this.ladderContainer);

        // Rails
        this.rails = this.add.graphics();
        this.ladderContainer.add(this.rails);

        // Moving Rungs
        this.rungs = [];
        for (let i = 0; i < 20; i++) {
            const rung = this.add.rectangle(0, 0, 1, 8, Theme.COLORS.MUTED, 0.3);
            this.rungs.push(rung);
            this.ladderContainer.add(rung);
        }

        // --- Title ---
        const titleText = 'CLIMB THE\nLADDER';

        // Glitch Shadow (Red/Cyan offset)
        this.titleShadow1 = this.add.text(0, 0, titleText, {
            ...Theme.STYLES.HEADER_LG,
            fontSize: '64px',
            color: Theme.toHex(Theme.COLORS.NEON_PINK),
            align: 'center',
        }).setOrigin(0.5).setAlpha(0.7).setBlendMode(Phaser.BlendModes.ADD);

        this.titleShadow2 = this.add.text(0, 0, titleText, {
            ...Theme.STYLES.HEADER_LG,
            fontSize: '64px',
            color: Theme.toHex(Theme.COLORS.NEON_CYAN),
            align: 'center',
        }).setOrigin(0.5).setAlpha(0.7).setBlendMode(Phaser.BlendModes.ADD);

        // Main Title
        this.titleMain = this.add.text(0, 0, titleText, {
            ...Theme.STYLES.HEADER_LG,
            fontSize: '64px',
            align: 'center',
            shadow: { offsetX: 4, offsetY: 4, color: '#000', fill: true }
        }).setOrigin(0.5);

        this.menuContainer.add([this.titleShadow1, this.titleShadow2, this.titleMain]);

        // --- Tagline ---
        const taglines = [
            '"Because your parents didn\'t sacrifice everything\nfor you to have work-life balance."',
            '"LinkedIn is just Instagram for people\nwho peaked in college."',
            '"Your worth is not defined by your job title.\nHaha, just kidding. It totally is."',
            '"A game about climbing a ladder\nthat\'s leaning against the wrong wall."',
            '"Alexa, play Everybody Wants to Rule the World\nbut make it ironic."',
        ];
        const tagline = Phaser.Math.RND.pick(taglines);

        this.taglineText = this.add.text(0, 0, tagline, {
            fontFamily: '"VT323", monospace',
            fontSize: '24px',
            color: Theme.toHex(Theme.COLORS.NEON_YELLOW), // Accent color
            align: 'center',
        }).setOrigin(0.5);
        this.menuContainer.add(this.taglineText);

        // --- New Game / Continue Button ---
        this.btnContainer = this.add.container(0, 0);
        this.menuContainer.add(this.btnContainer);

        const persistence = this.registry.get('persistenceManager');
        const hasSave = localStorage.getItem('climbtheladder_save_v1'); // Check directly for speed/existence

        const btnLabel = hasSave ? 'RESUME CAREER' : 'INITIALIZE CAREER';

        // Create text FIRST to measure it
        this.btnText = this.add.text(0, 0, btnLabel, {
            ...Theme.STYLES.HEADER_MD,
            color: '#ffffff',
        }).setOrigin(0.5);

        // Button BG
        this.btnBg = this.add.graphics();
        // Initial draw in resize

        this.btnContainer.add([this.btnBg, this.btnText]);

        // Interaction
        this.btnContainer.setInteractive(new Phaser.Geom.Rectangle(0, 0, 1, 1), Phaser.Geom.Rectangle.Contains);

        this.btnContainer.on('pointerover', () => {
            const w = this.btnBg.width;
            const h = this.btnBg.height;
            this.drawButton(this.btnBg, w, h, Theme.COLORS.NEON_CYAN);
            this.btnText.setColor('#000000'); // Invert text on hover
            document.body.style.cursor = 'pointer';

            // Pulse
            this.tweens.add({
                targets: this.btnContainer,
                scaleX: this.btnContainer.baseScale * 1.05,
                scaleY: this.btnContainer.baseScale * 1.05,
                duration: 100,
                yoyo: true
            });
        });

        this.btnContainer.on('pointerout', () => {
            const w = this.btnBg.width;
            const h = this.btnBg.height;
            this.drawButton(this.btnBg, w, h, Theme.COLORS.CORP_BLUE);
            this.btnText.setColor('#ffffff');
            document.body.style.cursor = 'default';
        });

        this.btnContainer.on('pointerdown', () => {
            if (hasSave) {
                persistence.load();
            }

            this.cameras.main.fadeOut(800, 0, 0, 0);
            this.time.delayedCall(800, () => {
                // Determine start scene based on Act? For now default to HighSchool or assume TimeAllocation flow handles it?
                // Actually persistence load sets the timeManager state. 
                // We should jump to the relevant scene.
                // Simple logic: Go to TimeAllocationScene directly if mid-game, or HighSchool if new.
                // For simplicity, let's go to TimeAllocationScene which reads from TimeManager.
                // BUT if it's new game, we usually go HighSchoolScene -> TimeAllocation.

                if (hasSave) {
                    this.scene.start('TimeAllocationScene');
                } else {
                    this.scene.start('HighSchoolScene');
                }
            });
        });

        // --- HOW TO PLAY Button ---
        this.howToPlayText = this.add.text(0, 0, '[ HOW TO PLAY ]', {
            fontFamily: Theme.FONTS.HEADER,
            fontSize: '12px',
            color: Theme.toHex(Theme.COLORS.MUTED),
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        this.howToPlayText.on('pointerover', () => {
            this.howToPlayText.setColor(Theme.toHex(Theme.COLORS.NEON_CYAN));
        });
        this.howToPlayText.on('pointerout', () => {
            this.howToPlayText.setColor(Theme.toHex(Theme.COLORS.MUTED));
        });
        this.howToPlayText.on('pointerdown', () => {
            this.scene.launch('InstructionsScene');
        });
        this.menuContainer.add(this.howToPlayText);

        // --- NEW GAME Button (only when save exists) ---
        this.newGameText = this.add.text(0, 0, '[ NEW GAME ]', {
            fontFamily: Theme.FONTS.HEADER,
            fontSize: '10px',
            color: Theme.toHex(Theme.COLORS.MUTED),
        }).setOrigin(0.5).setVisible(!!hasSave);

        if (hasSave) {
            this.newGameText.setInteractive({ useHandCursor: true });
            this.newGameText.on('pointerover', () => {
                this.newGameText.setColor(Theme.toHex(Theme.COLORS.DANGER));
            });
            this.newGameText.on('pointerout', () => {
                this.newGameText.setColor(Theme.toHex(Theme.COLORS.MUTED));
            });
            this.newGameText.on('pointerdown', () => {
                this.showNewGameConfirm(persistence);
            });
        }
        this.menuContainer.add(this.newGameText);

        // --- Version ---
        this.versionText = this.add.text(0, 0, 'v0.1 — Act I Prototype', {
            ...Theme.STYLES.BODY_SM,
            color: '#333355',
        }).setOrigin(0.5);
        this.menuContainer.add(this.versionText);

        // --- Resize Handling ---
        this.scale.on('resize', this.handleResize, this);
        this.handleResize({ width: this.scale.width, height: this.scale.height });

        this.events.on('shutdown', () => {
            this.scale.off('resize', this.handleResize, this);
        });

        // Fade in
        this.cameras.main.fadeIn(1000, 0, 0, 0);
    }

    handleResize(gameSize) {
        if (!gameSize || gameSize.width <= 0 || gameSize.height <= 0) return;

        const width = gameSize.width;
        const height = gameSize.height;
        const isMobile = width < 600;

        this.cameras.main.setViewport(0, 0, width, height);

        // Update Grid
        this.gridGraphics.clear();
        this.createGridBackground(this.gridGraphics, width, height);

        // Update Ladder
        const ladderX = width / 2;
        const railDist = isMobile ? 60 : 100;

        this.rails.clear();
        this.rails.lineStyle(4, Theme.COLORS.MUTED, 0.3);
        this.rails.lineBetween(ladderX - railDist, 0, ladderX - railDist, height);
        this.rails.lineBetween(ladderX + railDist, 0, ladderX + railDist, height);

        this.rungs.forEach((rung, i) => {
            rung.setPosition(ladderX, height + (i * 100) % (height + 200));
            rung.setSize(railDist * 2, 8);
        });

        // Center Elements
        const centerX = width / 2;

        // Title Scaling
        const titleScale = isMobile ? 0.6 : 1.0;
        const titleY = height * 0.35;

        [this.titleShadow1, this.titleShadow2, this.titleMain].forEach(text => {
            text.setPosition(centerX, titleY);
            text.setScale(titleScale);
        });
        this.titleShadow1.x -= 4 * titleScale;
        this.titleShadow2.x += 4 * titleScale;

        // Tagline
        this.taglineText.setPosition(centerX, height * 0.55);
        this.taglineText.setWordWrapWidth(width * 0.8);
        this.taglineText.setFontSize(isMobile ? '18px' : '24px');

        // Button Sizing
        const paddingX = 60;
        const paddingY = 30;
        const btnW = Math.max(300, this.btnText.width + paddingX);
        const btnH = Math.max(70, this.btnText.height + paddingY);

        this.btnBg.width = btnW; // Store for hover checks
        this.btnBg.height = btnH;

        this.drawButton(this.btnBg, btnW, btnH, Theme.COLORS.CORP_BLUE);
        this.btnContainer.setPosition(centerX, height * 0.75);

        // Update Hit Area
        this.btnContainer.input.hitArea.setTo(-btnW / 2, -btnH / 2, btnW, btnH);

        const btnScale = isMobile ? 0.8 : 1.0;
        this.btnContainer.setScale(btnScale);
        this.btnContainer.baseScale = btnScale;

        // HOW TO PLAY
        this.howToPlayText.setPosition(centerX, height * 0.75 + 55);

        // NEW GAME
        if (this.newGameText) {
            this.newGameText.setPosition(centerX, height * 0.75 + 80);
        }

        // Version
        this.versionText.setPosition(centerX, height - 30);
    }

    update(time) {
        // Animate Rungs (Infinite Scroll)
        const height = this.scale.height;

        this.rungs.forEach(rung => {
            rung.y += 2; // Move down
            // Reset to top if below screen
            if (rung.y > height + 50) {
                rung.y = -50;
            }
        });

        // Glitch Effect on Title
        if (Phaser.Math.Between(0, 100) > 95) {
            const offset = Phaser.Math.Between(-5, 5);
            this.titleShadow1.x = (this.scale.width / 2) + offset;
            this.titleShadow2.x = (this.scale.width / 2) - offset;
        } else {
            this.titleShadow1.x = this.scale.width / 2 - 4;
            this.titleShadow2.x = this.scale.width / 2 + 4;
        }
    }

    showNewGameConfirm(persistence) {
        const { width, height } = this.scale;

        const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.8).setDepth(50);
        const box = this.add.rectangle(width / 2, height / 2, 440, 160, Theme.COLORS.BG_PANEL).setDepth(51);
        const border = this.add.rectangle(width / 2, height / 2, 440, 160).setStrokeStyle(2, Theme.COLORS.DANGER).setDepth(51).setFillStyle();

        const msg = this.add.text(width / 2, height / 2 - 30, 'Erase save and start over?', {
            fontFamily: Theme.FONTS.BODY,
            fontSize: '28px',
            color: '#ffffff',
            align: 'center',
        }).setOrigin(0.5).setDepth(52);

        const yesBtn = this.add.text(width / 2 - 80, height / 2 + 30, '[ YES ]', {
            fontFamily: Theme.FONTS.HEADER,
            fontSize: '12px',
            color: Theme.toHex(Theme.COLORS.DANGER),
        }).setOrigin(0.5).setDepth(52).setInteractive({ useHandCursor: true });

        const noBtn = this.add.text(width / 2 + 80, height / 2 + 30, '[ CANCEL ]', {
            fontFamily: Theme.FONTS.HEADER,
            fontSize: '12px',
            color: Theme.toHex(Theme.COLORS.NEON_CYAN),
        }).setOrigin(0.5).setDepth(52).setInteractive({ useHandCursor: true });

        const cleanup = () => {
            overlay.destroy();
            box.destroy();
            border.destroy();
            msg.destroy();
            yesBtn.destroy();
            noBtn.destroy();
        };

        noBtn.on('pointerdown', cleanup);

        yesBtn.on('pointerdown', () => {
            cleanup();
            persistence.clear();
            this.cameras.main.fadeOut(800, 0, 0, 0);
            this.time.delayedCall(800, () => {
                this.scene.start('HighSchoolScene');
            });
        });
    }

    drawButton(gfx, w, h, color) {
        gfx.clear();
        gfx.fillStyle(color, 1);
        gfx.fillRect(-w / 2, -h / 2, w, h);

        // Tech borders
        gfx.lineStyle(2, 0xffffff, 0.5);
        gfx.strokeRect(-w / 2, -h / 2, w, h);

        // Corners
        const s = 10;
        gfx.lineStyle(2, 0xffffff, 1);
        gfx.beginPath();
        gfx.moveTo(-w / 2, -h / 2 + s);
        gfx.lineTo(-w / 2, -h / 2);
        gfx.lineTo(-w / 2 + s, -h / 2);

        gfx.moveTo(w / 2, -h / 2 + s);
        gfx.lineTo(w / 2, -h / 2);
        gfx.lineTo(w / 2 - s, -h / 2);

        gfx.moveTo(-w / 2, h / 2 - s);
        gfx.lineTo(-w / 2, h / 2);
        gfx.lineTo(-w / 2 + s, h / 2);

        gfx.moveTo(w / 2, h / 2 - s);
        gfx.lineTo(w / 2, h / 2);
        gfx.lineTo(w / 2 - s, h / 2);
        gfx.strokePath();
    }

    createGridBackground(gfx, w, h) {
        gfx.lineStyle(1, 0x111116, 1);

        for (let x = 0; x < w; x += 40) {
            gfx.lineBetween(x, 0, x, h);
        }
        for (let y = 0; y < h; y += 40) {
            gfx.lineBetween(0, y, w, y);
        }
    }
}
