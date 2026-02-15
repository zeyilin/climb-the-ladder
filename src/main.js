import Phaser from 'phaser';
import BootScene from './scenes/BootScene.js';
import MenuScene from './scenes/MenuScene.js';
import NarrativeScene from './scenes/NarrativeScene.js';
import PlanningScene from './scenes/PlanningScene.js';
import CareerRouletteScene from './scenes/CareerRouletteScene.js';
import MirrorMomentScene from './scenes/MirrorMomentScene.js';
import ScrapbookScene from './scenes/ScrapbookScene.js';
import EndingScene from './scenes/EndingScene.js';
// UI
import HUDScene from './ui/HUD.js';
import RelationshipPanelScene from './ui/RelationshipPanel.js';
import ResumeViewScene from './ui/ResumeView.js';
import InstructionsScene from './scenes/InstructionsScene.js';
// Systems
import StatManager from './systems/StatManager.js';
import RelationshipManager from './systems/RelationshipManager.js';
import TimeManager from './systems/TimeManager.js';
import DialogueSystem from './systems/DialogueSystem.js';
import ResumeSystem from './systems/ResumeSystem.js';
import AudioCues from './systems/AudioCues.js';
import PersistenceManager from './systems/PersistenceManager.js';
import NarrativeEngine from './systems/NarrativeEngine.js';
import GameFlowController from './systems/GameFlowController.js';
// Data
import characterData from './data/characters.json';

/**
 * Climb the Ladder — Main Entry Point
 * A narrative life-sim about the weight of immigrant family expectations,
 * the grind to the top, and the relationships you lose along the way.
 */

const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    width: 1280,
    height: 960,
    resolution: window.devicePixelRatio,
    roundPixels: true,
    backgroundColor: '#050508',
    dom: {
        createContainer: true,
    },
    scene: [
        BootScene,
        MenuScene,
        // Core gameplay
        NarrativeScene,
        PlanningScene,
        // Preserved unique scenes
        CareerRouletteScene,
        MirrorMomentScene,
        ScrapbookScene,
        EndingScene,
        // UI overlays
        HUDScene,
        RelationshipPanelScene,
        ResumeViewScene,
        InstructionsScene,
    ],
    scale: {
        mode: Phaser.Scale.NONE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
};

const game = new Phaser.Game(config);

// --- System Instantiation & Registry ---
const statManager = new StatManager();
const relationshipManager = new RelationshipManager();
const timeManager = new TimeManager();
const dialogueSystem = new DialogueSystem();
const resumeSystem = new ResumeSystem();
const audioCues = new AudioCues();
const persistenceManager = new PersistenceManager(game);
const narrativeEngine = new NarrativeEngine();
const gameFlowController = new GameFlowController(game);

// Wire up audio cues
statManager.setAudioCues(audioCues);
relationshipManager.setAudioCues(audioCues);

// Initialize relationships from character data
relationshipManager.init(characterData.characters);

// Register in Phaser registry so all scenes can access
game.registry.set('statManager', statManager);
game.registry.set('relationshipManager', relationshipManager);
game.registry.set('timeManager', timeManager);
game.registry.set('dialogueSystem', dialogueSystem);
game.registry.set('resumeSystem', resumeSystem);
game.registry.set('audioCues', audioCues);
game.registry.set('persistenceManager', persistenceManager);
game.registry.set('narrativeEngine', narrativeEngine);
game.registry.set('gameFlowController', gameFlowController);

// --- Game Reset Function ---
function resetGame() {
    statManager.reset();
    relationshipManager.reset();
    relationshipManager.init(characterData.characters);
    timeManager.reset();
    dialogueSystem.reset();
    resumeSystem.reset();
    audioCues.reset();
    narrativeEngine.reset();

    // Reset registry values
    game.registry.set('hoursWorked', 0);
    game.registry.set('hoursWithPeople', 0);
    game.registry.set('doorDashOrders', 0);
    game.registry.set('consecutiveRestDays', 0);
    game.registry.set('careerTrack', null);
    game.registry.set('scrapbook', []);
    game.registry.set('flowController', null);
    game.registry.set('dayActivities', null);
}

game.registry.set('resetGame', resetGame);

// --- Manual Resize Management ---
const resizeGame = () => {
    if (!game || !game.scale) return;

    const w = window.innerWidth;
    const h = window.innerHeight;

    game.scale.resize(w, h);
    game.scale.refresh();
};

window.addEventListener('resize', resizeGame);

window.addEventListener('load', () => {
    resizeGame();
});

setTimeout(resizeGame, 100);
