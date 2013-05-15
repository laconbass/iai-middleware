var iai = require('iai')
;
module.exports = new iai.IaiComponent(__filename, {
  'utils': './misc',
  'ajax navigation': './navigation',
  'ui themes': './themes'
});
