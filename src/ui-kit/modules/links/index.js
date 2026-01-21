import { VoiceUIController } from '../../core/controller.js';

export default function linksPlugin(voice) {
    voice.addPatternCommand('link {widgetA} to {widgetB}', ({ widgetA, widgetB }) => {
        VoiceUIController.linkWidgets(widgetA, widgetB);
        voice.speak(`Linked ${widgetA} to ${widgetB}`);
    });

    voice.addCommand('show links', () => {
        // Could toggle a visibility state in store
        voice.speak('Showing connection graph.');
    });

    voice.addPatternCommand('filter {widget} by {value}', ({ widget, value }) => {
        VoiceUIController.setWidgetFilter(widget, value);
        voice.speak(`Filtering ${widget} by ${value}`);
    });
}
