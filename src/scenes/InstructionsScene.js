import Phaser from 'phaser';
import Theme from '../ui/Theme.js';

/**
 * InstructionsScene — Modal overlay with game controls and mechanics.
 * Accessible via ? key from HUD or HOW TO PLAY button from MenuScene.
 * Uses DOM element for crisp text rendering.
 */
export default class InstructionsScene extends Phaser.Scene {
    constructor() {
        super({ key: 'InstructionsScene' });
    }

    create() {
        const { width, height } = this.scale;

        // --- Background Overlay (Phaser) ---
        this.overlay = this.add.rectangle(width / 2, height / 2, width, height, Theme.COLORS.BG_OVERLAY, 0.85)
            .setInteractive()
            .setDepth(200);

        // --- DOM Panel ---
        const panelW = Math.min(720, width - 60);
        const panelH = Math.min(560, height - 80);

        const html = this.buildHTML();
        this.domElement = this.add.dom(width / 2, height / 2).createFromHTML(html);
        this.domElement.setDepth(201);

        // Size the panel
        const el = this.domElement.node;
        el.style.width = panelW + 'px';
        el.style.height = panelH + 'px';

        // Close click on the hint
        const closeHint = el.querySelector('.close-hint');
        if (closeHint) {
            closeHint.addEventListener('click', () => this.closePanel());
        }

        // --- Keyboard Close ---
        this.input.keyboard.on('keydown', (event) => {
            if (event.key === '?' || event.key === 'Escape') {
                this.closePanel();
            }
        });

        // --- Entrance Animation ---
        this.domElement.setAlpha(0);
        this.domElement.setScale(0.95);
        this.tweens.add({
            targets: this.domElement,
            alpha: 1,
            scaleX: 1,
            scaleY: 1,
            duration: 200,
            ease: 'Power2',
        });

        // --- Resize ---
        this.scale.on('resize', this.handleResize, this);
        this.events.on('shutdown', () => {
            this.scale.off('resize', this.handleResize, this);
        });
    }

    buildHTML() {
        const sections = [
            {
                title: 'CONTROLS',
                lines: [
                    'WASD / Arrows ........ Move',
                    'E .................... Interact',
                    'TAB .................. Contacts',
                    'R .................... Resume',
                    '? .................... This screen',
                ]
            },
            {
                title: 'GAME OVERVIEW',
                lines: [
                    'Allocate your limited time across activities each day. Every choice has trade-offs.',
                    'Your decisions shape your stats, relationships, and ultimately your career trajectory.',
                ]
            },
            {
                title: 'STATS',
                lines: [
                    'GPA — Academic/work performance output',
                    'Network — Professional connections & reach',
                    'Authenticity — Who you really are vs. the mask',
                    'Burnout — Stress accumulation (keep it low!)',
                ]
            },
            {
                title: 'RELATIONSHIPS',
                lines: [
                    'Connections decay daily. Maintain them or lose them forever.',
                    'Fading portraits show the strength of each bond.',
                ]
            },
            {
                title: 'BURNOUT',
                lines: [
                    'High burnout corrupts dialogue, slows controls, and penalizes performance.',
                    'Rest to recover.',
                ]
            },
        ];

        const sectionsHTML = sections.map(s => `
            <div class="section">
                <div class="section-header">${s.title}</div>
                ${s.lines.map(l => `<div class="section-line">${l}</div>`).join('')}
            </div>
        `).join('');

        return `
            <div class="panel panel--cyan-border panel--scrollable instructions-panel">
                <div class="panel-title">HOW TO PLAY</div>
                <div class="divider"></div>
                ${sectionsHTML}
                <div class="close-hint">[ CLOSE — ? ]</div>
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
            this.domElement.setPosition(width / 2, height / 2);
            const panelW = Math.min(720, width - 60);
            const panelH = Math.min(560, height - 80);
            const el = this.domElement.node;
            el.style.width = panelW + 'px';
            el.style.height = panelH + 'px';
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
                this.scene.stop('InstructionsScene');
            },
        });
    }
}
