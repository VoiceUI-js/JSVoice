import { VoiceUIController } from '../../core/controller.js';

export default function repairPlugin(voice) {
    // Hook into global events to catch failures
    voice.setOption('onCommandNotRecognized', (transcript) => {
        console.log('[Repair] Command failed:', transcript);
        VoiceUIController.startRepair(transcript);
        voice.speak('I didn\'t catch that. Say "fix this" for suggestions.');
    });

    voice.addCommand('that is not what I meant', () => {
        VoiceUIController.undo();
        voice.speak('Reverted. What did you mean?');
    });

    voice.addCommand('fix this', () => {
        // Show repair UI
        voice.speak('Showing likely commands.');
    });
}
