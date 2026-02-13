import Phaser from 'phaser';
import BootScene from './scenes/BootScene.js';
import MenuScene from './scenes/MenuScene.js';
import HighSchoolScene from './scenes/HighSchoolScene.js';
import TimeAllocationScene from './scenes/TimeAllocationScene.js';
import StudyMiniGame from './scenes/StudyMiniGame.js';
import DialogueScene from './scenes/DialogueScene.js';
import CollegeRevealScene from './scenes/CollegeRevealScene.js';
// Act II scenes
import MajorSelectionScene from './scenes/MajorSelectionScene.js';
import CollegeCampusScene from './scenes/CollegeCampusScene.js';
import NetworkingMiniGame from './scenes/NetworkingMiniGame.js';
import InternshipMiniGame from './scenes/InternshipMiniGame.js';
import CareerRouletteScene from './scenes/CareerRouletteScene.js';
// Act III scenes
import CityScene from './scenes/CityScene.js';
import ConsultingMiniGame from './scenes/ConsultingMiniGame.js';
import BankingMiniGame from './scenes/BankingMiniGame.js';
import StartupMiniGame from './scenes/StartupMiniGame.js';
import BigTechMiniGame from './scenes/BigTechMiniGame.js';
import PerformanceReviewScene from './scenes/PerformanceReviewScene.js';
import PromotionScene from './scenes/PromotionScene.js';
import InsuranceAdjustingMiniGame from './scenes/InsuranceAdjustingMiniGame.js';
// Act IV scenes
import CornerOfficeScene from './scenes/CornerOfficeScene.js';
import EscalatedMiniGame from './scenes/EscalatedMiniGame.js';
import TeamManagementScene from './scenes/TeamManagementScene.js';
import MirrorMomentScene from './scenes/MirrorMomentScene.js';
import UltimatePromotionScene from './scenes/UltimatePromotionScene.js';
// Act V scenes
import ReckoningScene from './scenes/ReckoningScene.js';
import ReconciliationScene from './scenes/ReconciliationScene.js';
import ScrapbookScene from './scenes/ScrapbookScene.js';
import EndingScene from './scenes/EndingScene.js';
// UI
import HUDScene from './ui/HUD.js';
import RelationshipPanelScene from './ui/RelationshipPanel.js';
import ResumeViewScene from './ui/ResumeView.js';
// Systems
import StatManager from './systems/StatManager.js';
import RelationshipManager from './systems/RelationshipManager.js';
import TimeManager from './systems/TimeManager.js';
import DialogueSystem from './systems/DialogueSystem.js';
import ResumeSystem from './systems/ResumeSystem.js';
import AudioCues from './systems/AudioCues.js';
// Data
import characterData from './data/characters.json';

/**
 * Climb the Ladder — Main Entry Point
 * A darkly comedic 2D pixel-art life-sim about grinding yourself
 * into a husk for a corner office you'll eat sad desk salads in.
 */

const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    width: 800,
    height: 600,
    backgroundColor: '#0a0a0f',
    pixelArt: true,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false,
        },
    },
    scene: [
        BootScene,
        MenuScene,
        // Act I
        HighSchoolScene,
        TimeAllocationScene,
        StudyMiniGame,
        DialogueScene,
        CollegeRevealScene,
        // Act II
        MajorSelectionScene,
        CollegeCampusScene,
        NetworkingMiniGame,
        InternshipMiniGame,
        CareerRouletteScene,
        // Act III
        CityScene,
        ConsultingMiniGame,
        BankingMiniGame,
        StartupMiniGame,
        BigTechMiniGame,
        PerformanceReviewScene,
        PromotionScene,
        InsuranceAdjustingMiniGame,
        // Act IV
        CornerOfficeScene,
        EscalatedMiniGame,
        TeamManagementScene,
        MirrorMomentScene,
        UltimatePromotionScene,
        // Act V
        ReckoningScene,
        ReconciliationScene,
        ScrapbookScene,
        EndingScene,
        // UI overlays
        HUDScene,
        RelationshipPanelScene,
        ResumeViewScene,
    ],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
};

const game = new Phaser.Game(config);

// Initialize shared systems and store in registry
const statManager = new StatManager();
const relationshipManager = new RelationshipManager();
const timeManager = new TimeManager();
const dialogueSystem = new DialogueSystem();
const resumeSystem = new ResumeSystem();
const audioCues = new AudioCues();

// Inject audio cues into systems
statManager.setAudioCues(audioCues);
relationshipManager.setAudioCues(audioCues);

// Initialize relationships from character data
relationshipManager.init(characterData.characters);

// Store systems in game registry so all scenes can access them
game.registry.set('statManager', statManager);
game.registry.set('relationshipManager', relationshipManager);
game.registry.set('timeManager', timeManager);
game.registry.set('dialogueSystem', dialogueSystem);
game.registry.set('resumeSystem', resumeSystem);
game.registry.set('audioCues', audioCues);
game.registry.set('hoursWorked', 0);
game.registry.set('hoursWithPeople', 0);
game.registry.set('consecutiveRestDays', 0);
