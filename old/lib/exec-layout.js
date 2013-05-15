var u = require('util');
// @name (string): the layout name
module.exports = function(layout) {
  return function(req, res, next) {
    var domain = req.headers.host.split('.');
    res.redirect(u.format(
      'http://%s.%s', layout, domain.slice(-2).join('.')  ));
  }
};
