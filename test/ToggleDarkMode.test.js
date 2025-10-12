import { handleDarkMode } from '../src/modules/actions/ToggleDarkModeAction.js';

describe('ToggleDarkModeAction', () => {
  test('matches phrases', () => {
    const updateStatus = jest.fn();
    const callCallback = jest.fn();
    
    // Test toggle dark mode
    expect(handleDarkMode('toggle dark mode', updateStatus, callCallback)).toBe(true);
    expect(callCallback).toHaveBeenCalledWith('onActionPerformed', 'toggleDarkMode', 'dark');
    
    // Test switch theme
    callCallback.mockClear();
    expect(handleDarkMode('please switch theme', updateStatus, callCallback)).toBe(true);
    expect(callCallback).toHaveBeenCalledWith('onActionPerformed', 'toggleDarkMode', expect.any(String));
    
    // Test non-matching phrase
    callCallback.mockClear();
    expect(handleDarkMode('zoom in', updateStatus, callCallback)).toBe(false);
    expect(callCallback).not.toHaveBeenCalled();
  });

  test('toggles dataset theme', () => {
    const updateStatus = jest.fn();
    const callCallback = jest.fn();
    
    document.documentElement.dataset.theme = 'light';
    const result = handleDarkMode('toggle dark mode', updateStatus, callCallback);

    expect(result).toBe(true);
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(callCallback).toHaveBeenCalledWith('onActionPerformed', 'toggleDarkMode', 'dark');
  });
});
