import { CommandManager } from '../../src/modules/CommandManager';

describe('CommandManager', () => {
    let manager;

    beforeEach(() => {
        manager = new CommandManager();
    });

    test('should register exact command', () => {
        const id = manager.register('hello world', jest.fn());
        expect(manager.commandRegistry.has(id)).toBe(true);
        expect(manager.exactCommands.get('hello world')).toHaveLength(1);
    });

    test('should register pattern command', () => {
        const id = manager.register('say {message}', jest.fn());
        expect(manager.commandRegistry.has(id)).toBe(true);
        expect(manager.patternCommands).toHaveLength(1);
    });

    test('should match exact command O(1)', async () => {
        const callback = jest.fn();
        manager.register('test command', callback);

        const result = await manager.process('test command', jest.fn());

        expect(result).toBe(true);
        expect(callback).toHaveBeenCalled();
    });

    test('should match pattern command', async () => {
        const callback = jest.fn();
        manager.register('volume to {val:number}', callback);

        const result = await manager.process('volume to 50', jest.fn());

        expect(result).toBe(true);
        expect(callback).toHaveBeenCalledWith(
            expect.objectContaining({ val: 50 }),
            expect.any(String),
            expect.any(String),
            expect.any(Function)
        );
    });

    test('should prioritize exact over pattern', async () => {
        const exactCb = jest.fn();
        const patternCb = jest.fn();

        manager.register('open settings', exactCb, { priority: 0 });
        manager.register('open {page}', patternCb, { priority: 0 });

        await manager.process('open settings', jest.fn());

        expect(exactCb).toHaveBeenCalled();
        expect(patternCb).not.toHaveBeenCalled();
    });

    test('should support Scope Stack', async () => {
        const globalCb = jest.fn();
        const menuCb = jest.fn();

        manager.register('help', globalCb, { scope: 'global' });
        manager.register('select', menuCb, { scope: 'menu' });

        // Global scope
        await manager.process('select', jest.fn());
        expect(menuCb).not.toHaveBeenCalled();

        // Push scope
        manager.pushScope('menu');
        await manager.process('select', jest.fn());
        expect(menuCb).toHaveBeenCalled();

        await manager.process('help', jest.fn());
        expect(globalCb).toHaveBeenCalled(); // Global always active

        // Pop scope
        manager.popScope();
        menuCb.mockClear();
        await manager.process('select', jest.fn());
        expect(menuCb).not.toHaveBeenCalled();
    });
});
