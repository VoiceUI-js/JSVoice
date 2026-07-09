/** @type { import('@storybook/react-vite').StorybookConfig } */
const config = {
  stories: ['../stories/**/*.stories.@(js|jsx|ts|tsx|mdx)'],
  addons: [],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  async viteFinal(config) {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      jsvoice: new URL('../src/index.js', import.meta.url).pathname,
      'jsvoice/react/kit': new URL('../src/react/kit/index.js', import.meta.url).pathname,
      'jsvoice/ui-kit': new URL('../src/ui-kit/index.js', import.meta.url).pathname,
    };
    // Windows path fix for fileURL
    if (process.platform === 'win32') {
      const path = await import('node:path');
      const { fileURLToPath } = await import('node:url');
      const root = path.dirname(fileURLToPath(import.meta.url));
      config.resolve.alias.jsvoice = path.resolve(root, '../src/index.js');
      config.resolve.alias['jsvoice/react/kit'] = path.resolve(root, '../src/react/kit/index.js');
      config.resolve.alias['jsvoice/ui-kit'] = path.resolve(root, '../src/ui-kit/index.js');
    }
    return config;
  },
};
export default config;
