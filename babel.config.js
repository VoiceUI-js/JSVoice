// babel.config.js
export default { // <-- Change 'module.exports =' to 'export default'
  presets: [
    ['@babel/preset-env', {
      targets: {
        node: 'current', // For Jest
        browsers: 'defaults' // For browser bundles
      },
      bugfixes: true,
      loose: true // Smaller output, but sometimes stricter spec adherence
    }]
  ]
};