/**
 * Help Mode Plugin
 * Provides a "help" command that reads out available commands for the current scope.
 */
export default function HelpPlugin(voice, options = {}) {
    const config = {
        trigger: 'help',
        readAloud: true,
        showVisual: false, // Future: Overlay
        intro: 'Here are the available commands:',
        ...options
    };

    voice.addCommand(config.trigger, () => {
        // Access commands (using same private access pattern as Fuzzy)
        const manager = voice._commandManager;
        if (!manager) return;

        const currentScope = manager.currentScope;
        const available = Array.from(manager.commands.values())
            .filter(cmd => cmd.scope === 'global' || cmd.scope === currentScope)
            .map(cmd => cmd.phrase);

        if (available.length === 0) {
            voice.speak('No commands available for this context.');
            return;
        }

        const text = `${config.intro} ${available.join(', ')}.`;

        if (config.readAloud) {
            voice.speak(text);
        }

        console.log('[JSVoice-Help]', text);

        if (voice.options.onTelemetry) {
            voice.options.onTelemetry({ type: 'help_invoked', scope: currentScope, count: available.length });
        }
    });
}
