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

    reset() {
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
                { id: 'study', label: 'Study', icon: '📚', description: 'SAT prep. The vocab words blur together.' },
                { id: 'socialize_ma', label: 'Be with Ma', icon: '🍜', description: 'Ma is making congee. She set an extra place.' },
                { id: 'socialize_ba', label: 'Be with Ba', icon: '🚕', description: 'Ba is in the garage. He never asks you to come. He always hopes.' },
                { id: 'socialize_lily', label: 'Hang with Lily', icon: '🧒', description: 'Your sister wants to show you something on her phone.' },
                { id: 'socialize_dev', label: 'Study with Dev', icon: '📖', description: 'Dev\'s already on chapter 12. You\'re on chapter 9.' },
                { id: 'extracurricular', label: 'Violin Practice', icon: '🎻', description: 'You play for college apps, not love. The notes still come out pretty.' },
                { id: 'rest', label: 'Doing Nothing', icon: '😴', description: 'Dev just posted his practice SAT score. You shouldn\'t have looked.' },
            ];
        } else if (this.currentAct === 2) {
            this.activities = [
                { id: 'study', label: 'Study', icon: '📚', description: 'The library closes at 2am. You know because you\'ve been here at 1:58.' },
                { id: 'socialize_priya', label: 'Coffee with Priya', icon: '☕', description: 'She\'s grinding even harder than you. You recognize the look in her eyes.' },
                { id: 'socialize_jordan', label: 'Hang with Jordan', icon: '🎨', description: 'Jordan asks questions that don\'t have right answers. It\'s unsettling.' },
                { id: 'call_family', label: 'Call Home', icon: '📞', description: 'Ma left a voicemail. It\'s 4 minutes long. Mostly silence.' },
                { id: 'text_dev', label: 'Text Dev', icon: '📱', description: 'Dev texted 3 days ago. This costs a whole slot.' },
                { id: 'networking', label: 'Networking Event', icon: '🤝', description: 'Free pizza. Performative handshakes. "What do your parents do?"' },
                { id: 'internship_prep', label: 'Internship Prep', icon: '💼', description: 'Practice "Tell me about yourself" until it sounds natural. (It never will.)' },
                { id: 'club', label: 'Club Activity', icon: '🏆', description: 'Your résumé needs another line. Any line.' },
                { id: 'rest', label: 'Doing Nothing', icon: '😴', description: 'Your roommate is out networking. You can hear them laughing.' },
            ];
        } else if (this.currentAct === 3) {
            this.activities = [
                { id: 'work', label: 'Work', icon: '💼', description: 'The thing they pay you $150k for. You\'ve been grinding since 12.' },
                { id: 'socialize_jamie', label: 'Coffee with Jamie', icon: '☕', description: 'Break room philosophy. The only real thing in this office.' },
                { id: 'call_ma', label: 'Call Ma', icon: '📞', description: '"When are you coming home?" "Soon." You\'ve said soon for 8 months.' },
                { id: 'text_dev', label: 'Text Dev', icon: '📱', description: 'Dev\'s last text: "miss u dude." That was 2 weeks ago.' },
                { id: 'attend_event', label: 'Industry Event', icon: '🤝', description: 'Open bar. Business cards. Networking is just friendship with KPIs.' },
                { id: 'workout', label: 'Hit the Gym', icon: '🏋️', description: 'You have a membership. You\'ve been 3 times. In 6 months.' },
                { id: 'rest', label: 'Doing Nothing', icon: '😴', description: 'You ate pad thai at your desk at 10pm. DoorDash knows your order.' },
            ];
        } else if (this.currentAct === 4) {
            this.activities = [
                { id: 'work', label: 'Work', icon: '💼', description: 'Same puzzle. Bigger numbers. The hedonic treadmill spins.' },
                { id: 'manage_team', label: 'Manage Team', icon: '👥', description: 'Three people depend on you. You barely manage yourself.' },
                { id: 'attend_gala', label: 'Industry Gala', icon: '🥂', description: 'They remember your title but not your name.' },
                { id: 'call_lily', label: 'Call Lily', icon: '📞', description: 'Lily\'s getting married. You found out from Instagram.' },
                { id: 'visit_ba', label: 'Visit Ba', icon: '🏠', description: 'Ba moves slower now. He won\'t say it. You can see it.' },
                { id: 'therapy', label: 'Therapy', icon: '🛋️', description: 'Your therapist said "that\'s interesting" five times. You counted.' },
                { id: 'rest', label: 'Doing Nothing', icon: '😴', description: 'You ordered $40 sushi to eat alone in a $3000/month apartment.' },
            ];
        } else if (this.currentAct === 5) {
            this.activities = [
                { id: 'visit_location', label: 'Visit Old Places', icon: '🚶', description: 'The house is smaller than you remember. Ma has grey hair.' },
                { id: 'reconnect', label: 'Reach Out', icon: '📱', description: 'Send the text. Make the call. Show up at the door.' },
                { id: 'reflect', label: 'Sit & Reflect', icon: '🪑', description: 'Ma makes congee. It\'s warm this time.' },
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
