import { VoiceUIController } from '../../core/controller.js';

export default function rulesPlugin(voice) {
    voice.addPatternCommand('always show {condition}', ({ condition }) => {
        VoiceUIController.addRule(`Always show ${condition}`);
        voice.speak('Rule added.');
    });

    voice.addPatternCommand('never hide {condition}', ({ condition }) => {
        VoiceUIController.addRule(`Never hide ${condition}`);
        voice.speak('Rule added.');
    });

    voice.addPatternCommand('remove rule {name}', ({ name }) => {
        VoiceUIController.removeRule(name);
        voice.speak('Rule removed.');
    });

    voice.addCommand('list rules', () => {
        // Voice feedback listing would go here
        voice.speak('Listing active rules.');
    });
}
