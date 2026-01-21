import { VoiceUIController } from '../../core/controller.js';

export default function undoPlugin(voice) {
    voice.addCommand('undo last action', () => {
        if (!VoiceUIController.undo()) {
            voice.speak('Nothing to undo.');
        } else {
            voice.speak('Undone.');
        }
    });

    voice.addPatternCommand('undo only {category}', ({ category }) => {
        // e.g., "undo only widgets"
        if (!VoiceUIController.undo(category)) {
            voice.speak(`Nothing to undo in category ${category}.`);
        } else {
            voice.speak(`Undid last ${category} action.`);
        }
    });
}
