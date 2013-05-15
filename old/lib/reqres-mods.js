var u = require('util')
  , http = require('http')
;
// Exports middleware function that executes all modifiers
module.exports = function(req, res, next) {
  for(var k in modifiers) { modifiers[k](req, res); }
  if('function'==typeof next) next();
}
/*
  Modifiers are middleware functions that extend request
  or response objects, adding properties or methods.
  They do not receive the next param
*/
var modifiers = [
  /*
    request.subdomains (array): Info about requested subdomains.
      Note the following:
        - The main domain part is striped
        - The subdomain order is reversed
      Example:
        a.b.c.d.example.com => ['d', 'c', 'b', 'a']
  */
  function(req, res) {
    if (!req.headers.host) return;
    req.main_hostname = req.headers.host
      .split('.') 
      .slice(-2)
      .join('.');
    req.subdomains = req.headers.host
      .split('.')
      .slice(0, -2)
      .reverse();
  }
  /*
    request.redirect (function): ends request with a location header
  */
  ,function(req, res) {
    res.redirect = function(uri, mode) {
      mode = mode || 302;
      this.die(mode, (req.method=='HEAD')?
       '':u.format('redirecting to <a href="%s">%s</a>', uri)
       ,{ 'Location': uri });
    };
  }
  /*
    response.die (function): Ends a request, given a status code.
      @code (integer): Http status code (must exist on http.STATUS_CODES)
      @message (string): Optional. The response body
      @headers (object): Optional. key:value map with headers to be sent
  */
  ,function(req, res) {
    res.die = function(code, message, headers) {
      if(!http.STATUS_CODES[code])
        throw new Error("http code "+code+" doesn't exist");
      headers = headers || {};
      headers['Connection'] = 'close';
      res.writeHead(code, headers);
      res.write(message? message+'\n':'');
      res.end();
    }
  }
];
