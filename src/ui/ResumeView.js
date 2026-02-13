import Phaser from 'phaser';

/**
 * ResumeViewScene — Toggle with R key.
 * Shows the player's accumulating life choices.
 * Intentionally uses Comic Sans. That's the joke.
 */
export default class ResumeViewScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ResumeViewScene' });
    }

    create() {
        const { width, height } = this.cameras.main;

        // Semi-transparent overlay
        this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7).setDepth(0);

        // "Paper" background
        const paperW = 380;
        const paperH = 400;
        this.add.rectangle(width / 2, height / 2, paperW, paperH, 0xf5f5e8)
            .setStrokeStyle(1, 0xccccbb).setDepth(1);

        // Get résumé data
        const resumeSystem = this.registry.get('resumeSystem');
        if (!resumeSystem) {
            this.add.text(width / 2, height / 2, 'No résumé yet.', {
                fontFamily: 'Inter', fontSize: '12px', color: '#333',
            }).setOrigin(0.5).setDepth(2);
            this.addCloseButton();
            return;
        }

        const r = resumeSystem.getAll();
        let y = height / 2 - paperH / 2 + 25;
        const x = width / 2 - paperW / 2 + 30;
        const maxW = paperW - 60;

        // Name — in Comic Sans, obviously
        this.add.text(width / 2, y, `✦ ${r.name} ✦`, {
            fontFamily: '"Comic Sans MS", cursive',
            fontSize: '16px', color: '#1a1a2e', fontStyle: 'bold',
        }).setOrigin(0.5).setDepth(2);
        y += 25;

        // Divider
        const gfx = this.add.graphics().setDepth(2);
        gfx.lineStyle(1, 0xaaaaaa);
        gfx.lineBetween(x, y, x + maxW, y);
        y += 12;

        // Education section
        this.addSection('EDUCATION', x, y, [
            r.highSchool,
            r.gpa ? `GPA: ${r.gpa}` : null,
            r.college || null,
            r.major ? `Major: ${r.major}` : null,
        ].filter(Boolean));
        y += 20 + (r.college ? 15 : 0) + (r.major ? 15 : 0) + 15;

        // Activities
        const activities = [...(r.extracurriculars || []), ...(r.clubs || [])];
        if (activities.length > 0) {
            this.addSection('ACTIVITIES', x, y, activities);
            y += 20 + activities.length * 15;
        }

        // Experience
        const experience = [...(r.internships || [])];
        if (r.career) experience.push(r.career);
        if (experience.length > 0) {
            this.addSection('EXPERIENCE', x, y, experience);
            y += 20 + experience.length * 15;
        }

        // The font joke
        this.add.text(width / 2, height / 2 + paperH / 2 - 30,
            `(Formatted in ${r.font}. You'll never fix it.)`, {
            fontFamily: '"Comic Sans MS", cursive',
            fontSize: '9px', color: '#999', fontStyle: 'italic',
        }).setOrigin(0.5).setDepth(2);

        this.addCloseButton();
    }

    addSection(title, x, y, items) {
        this.add.text(x, y, title, {
            fontFamily: '"Comic Sans MS", cursive',
            fontSize: '11px', color: '#333', fontStyle: 'bold',
        }).setDepth(2);

        items.forEach((item, i) => {
            this.add.text(x + 10, y + 16 + i * 15, `• ${item}`, {
                fontFamily: '"Comic Sans MS", cursive',
                fontSize: '10px', color: '#555',
            }).setDepth(2);
        });
    }

    addCloseButton() {
        const { width, height } = this.cameras.main;
        const btn = this.add.text(width / 2, height / 2 + 210, '[ R to Close ]', {
            fontFamily: '"Press Start 2P"', fontSize: '8px', color: '#6c63ff',
        }).setOrigin(0.5).setDepth(3);

        // Close on R key
        this.input.keyboard.once('keydown-R', () => {
            this.scene.stop('ResumeViewScene');
        });
    }
}
