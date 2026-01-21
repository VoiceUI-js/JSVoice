import { uikitStore } from '../../src/ui-kit/core/store';
import { VoiceUIController } from '../../src/ui-kit/core/controller';

describe('Voice UI Kit - Widgets Module', () => {
    beforeEach(() => {
        // Reset store before each test
        uikitStore.setState({ widgets: [] });
    });

    test('should create a widget with unique ID', () => {
        VoiceUIController.createWidget('graph', 'Revenue');
        const state = uikitStore.getState();

        expect(state.widgets.length).toBe(1);
        expect(state.widgets[0].name).toBe('Revenue');
        expect(state.widgets[0].type).toBe('graph');
        expect(state.widgets[0].id).toBeDefined();
    });

    test('should handle name collisions', () => {
        VoiceUIController.createWidget('graph', 'Revenue');
        VoiceUIController.createWidget('graph', 'Revenue');

        const state = uikitStore.getState();
        expect(state.widgets.length).toBe(2);
        expect(state.widgets[0].name).toBe('Revenue');
        expect(state.widgets[1].name).toBe('Revenue (1)');
    });

    test('should remove widget by name', () => {
        VoiceUIController.createWidget('graph', 'Revenue');
        VoiceUIController.removeWidget('Revenue');

        const state = uikitStore.getState();
        expect(state.widgets.length).toBe(0);
    });
});
