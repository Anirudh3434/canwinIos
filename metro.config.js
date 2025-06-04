const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

defaultConfig.resolver.sourceExts = [...defaultConfig.resolver.sourceExts, 'ts', 'tsx'];

module.exports = mergeConfig(defaultConfig, {
  resolver: {
    blacklistRE: /node_modules\/.*\/node_modules\/react-native\/.*/,
  },
});
