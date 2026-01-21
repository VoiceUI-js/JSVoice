import { VoiceUIController } from '../../core/controller.js';

export default function bookmarksPlugin(voice) {
    voice.addPatternCommand('bookmark this as {name}', ({ name }) => {
        VoiceUIController.saveBookmark(name);
        voice.speak('Bookmark saved.');
    });

    voice.addCommand('save this state', () => {
        VoiceUIController.saveBookmark('State ' + new Date().toLocaleTimeString());
        voice.speak('State saved.');
    });

    voice.addPatternCommand('jump to bookmark {name}', ({ name }) => {
        VoiceUIController.restoreBookmark(name);
        voice.speak('Restoring state.');
    });
}
