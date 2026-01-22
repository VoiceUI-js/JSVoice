/**
 * Hotkeys Plugin
 * Adds "Push-to-Talk" and keyboard shortcuts to control voice.
 * 
 * Options:
 * - pushToTalkKey: 'Space' (default null)
 * - toggleKey: 'KeyV' (default null)
 * - preventDefault: true
 */
export default function HotkeysPlugin(voice, options = {}) {
    const config = {
        pushToTalkKey: null, // e.g. 'Space'
        toggleKey: null,     // e.g. 'Control+Space'
        preventDefault: true,
        ...options
    };

    if (typeof globalThis.window === 'undefined') return;

    let isKeyDown = false;

    function handleKeyDown(e) {
        if (e.repeat) return;

        // Push to Talk
        if (config.pushToTalkKey && matchesKey(e, config.pushToTalkKey)) {
            if (config.preventDefault) e.preventDefault();
            isKeyDown = true;
            if (!voice.isListening) {
                console.log('[JSVoice-Hotkeys] Push-to-Talk Active');
                voice.start();
            }
            return;
        }

        // Toggle
        if (config.toggleKey && matchesKey(e, config.toggleKey)) {
            if (config.preventDefault) e.preventDefault();
            voice.toggle();
        }
    }

    function handleKeyUp(e) {
        if (config.pushToTalkKey && matchesKey(e, config.pushToTalkKey)) {
            if (isKeyDown) {
                isKeyDown = false;
                if (voice.isListening) {
                    console.log('[JSVoice-Hotkeys] Push-to-Talk Released');
                    voice.stop();
                }
            }
        }
    }

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    // Cleanup method exposed to voice instance if needed? 
    // Plugins usually don't have a standardized cleanup lifecycle in v1 core.
    // We can attach a teardown method.
    voice.hotkeys = {
        destroy: () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('keyup', handleKeyUp);
        }
    };

    function matchesKey(event, keyConfig) {
        // Simple code match: 'Space', 'Control+Space'
        // If config includes '+', split modifiers
        const parts = keyConfig.split('+');
        const code = parts.pop();

        const ctrl = parts.includes('Control') || parts.includes('Ctrl');
        const shift = parts.includes('Shift');
        const alt = parts.includes('Alt');
        const meta = parts.includes('Meta') || parts.includes('Cmd');

        // Check Modifiers
        if (ctrl !== event.ctrlKey) return false;
        if (shift !== event.shiftKey) return false;
        if (alt !== event.altKey) return false;
        if (meta !== event.metaKey) return false;

        // Check Code
        // 'Space' -> event.code === 'Space'
        // 'v' -> event.key === 'v' or code 'KeyV'

        // Flexible check
        if (event.code === code) return true;
        if (event.key.toLowerCase() === code.toLowerCase()) return true;

        return false;
    }
}
