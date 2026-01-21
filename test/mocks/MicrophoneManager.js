/**
 * Mock MicrophoneManager for testing
 */
export const microphoneManager = {
    acquire: jest.fn().mockResolvedValue({
        active: true,
        getTracks: () => [{ stop: jest.fn() }]
    }),
    release: jest.fn(),
    get isActive() { return true; },
    get activeOwners() { return ['test']; }
};
