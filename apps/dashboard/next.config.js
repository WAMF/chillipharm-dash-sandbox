const { composePlugins, withNx } = require('@nx/next');

const nextConfig = {
    output: 'export',
    distDir: 'out',
    nx: {
        svgr: false,
    },
    transpilePackages: [
        '@cp/types',
        '@cp/firebase',
        '@cp/api-client',
        '@cp/data-processing',
        '@cp/export',
        '@cp/ui',
    ],
};

const plugins = [withNx];

module.exports = composePlugins(...plugins)(nextConfig);
