var iu = require('iai').iu

module.exports = {
  /**
   * domain: selective middleware based on request's host
   */
  domain: function(domain, fn){
    return function(req, res, next){
      // do nothing if host does not match domain
      // call fn elsecase
      if( !~req.host.search( domain ) ) {
        return next();
      }
      fn(req, res, next);
    };
  },
  /**
   * delay: useful for delaying request responses
   */
  delay: function(time){
    return function(req, res, next){
      setTimeout(next, time || 1000);
    }
  },
  /**
   * jlocals: sets local variable that stores a "locals" api
   *          and eases direct data dump to client on views.
   */
  jlocals: function(local_name) {
    local_name = local_name || 'js_locals';

    return function(req, res, next){
      res.jlocals = res.locals[local_name] = jlocals();
      res.jlocals.dump = function(){
        var data = {}, key;
        for( key in this ) {
          data[key] = this[key]
        }
        return data;
      };
      res.jlocals.dumpJSON = function(){
        return JSON.stringify( this.dump() );
      };
      res.jlocals( 'env', res.app.settings.env );
      next();
    };
  }
};

/**
 * get a jlocals api bound to the given object
 */
function jlocals() {
/**
   @function jlocals( {String} var_name, {Mixed} var_value )
     Stores var_value on jlocals[var_name]
   @function jlocals( {Hash} variables )
     Stores on jlocals each value in variables, assigned to its key
     @returns null
   @function jlocals( {String} var_name )
     @returns reference to jlocals[var_name]
  */
  function jlocals(a1, a2){
    if( arguments.length == 2 ) {
      return jlocals[a1] = a2;
    }
    if( iu.isLiteral(a1) ){
      for( var key in a1 )
        jlocals[key] = a1[key];
        return;
      }
      return jlocals[a1];
    };
  return jlocals;
}
