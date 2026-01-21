import { checkMicrophonePermission } from '../../src/modules/RecognitionManager';
import { microphoneManager } from '../../src/modules/MicrophoneManager';

// Mock the MicrophoneManager module
jest.mock('../../src/modules/MicrophoneManager', () => ({
    microphoneManager: {
        acquire: jest.fn(),
        release: jest.fn()
    }
}));

describe('RecognitionManager - Permission Check (Hotfix)', () => {
    let state;
    let updateStatus;
    let callCallback;

    beforeEach(() => {
        state = { _microphoneAllowed: false };
        updateStatus = jest.fn();
        callCallback = jest.fn();
        jest.clearAllMocks();
    });

    test('should call acquire() and release() on success', async () => {
        // Setup success mock
        microphoneManager.acquire.mockResolvedValue({ active: true });

        await checkMicrophonePermission(updateStatus, callCallback, state);

        // Verify acquire was called
        expect(microphoneManager.acquire).toHaveBeenCalledWith('permission-check');

        // Verify release was called (critical hotfix validation)
        expect(microphoneManager.release).toHaveBeenCalledWith('permission-check');

        // Verify state update
        expect(state._microphoneAllowed).toBe(true);
        expect(callCallback).toHaveBeenCalledWith('onMicrophonePermissionGranted');
    });

    test('should throw and update state on failure', async () => {
        const error = new Error('Permission denied');
        microphoneManager.acquire.mockRejectedValue(error);

        await expect(checkMicrophonePermission(updateStatus, callCallback, state))
            .rejects.toThrow('Permission denied');

        expect(microphoneManager.acquire).toHaveBeenCalled();
        expect(microphoneManager.release).not.toHaveBeenCalled(); // Should not release if acquire failed

        expect(state._microphoneAllowed).toBe(false);
        expect(callCallback).toHaveBeenCalledWith('onMicrophonePermissionDenied', error);
    });
});
