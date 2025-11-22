// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// CRITICAL: projectRoot must be the mobile app directory, not workspace root
const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// CRITICAL: Explicitly set project root - Metro must use apps/mobile, not workspace root
config.projectRoot = projectRoot;

// Watch folders - include workspace for dependencies but don't let it become the root
config.watchFolders = [projectRoot, workspaceRoot];

// Resolve node_modules - prioritize project root, then workspace
config.resolver.nodeModulesPaths = [
    path.resolve(projectRoot, 'node_modules'),
    path.resolve(workspaceRoot, 'node_modules'),
];

// Add workspace package resolution
config.resolver.extraNodeModules = {
    '@business-app/types': path.resolve(workspaceRoot, 'packages/types/dist'),
};

// Ensure Metro resolves modules correctly
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

// CRITICAL: Disable package exports to prevent pnpm ES module resolution issues
config.resolver.unstable_enablePackageExports = false;

// Enable symlinks for pnpm
config.resolver.unstable_enableSymlinks = true;

// Enable CSS support for web
config.transformer.unstable_allowRequireContext = true;

module.exports = config;
