// as simple as shortcuts to middleware
module.exports = require('./lib/reqres-mods')

var old = {
  reqresmods: require('./lib/reqres-mods')
  ,subdomain2module: require('./lib/subdomain2module')
  ,execLayout: require('./lib/exec-layout')
  ,serverware: require('./lib/server-ware')
};
