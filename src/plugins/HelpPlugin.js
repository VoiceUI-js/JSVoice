/**
 * Help Mode Plugin
 * Provides a "help" command that reads out available commands for the current scope.
 * Uses public voice.listCommands() API.
 */
export default function HelpPlugin(voice, options = {}) {
    const config = {
        trigger: 'help',
        readAloud: true,
        showVisual: false,
        intro: 'Here are the available commands:',
        ...options
    };

    voice.addCommand(config.trigger, () => {
        const currentScope = voice.currentScope || 'global';
        const list = typeof voice.listCommands === 'function' ? voice.listCommands() : [];
        const available = list
            .filter((cmd) => cmd.scope === 'global' || cmd.scope === currentScope)
            .map((cmd) => cmd.phrase);

        if (available.length === 0) {
            voice.speak('No commands available for this context.');
            return;
        }

        const text = `${config.intro} ${available.join(', ')}.`;

        if (config.readAloud) {
            voice.speak(text);
        }

        if (typeof console !== 'undefined') {
            console.log('[JSVoice-Help]', text);
        }

        if (voice.options.onTelemetry) {
            voice.options.onTelemetry({
                type: 'help_invoked',
                scope: currentScope,
                count: available.length,
            });
        }
    });
}
