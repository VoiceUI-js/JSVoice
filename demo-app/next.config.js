/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ['jsvoice'],
    webpack: (config) => {
        // Ignore node-specific modules in the browser
        config.resolve.alias = {
            ...config.resolve.alias,
            'onnxruntime-node': false,
            'sharp': false,
            '@xenova/transformers': require.resolve('@xenova/transformers')
        };
        return config;
    },
    // Sometimes needed for transformers.js
    experimental: {
        serverComponentsExternalPackages: ['@xenova/transformers', 'sharp'],
    }
};

module.exports = nextConfig;
