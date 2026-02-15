import Phaser from 'phaser';
import Theme from './Theme.js';

/**
 * ResumeViewScene — Toggle with R key.
 * Shows the player's accumulating life choices.
 * "Corporate Dossier" Style — DOM-based for crisp text.
 */
export default class ResumeViewScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ResumeViewScene' });
    }

    init() {
        this.resumeSystem = this.registry.get('resumeSystem');
    }

    create() {
        const { width, height } = this.scale;

        // Overlay (Phaser)
        this.overlay = this.add.rectangle(width / 2, height / 2, width, height, Theme.COLORS.BG_OVERLAY, 0.9)
            .setInteractive()
            .setDepth(300);

        // Paper dimensions
        const paperW = Math.min(550, width - 40);
        const paperH = Math.min(750, height - 40);

        // DOM Panel
        const html = this.buildHTML(paperW);
        this.domElement = this.add.dom(width / 2, height / 2).createFromHTML(html);
        this.domElement.setDepth(301);

        const el = this.domElement.node;
        el.style.width = paperW + 'px';
        el.style.height = paperH + 'px';

        // Close button click
        const closeBtn = el.querySelector('.close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.close());
        }

        // Keyboard close
        this.input.keyboard.on('keydown-R', () => this.close());
        this.input.keyboard.on('keydown-ESC', () => this.close());

        // Entrance animation
        this.domElement.setScale(0.95);
        this.domElement.setAlpha(0);
        this.tweens.add({
            targets: this.domElement,
            alpha: 1,
            scaleX: 1,
            scaleY: 1,
            duration: 250,
        });

        // Resize
        this.scale.on('resize', this.handleResize, this);
        this.events.on('shutdown', () => {
            this.scale.off('resize', this.handleResize, this);
        });
    }

    buildHTML() {
        if (!this.resumeSystem) {
            return '<div class="panel panel--scrollable resume-panel"><div class="resume-name">NO DATA</div></div>';
        }

        const data = this.resumeSystem.getAll();

        // Education
        const eduItems = [
            data.highSchool,
            data.gpa ? `GPA: ${data.gpa}` : null,
            data.college,
            data.major ? `Major: ${data.major}` : null,
        ].filter(Boolean);

        // Experience
        const expItems = [...(data.internships || [])];
        if (data.career) expItems.push(data.career);

        // Leadership
        const actItems = [...(data.extracurriculars || []), ...(data.clubs || [])];

        const sectionHTML = (title, items) => {
            if (!items || items.length === 0) return '';
            return `
                <div class="resume-section-title">&gt; ${title}</div>
                ${items.map(item => `<div class="resume-item">${item}</div>`).join('')}
            `;
        };

        return `
            <div class="panel panel--scrollable resume-panel">
                <div class="resume-name">${(data.name || 'Your Name')}</div>
                <div class="resume-subtitle">PROSPECTIVE EMPLOYEE &bull; STATUS: DISPOSABLE</div>
                <div class="divider divider--blue"></div>
                ${sectionHTML('EDUCATION', eduItems)}
                ${sectionHTML('EXPERIENCE', expItems)}
                ${sectionHTML('LEADERSHIP', actItems)}
                <div class="resume-footer">* formatted in Comic Sans for that authentic touch</div>
                <div class="close-btn">CLOSE (R)</div>
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
            const paperW = Math.min(550, width - 40);
            const paperH = Math.min(750, height - 40);
            const el = this.domElement.node;
            el.style.width = paperW + 'px';
            el.style.height = paperH + 'px';
        }
    }

    close() {
        if (this.closing) return;
        this.closing = true;
        this.tweens.add({
            targets: this.domElement,
            alpha: 0,
            scaleX: 0.95,
            scaleY: 0.95,
            duration: 150,
            onComplete: () => {
                this.scene.stop('ResumeViewScene');
            },
        });
    }
}
