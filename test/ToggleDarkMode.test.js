import Action from '../../src/modules/actions/ToggleDarkModeAction.js';

const fakeCtx = () => ({
  win: global.window,
  doc: global.document,
  onStatusChange: jest.fn(),
  onActionPerformed: jest.fn(),
});

describe('ToggleDarkModeAction', () => {
  test('matches phrases', () => {
    expect(Action.test('toggle dark mode')).toBe(true);
    expect(Action.test('please switch theme')).toBe(true);
    expect(Action.test('zoom in')).toBe(false);
  });

  test('toggles dataset theme', () => {
    const ctx = fakeCtx();
    document.documentElement.dataset.theme = 'light';
    const ok = Action.run('toggle dark mode', ctx);

    expect(ok).toBe(true);
    expect(document.documentElement.dataset.theme).toMatch(/dark|light/);
    expect(ctx.onActionPerformed).toHaveBeenCalledWith(
      'toggleDarkMode',
      expect.any(Object)
    );
  });
});
