/** @type { import('@storybook/react').Preview } */
const preview = {
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: '#0b0d12' },
        { name: 'light', value: '#f6f7fb' },
      ],
    },
  },
};

export default preview;
