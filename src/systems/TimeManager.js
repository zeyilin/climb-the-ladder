/**
 * TimeManager — Day/week/semester progression with act support.
 * Act I: 3 slots/day, Act II: 4 slots/day (adds Night).
 */

const ACT_CONFIGS = {
    1: {
        name: 'Act I — High School',
        slotsPerDay: 3,
        slotNames: ['Morning', 'Afternoon', 'Evening'],
        daysPerWeek: 5,
        totalWeeks: 1,
    },
    2: {
        name: 'Act II — College',
        slotsPerDay: 4,
        slotNames: ['Morning', 'Afternoon', 'Evening', 'Night'],
        daysPerWeek: 5,
        totalWeeks: 1,
    },
    3: {
        name: 'Act III — Early Career',
        slotsPerDay: 4,
        slotNames: ['Morning', 'Afternoon', 'Evening', 'Night'],
        daysPerWeek: 5,
        totalWeeks: 1,
        quarterLength: 5,
    },
    4: {
        name: 'Act IV — Peak Ambition',
        slotsPerDay: 4,
        slotNames: ['Morning', 'Afternoon', 'Evening', 'Night'],
        daysPerWeek: 5,
        totalWeeks: 1,
        quarterLength: 4,
    },
    5: {
        name: 'Act V — The Reckoning',
        slotsPerDay: 3,
        slotNames: ['Morning', 'Afternoon', 'Evening'],
        daysPerWeek: 5,
        totalWeeks: 1,
    },
};

export default class TimeManager {
    constructor() {
        this.currentAct = 1;
        this.currentDay = 1;
        this.currentWeek = 1;
        this.currentSlot = 0;
        this.totalDays = 0;
        this.daySlots = [];
        this.isGameOver = false;
        this.isActOver = false;

        this.applyActConfig();
    }

