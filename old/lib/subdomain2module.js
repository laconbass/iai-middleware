var path = require('path')
  , util = require('util')
  , iaiu = require('iai-util')
  , iaifs = require('iai-fs')
  , ParentClass = require('iai-core').ParentClass
  , Path = iaifs.Path
  , Folder = iaifs.Folder
  , PathStructure = iaifs.PathStructure
  , ModuleLoader = iaifs.ModuleLoader
;
/*
  Map subdomain requests to user-defined middleware modules
  The module must be called in order to receive the middleware function
  @root (string): Path reference where the modules may exists
*/
module.exports = function(root) {
  if(!root) throw new Error("need a root directory to search on");

  var loader = new ModuleLoader(root);

  return function(req, res, next){
    // skip no-subdomain requests
    if(!req.subdomains.length) return next();
    loader.ready(function(){
      this.require(
        name = req.subdomains.join(path.sep)
        ,function(domain){ 
          switch(typeof domain) {
          case 'function':
            return domain(req, res, next);
          case 'object': break;
          default:
            throw new Error("Unexpected domain type");
          }
          switch(domain.classname) {
          case 'HtmlView': 
            return res.die(200, domain.render(), {
              'Content-Type': 'text/html;charset=utf-8'
            });
          }
          next( iaiu.httpError(500, "unknown domain class <"+
            domain.constructor.name+">") );
        }
        ,function(err){ 
          if(err) next(err);
          next( iaiu.httpError(404, "domain not found") );
        }
      );
    });
    return;
    // validate root directory
    new Folder(root, function(dir){
        // if root is ok, look for a folder-module
        new PathStructure(
          dir.join(name = req.subdomains.join(path.sep)),
          ['index.js'],
          function require_module(structure) {
            // folder-module found, require and call
            require(structure.root.path)(req, res, next);
          }, function(err) {
            // folder-module not found, look for a *.js file-module
            new Path(dir.join(name+'.js'), function(path){
                // *.js file-module found, require and call
                fn = require(path.path);
                if('function'==typeof fn) return fn(req, res, next);
                next(iaiu.httpError(500,"'"+name+"' module must export a function"));
            }, function() {// if *.js file-module not found
                // look for *.json or something?
            });
        });
      }, function(){ // if root isn't a directory
        next( iaiu.httpError(500, "root folder must be a directory") );
      }, function(){ // if root doesn't exist
        next( iaiu.httpError(500, "root folder doesn't exist") );
    });
    
    // create layout & launch it
/*    new Layout(store[0], function(err, layout) {
      if(err) return next(err);
      return layout.bootstrap(req, res, next);
    });*/
  };
};
