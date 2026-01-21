import { VoiceUIController } from '../../core/controller.js';

export default function voiceModePlugin(voice) {
    voice.addCommand('voice only mode', () => {
        VoiceUIController.setVoiceMode(true);
        voice.speak('Voice only mode activated. Screen simplified.');
    });

    voice.addCommand('exit voice mode', () => {
        VoiceUIController.setVoiceMode(false);
        voice.speak('Returning to standard interface.');
    });

    // Eyes-free navigation (Stub)
    voice.addCommand('read current state', () => {
        voice.speak('You are on the Demo Page. 3 active widgets.');
    });
}
