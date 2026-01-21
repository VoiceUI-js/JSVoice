import { VoiceUIController } from '../../core/controller.js';

export default function createWidgetsPlugin(voice) {
    voice.addPatternCommand('create panel for {thing}', ({ thing }) => {
        VoiceUIController.createWidget('panel', thing);
        voice.speak(`Created panel for ${thing}`);
    });

    voice.addPatternCommand('add widget {type}', ({ type }) => {
        VoiceUIController.createWidget(type, 'New ' + type);
        voice.speak(`Added ${type} widget`);
    });

    voice.addPatternCommand('remove widget {name}', ({ name }) => {
        VoiceUIController.removeWidget(name);
        voice.speak(`Removed ${name}`);
    });

    voice.addPatternCommand('rename widget {from} to {to}', ({ from, to }) => {
        VoiceUIController.renameWidget(from, to);
        voice.speak(`Renamed widget`);
    });
}
