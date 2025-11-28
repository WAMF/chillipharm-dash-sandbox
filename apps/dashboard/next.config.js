const { composePlugins, withNx } = require('@nx/next');

const nextConfig = {
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
