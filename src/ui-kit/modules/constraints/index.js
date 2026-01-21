import { VoiceUIController } from '../../core/controller.js';

export default function constraintsPlugin(voice) {
    voice.addPatternCommand('pin {widget}', ({ widget }) => {
        VoiceUIController.addConstraint(widget, 'pin');
        voice.speak(`${widget} pinned.`);
    });

    voice.addPatternCommand('keep {widget} always visible', ({ widget }) => {
        VoiceUIController.addConstraint(widget, 'pin');
        voice.speak(`${widget} is now always visible.`);
    });

    voice.addPatternCommand('unpin {widget}', ({ widget }) => {
        VoiceUIController.removeConstraint(widget, 'pin');
        voice.speak(`${widget} unpinned.`);
    });
}
