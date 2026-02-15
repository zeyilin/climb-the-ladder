import Phaser from 'phaser';
import Theme from '../Theme.js';

export default class UIButton extends Phaser.GameObjects.Container {
    constructor(scene, x, y, width, height, config) {
        super(scene, x, y);
        this.scene = scene;
        this.baseWidth = width;
        this.baseHeight = height;
        this.config = config || {};

        // Config defaults
        this.onClick = this.config.onClick || (() => { });
        this.label = this.config.label || 'BUTTON';
        this.icon = this.config.icon || '';
        this.description = this.config.description || '';
        this.isSelected = this.config.isSelected || false;

        this.scene.add.existing(this);
        this.createComponents();
        this.updateLayout(width, height);
        this.setupInteractions();
    }

    createComponents() {
        // Background
        this.bg = this.scene.add.graphics();

        // Icon (optional)
        this.iconText = this.scene.add.text(0, 0, this.icon, {
            fontSize: '24px'
        }).setOrigin(0.5);

        // Label
        this.labelText = this.scene.add.text(0, 0, this.label.toUpperCase(), {
            ...Theme.STYLES.HEADER_SM,
            fontSize: '14px',
            color: '#ffffff',
        }).setOrigin(0, 0.5);

        // Description
        this.descText = this.scene.add.text(0, 0, this.description, {
            ...Theme.STYLES.BODY_SM,
            fontSize: '14px',
            color: '#8888aa',
            fontStyle: 'italic'
        }).setOrigin(1, 0.5);

        this.add([this.bg, this.iconText, this.labelText, this.descText]);
    }

    updateLayout(width, height) {
        this.width = width;
        this.height = height;
        const halfW = width / 2;
        const halfH = height / 2;
        const isSmall = width < 400;

        // Draw BG
        this.bg.clear();
        const color = this.isSelected ? Theme.COLORS.NEON_CYAN : 0x111116;
        const borderColor = this.isSelected ? Theme.COLORS.CORP_BLUE : 0x444455;
        const alpha = this.isSelected ? 0.2 : 1;

        if (this.isSelected) {
            this.bg.fillStyle(color, 0.2);
            this.bg.lineStyle(2, Theme.COLORS.NEON_CYAN, 1);
        } else {
            this.bg.fillStyle(0x111116, 1);
            this.bg.lineStyle(2, 0x444455, 1);
        }

        this.bg.fillRoundedRect(-halfW, -halfH, width, height, 8);
        this.bg.strokeRoundedRect(-halfW, -halfH, width, height, 8);

        // Positioning
        const padding = 20;

        // Icon: Left aligned
        this.iconText.setPosition(-halfW + padding, 0);

        // Label: Left of Icon
        this.labelText.setPosition(-halfW + padding + 30, 0);

        // Description: Right aligned
        // Hide if too small
        if (isSmall) {
            this.descText.setVisible(false);
        } else {
            this.descText.setVisible(true);
            this.descText.setPosition(halfW - padding, 0);

            // Truncate if needed? For now just hide if overlap risk
            const availableW = width - (padding * 3) - this.labelText.width - 40;
            if (this.descText.width > availableW) {
                this.descText.setVisible(false); // Creating a cleaner "hide" rather than overlap
            }
        }

        // Update Hit Area
        this.setInteractive(new Phaser.Geom.Rectangle(-halfW, -halfH, width, height), Phaser.Geom.Rectangle.Contains);
    }

    setupInteractions() {
        this.on('pointerover', () => {
            this.bg.lineStyle(2, Theme.COLORS.NEON_CYAN, 1);
            this.bg.strokeRoundedRect(-this.width / 2, -this.height / 2, this.width, this.height, 8);
            document.body.style.cursor = 'pointer';
        });

        this.on('pointerout', () => {
            if (!this.isSelected) {
                this.bg.lineStyle(2, 0x444455, 1);
                this.bg.strokeRoundedRect(-this.width / 2, -this.height / 2, this.width, this.height, 8);
            }
            document.body.style.cursor = 'default';
        });

        this.on('pointerdown', () => {
            this.onClick();
        });
    }

    setSelected(selected) {
        this.isSelected = selected;
        this.updateLayout(this.width, this.height);
    }
}
