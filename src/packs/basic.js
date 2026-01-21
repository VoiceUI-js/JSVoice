/**
 * Command Pack: Navigation
 */
export const NavigationPack = {
    install(voice) {
        voice.addCommand('go back', () => window.history.back());
        voice.addCommand('go forward', () => window.history.forward());
        voice.addCommand('reload page', () => window.location.reload());
        voice.addCommand('scroll down', () => window.scrollBy({ top: 500, behavior: 'smooth' }));
        voice.addCommand('scroll up', () => window.scrollBy({ top: -500, behavior: 'smooth' }));
        voice.addCommand('scroll to top', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
        voice.addCommand('scroll to bottom', () => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }));
    }
};

/**
 * Command Pack: Form Control
 */
export const FormPack = {
    install(voice) {
        voice.addPatternCommand('focus on {field}', ({ field }) => {
            // Fuzzy search for placeholder, id, or label
            const inputs = document.querySelectorAll('input, textarea');
            for (const input of inputs) {
                const id = input.id.toLowerCase();
                const name = input.name?.toLowerCase();
                const placeholder = input.placeholder?.toLowerCase();
                const term = field.toLowerCase();

                if (id.includes(term) || name?.includes(term) || placeholder?.includes(term)) {
                    input.focus();
                    voice.speak(`Focusing ${field}`);
                    return;
                }
            }
        });

        voice.addCommand('submit form', () => {
            const activeForm = document.activeElement?.closest('form');
            if (activeForm) activeForm.submit();
        });
    }
};

/**
 * Command Pack: Media Control
 */
export const MediaPack = {
    install(voice) {
        voice.addCommand('play', () => document.querySelectorAll('video, audio').forEach(m => m.play()));
        voice.addCommand('pause', () => document.querySelectorAll('video, audio').forEach(m => m.pause()));
        voice.addCommand('mute', () => document.querySelectorAll('video, audio').forEach(m => m.muted = true));
        voice.addCommand('unmute', () => document.querySelectorAll('video, audio').forEach(m => m.muted = false));
    }
};
