const { getDefaultConfig } = require("expo/metro-config");

module.exports = (() => {
  const config = getDefaultConfig(__dirname);

  const { transformer, resolver } = config;

  config.transformer = {
    ...transformer,
    babelTransformerPath: require.resolve("react-native-svg-transformer/expo")
  };
  config.resolver = {
    ...resolver,
    assetExts: [...resolver.assetExts.filter((ext) => ext !== "svg"), "glb", "gltf", "png", "jpg"],
    sourceExts: [...resolver.sourceExts, "svg", "mjs", "cjs"],
    unstable_enablePackageExports: true
  };

  return config;
})();
