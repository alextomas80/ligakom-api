const requireContext = require.context("./", false, /.*\.(js)$/);

let components = {};

requireContext.keys().forEach((fileName) => {
  if (fileName === "./index.js") return;
  let name = fileName.replace(/(\.\/|\.js)/g, "");
  components[name] = requireContext(fileName).default;
});

module.exports = components;