    applyActConfig() {
        const config = ACT_CONFIGS[this.currentAct] || ACT_CONFIGS[1];
        this.slotsPerDay = config.slotsPerDay;
        this.slotNames = config.slotNames;
        this.daysPerWeek = config.daysPerWeek;
        this.totalWeeks = config.totalWeeks;
        this.actName = config.name;

        // Act-specific activities
        if (this.currentAct === 1) {
            this.activities = [
                { id: 'study', label: 'Study', icon: '📚', description: 'Hit the books. +GPA, −Fun.' },
                { id: 'socialize_mom', label: 'Hang with Mom', icon: '🏠', description: 'Family time. Mom appreciates it.' },
                { id: 'socialize_dad', label: 'Hang with Dad', icon: '🏠', description: 'Dad might actually talk about feelings.' },
                { id: 'socialize_jordan', label: 'Hang with Jordan', icon: '🎮', description: 'Your sibling. Way more chill than you.' },
                { id: 'socialize_sam', label: 'Hang with Sam', icon: '🛹', description: 'Your best friend. For now.' },
                { id: 'extracurricular', label: 'Extracurricular', icon: '🏆', description: 'Debate club, student council... résumé padding.' },
                { id: 'rest', label: 'Doing Nothing', icon: '😴', description: 'Derek from school just got Student of the Month.' },
            ];
        } else if (this.currentAct === 2) {
            this.activities = [
                { id: 'study', label: 'Study', icon: '📚', description: 'Your professor gives pop quizzes. Survive.' },
                { id: 'socialize_priya', label: 'Hang with Priya', icon: '☕', description: 'Your college friend. Grinding even harder than you.' },
                { id: 'socialize_morgan', label: 'Hang with Morgan', icon: '💜', description: 'This one might actually matter.' },
                { id: 'text_sam', label: 'Text Sam', icon: '📱', description: 'Sam texted 3 days ago. This costs a whole slot.' },
                { id: 'text_family', label: 'Call Family', icon: '📞', description: 'Mom left a voicemail. It\'s 4 minutes long.' },
                { id: 'networking', label: 'Networking Event', icon: '🤝', description: 'Free pizza. Performative handshakes. The usual.' },
                { id: 'internship_prep', label: 'Internship Prep', icon: '💼', description: 'Practice your "Tell me about yourself" until it sounds natural. (It never will.)' },
                { id: 'club', label: 'Club Activity', icon: '🏆', description: 'Your résumé needs another line. Any line.' },
                { id: 'rest', label: 'Doing Nothing', icon: '😴', description: 'Your roommate is out networking. You can hear them laughing.' },
            ];
        } else if (this.currentAct === 3) {
            this.activities = [
                { id: 'work', label: 'Work', icon: '💼', description: 'The thing they pay you for. Allegedly builds character.' },
                { id: 'socialize_colleague', label: 'Coffee with Jamie', icon: '☕', description: 'Broken Keurig philosophy. The only real thing in this office.' },
                { id: 'call_mom', label: 'Call Mom', icon: '📞', description: 'She called Sunday. And the Sunday before. The streak is at 3.' },
                { id: 'text_sam', label: 'Text Sam', icon: '📱', description: 'Sam\'s last text: "miss u dude." That was 2 weeks ago.' },
                { id: 'attend_event', label: 'Industry Event', icon: '🤝', description: 'Open bar. Business cards. Networking is just friendship with KPIs.' },
                { id: 'workout', label: 'Hit the Gym', icon: '🏋️', description: 'You have a membership. You\'ve been 3 times. In 6 months.' },
                { id: 'pivot_career', label: 'Pivot Career', icon: '🔄', description: 'Costs a whole quarter. 40% chance you end up right back here.' },
                { id: 'rest', label: 'Doing Nothing', icon: '😴', description: 'You ate pad thai at your desk at 10pm. Again.' },
            ];
        } else if (this.currentAct === 4) {
            this.activities = [
                { id: 'work', label: 'Work', icon: '💼', description: 'Same puzzle. Bigger numbers. The hedonic treadmill spins.' },
                { id: 'manage_team', label: 'Manage Team', icon: '👥', description: 'Three people depend on you. You barely manage yourself.' },
                { id: 'attend_gala', label: 'Industry Gala', icon: '🥂', description: 'Champagne, small talk, and people who remember your title but not your name.' },
                { id: 'call_jordan', label: 'Call Jordan', icon: '📞', description: 'Jordan asked if you\'re coming to Dad\'s birthday. That was 2 months ago.' },
                { id: 'visit_dad', label: 'Visit Dad', icon: '🏠', description: 'He reorganized the garage again. The third time this year.' },
                { id: 'therapy', label: 'Therapy', icon: '🛋️', description: 'Your therapist said "that\'s interesting" five times last session. You counted.' },
                { id: 'rest', label: 'Doing Nothing', icon: '😴', description: 'You ordered $40 sushi to eat alone in a $3000/month apartment.' },
            ];
        } else if (this.currentAct === 5) {
            this.activities = [
                { id: 'visit_location', label: 'Visit Old Places', icon: '🚶', description: 'Retrace your steps. Everything\'s smaller than you remember.' },
                { id: 'reconnect', label: 'Reach Out', icon: '📱', description: 'Send the text. Make the call. Show up to the door.' },
                { id: 'reflect', label: 'Sit & Reflect', icon: '🪑', description: 'Sometimes you just need to sit.' },
            ];
        }
    }

    getSlotNames() {
        return [...this.slotNames];
    }

    getCurrentSlotName() {
        return this.slotNames[this.currentSlot] || 'Done';
    }

    getWeekDisplay() {
        return `Week ${this.currentWeek} of ${this.totalWeeks}`;
    }

    getDayDisplay() {
        return `Day ${this.currentDay}`;
    }

    getActDisplay() {
        return this.actName;
    }

    setSlotActivity(activity) {
        this.daySlots[this.currentSlot] = activity;
        this.currentSlot++;
    }

    isDayComplete() {
        return this.currentSlot >= this.slotsPerDay;
    }

    /**
     * Advance to next day. Returns 'act_over' or 'game_over' or null.
     */
    advanceDay() {
        this.currentDay++;
        this.totalDays++;
        this.currentSlot = 0;
        this.daySlots = [];

        if (this.currentDay > this.daysPerWeek) {
            this.currentDay = 1;
            this.currentWeek++;
        }

        if (this.currentWeek > this.totalWeeks) {
            this.isActOver = true;
            return 'act_over';
        }

        return null;
    }

    /**
     * Advance to next act. Resets week/day counters.
     */
    advanceAct() {
        this.currentAct++;
        this.currentDay = 1;
        this.currentWeek = 1;
        this.currentSlot = 0;
        this.totalDays = 0;
        this.daySlots = [];
        this.isActOver = false;

        if (this.currentAct > 5) {
            this.isGameOver = true;
            return false;
        }

        this.applyActConfig();
        return true;
    }

    getDayActivities() {
        return [...this.daySlots];
    }

    getProgress() {
        return this.totalDays / (this.totalWeeks * this.daysPerWeek);
    }
}
