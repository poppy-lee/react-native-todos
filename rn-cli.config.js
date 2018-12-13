module.exports = {
  getTransformModulePath() {
    return require.resolve("react-native-typescript-transformer");
  },
  getSourceExts() {
    return ["js", "jsx", "ts", "tsx"];
  }
};