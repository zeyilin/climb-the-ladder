import Phaser from 'phaser';
import Theme from './Theme.js';

/**
 * RelationshipPanelScene — Fading portraits panel.
 * "Corporate CRM" Style — DOM-based for crisp text and scrolling.
 */
export default class RelationshipPanelScene extends Phaser.Scene {
    constructor() {
        super({ key: 'RelationshipPanelScene' });
    }

    init() {
        this.relationshipManager = this.registry.get('relationshipManager');
    }

    create() {
        const { width, height } = this.scale;

        // --- Background Overlay (Phaser) ---
        this.overlay = this.add.rectangle(width / 2, height / 2, width, height, Theme.COLORS.BG_OVERLAY, 0.85)
            .setInteractive()
            .setDepth(200);

        // --- Panel dimensions ---
        this.panelW = Math.min(700, width - 40);
        this.panelH = Math.min(600, height - 40);

        // --- DOM Panel ---
        const html = this.buildHTML();
        this.domElement = this.add.dom(width / 2, height / 2).createFromHTML(html);
        this.domElement.setDepth(201);

        const el = this.domElement.node;
        el.style.width = this.panelW + 'px';
        el.style.height = this.panelH + 'px';

        // --- Entrance Animation ---
        this.domElement.setAlpha(0);
        this.domElement.setScale(0.95);
        this.tweens.add({
            targets: this.domElement,
            alpha: 1,
            scaleX: 1,
            scaleY: 1,
            duration: 200,
            ease: 'Back.out',
        });

        // --- Input ---
        this.input.keyboard.on('keydown-TAB', () => this.closePanel());

        this.overlay.on('pointerdown', () => this.closePanel());

        // --- Resize ---
        this.scale.on('resize', this.handleResize, this);
        this.events.on('shutdown', () => {
            this.scale.off('resize', this.handleResize, this);
        });
    }

    buildHTML() {
        const charData = this.cache.json.get('characters');
        const characters = charData.characters;
        const sorted = this.relationshipManager.getSorted();

        const rows = sorted.map((rel) => {
            const char = characters.find(c => c.id === rel.id);
            const opacity = this.relationshipManager.getPortraitOpacity(rel.id);
            const fillPct = Math.max(0, Math.min(100, rel.connection));
            const fillColor = rel.lost ? 'var(--danger)' : (rel.connection > 50 ? 'var(--neon-green)' : 'var(--neon-yellow)');
            const valueColor = fillColor;
            const valueText = rel.lost ? 'LOST' : `${Math.round(rel.connection)}%`;
            const portraitColor = char?.color || '#3a3a5e';

            const ghostingHTML = (!rel.reachesOut && !rel.lost)
                ? '<span class="ghosting-badge">GHOSTING</span>'
                : '';

            return `
                <div class="rel-row" style="opacity: ${opacity}">
                    <div class="rel-portrait" style="background: ${portraitColor}">
                        ${char ? char.emoji : '?'}
                    </div>
                    <div class="rel-info">
                        <div class="rel-name">${rel.name}</div>
                        ${char ? `<div class="rel-role">${char.role}</div>` : ''}
                    </div>
                    <div class="rel-bar-wrapper">
                        <div class="rel-bar-bg">
                            <div class="rel-bar-fill" style="width: ${fillPct}%; background: ${fillColor}"></div>
                        </div>
                        <div class="rel-bar-value" style="color: ${fillColor}">${valueText}</div>
                    </div>
                    <div class="rel-status">${ghostingHTML}</div>
                </div>
            `;
        }).join('');

        return `
            <div class="panel rel-panel">
                <div class="rel-header">
                    <span class="rel-header-title">RELATIONSHIP_DATABASE // V.1.0</span>
                    <span class="rel-header-badge">CONFIDENTIAL</span>
                </div>
                <div class="rel-header-line"></div>
                <div class="rel-hint">"Networking is just using people who are using you."</div>
                <div class="rel-list">
                    ${rows}
                </div>
                <div class="rel-close-hint">[ PRESS TAB TO CLOSE ]</div>
            </div>
        `;
    }

    handleResize(gameSize) {
        if (!gameSize || gameSize.width <= 0 || gameSize.height <= 0) return;
        const width = gameSize.width;
        const height = gameSize.height;

        this.cameras.main.setViewport(0, 0, width, height);

        if (this.overlay) {
            this.overlay.setPosition(width / 2, height / 2);
            this.overlay.setSize(width, height);
        }

        if (this.domElement) {
            this.panelW = Math.min(700, width - 40);
            this.panelH = Math.min(600, height - 40);
            this.domElement.setPosition(width / 2, height / 2);
            const el = this.domElement.node;
            el.style.width = this.panelW + 'px';
            el.style.height = this.panelH + 'px';
        }
    }

    closePanel() {
        if (this.closing) return;
        this.closing = true;
        this.tweens.add({
            targets: this.domElement,
            alpha: 0,
            scaleX: 0.95,
            scaleY: 0.95,
            duration: 150,
            onComplete: () => {
                this.scene.stop('RelationshipPanelScene');
            },
        });
    }
}
