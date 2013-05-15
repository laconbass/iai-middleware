var iu = require('iai-util')
  , u = require('util');

module.exports = function serverWare(server) {
  // TODO replace isArray check with instanceof check.
  // TODO to do this must exist a ¿Server,Controller? class
  // if( !(server instanceof ¿Server?) )
    //throw new TypeError('expecting ¿Server? instance');
  // check server defines methods
  if( !u.isArray(server.METHODS) )
    throw new TypeError('expecting server.METHODS to be an array');

  return function(req, res, next) {
    // allow only server.METHODS as req.method
    if( server.METHODS.indexOf(req.method) < 0 )
      return res.die(405, '', {'Allow': server.METHODS.join(', ')});

    var hs = [];
    function sware_next(e) {
      // if server does not emit 'resolved' or 'error' before completing the request, this function is executed twice
      //console.log('error to next middleware:',e.status, e.message);
      next(e);
    }
    function sware_rm_listeners(e) {
      //console.log('remove bound listeners');
      for(k in hs)
        this.removeListener(hs[k].e, hs[k].f);
    }
    // handlers
    hs = [
       { e: 'error', f: sware_next }
      ,{ e: 'error', f: sware_rm_listeners }
      ,{ e: 'resolved', f: sware_rm_listeners }
    ];
    // server chain
    server.ready(function(){
      //console.log('bind listeners');
      for(k in hs) this.once(hs[k].e, hs[k].f);
      //console.log('resolve...');
      this.resolve(req, res);
    });
    ;
  };
};
