/**
 * ResumeSystem — Persistent choice tracker.
 * The in-game résumé that accumulates your life decisions.
 * Uses the wrong font. On purpose.
 */
export default class ResumeSystem {
    constructor() {
        this.entries = {
            name: 'Alex Park',
            // Act I
            highSchool: 'Oakridge High School',
            gpa: null,
            extracurriculars: [],
            collegeTier: null,
            college: null,
            // Act II
            major: null,
            clubs: [],
            internships: [],
            // Act III
            career: null,
            promotions: [],
            // Meta
            font: 'Comic Sans MS',  // the wrong font
            lastUpdated: 'Day 1',
        };
    }

    setField(key, value) {
        this.entries[key] = value;
    }

    addToList(key, item) {
        if (Array.isArray(this.entries[key])) {
            this.entries[key].push(item);
        }
    }

    getField(key) {
        return this.entries[key];
    }

    getAll() {
        return { ...this.entries };
    }

    /**
     * Generate a formatted résumé text for display
     */
    getFormattedResume() {
        const r = this.entries;
        const lines = [];

        lines.push(`✦ ${r.name} ✦`);
        lines.push('');

        // Education
        lines.push('EDUCATION');
        lines.push(`  ${r.highSchool}`);
        if (r.gpa) lines.push(`  GPA: ${r.gpa}`);
        if (r.college) lines.push(`  ${r.college}`);
        if (r.major) lines.push(`  Major: ${r.major}`);
        lines.push('');

        // Activities
        if (r.extracurriculars.length > 0 || r.clubs.length > 0) {
            lines.push('ACTIVITIES');
            for (const ec of r.extracurriculars) lines.push(`  • ${ec}`);
            for (const club of r.clubs) lines.push(`  • ${club}`);
            lines.push('');
        }

        // Work Experience
        if (r.internships.length > 0 || r.career) {
            lines.push('EXPERIENCE');
            for (const intern of r.internships) lines.push(`  • ${intern}`);
            if (r.career) lines.push(`  • ${r.career}`);
            lines.push('');
        }

        // The font joke
        lines.push(`(Formatted in ${r.font}. You'll never fix it.)`);

        return lines.join('\n');
    }
}
