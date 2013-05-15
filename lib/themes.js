var fs = require('fs')
  , p = require('path')
  , noop = function(){}
  , iu = require('iai').iu
      .load('async utils')
  , inspect = require('util').inspect
;
/**
 * HELPERS
 *
 *
*/
// returns a function that helps TODO explain what does
function sourceHelper(opts) {
  return function source(theme_id) {
    return opts.source + p.join( opts.prefix, theme_id, 'info.json' );
  };
}

// returns a function that helps building theme urls
// absolute and external urls are not modified
function urlHelper(theme_id) {
  return function(source) {
    if( source[0] === '/' || source.search(/^https?:\/\//) > -1 ) {
      return source;
    }
    return p.join( opts.prefix, theme_id, source );
  };
}

function buildTheme(id, data) {
  if( typeof id !== 'string' || !id) {
    throw "Theme id must be a non empty string";
  }
  data = data || {};
  data.name = data.name || id;
  data.version = data.version || 1;
  data.url = urlHelper( id );
  data.scripts = data.scripts || [];
  data.stylesheets = data.stylesheets || [];
  return data;
}

/**
 * MIDDLEWARE GETTERS
 *
*/
module.exports = {
  themes: function(app, opts){
    app.set( 'iai themes', app.get('iai themes') || [] );

    opts = opts || {};
    opts.mode = 'local';
    opts.source = opts.source || null;
    opts.prefix = '/themes/';

    if( !opts.source ) {
      throw "Themes API need an absolute dir to search for available themes";
    }

    var source = sourceHelper(opts);

    app.getTheme = function(theme_id, callback, refresh){
      switch(opts.mode) {
        case 'local':
          var info_id = require.resolve( source(theme_id) );
          if( refresh === true ) {
            // ensure the theme info is fresh
            delete require.cache[info_id];
          }
          callback( require(info_id) );
          break;
        default:
          // TODO remote themes
          throw "Unsuported iai themes mode";
      }
      return app;
    };
    app.listThemes = function(callback){
      switch(opts.mode) {
        case 'local':
          fs.readdir( opts.source + opts.prefix, function(err, files){
            if( err ) {
              throw err;
            }
            callback( files );
          });
          break;
        default:
          // TODO remote themes
          throw "Unsuported iai themes mode";
      }
      return app;
    };

    return function(req, res, next) {
      // add iai themes local variable both on server views and client locals
      res.locals.themes = {};
      res.jlocals('active themes', []);
      res.jlocals('iai themes prefix', opts.prefix);

      // addTheme allows theme selection per request
      res.addTheme = function(id, data) {
//        console.log('add theme', id, data || 'from available themes');
        if( !data ) {
          switch( opts.mode ) {
            case 'local':
              data = require( source(id) );
              break;
            case 'remote':
            // TODO remote sources
            default:
              throw "Unsuported iai themes mode";
          }
        }
        res.locals.themes[id] = buildTheme( id, data );
        res.jlocals('active themes').push( id );
      };
      // application default themes are added to each request
      // when ussing local themes, they are cached by node's require logic
      var ids = app.get('iai themes');
      for( var i in ids ) {
        res.addTheme( ids[i] );
      }
      next();
    };
  }
  ,previews: function(opts){
    opts = opts || {};
    //opts.domain = /^previews\./;
    opts.theme = {
      'scripts': [ '/lib/iai-previews/widget.js' ],
      'stylesheets': [ '/lib/iai-previews/widget.css' ]
    }

    return function(req, res, next){
    //return iai.domain( opts.domain, function(req, res, next){
      // add preview toolbar scripts and styles
      res.addTheme( 'preview-toolbar', opts.theme );
      // add client local variables needed by toolbar script
      res.jlocals( 'iai themes available', {} );

      // list all available themes
      app.listThemes(function(theme_list){
        // each one in sequence...
        iu.sequence( theme_list, function(i, theme_id, next){
          // load the theme
          app.getTheme(theme_id, function(theme){
            // store the theme info object
            res.jlocals('iai themes available')[theme_id] = theme;
            // call the next item on the sequence
            next();
            // true = clean cache and get a fresh copy of the theme
          }, true);
          // after sequence is completed call next middleware function
        }, next );
      });
//    });
    };
  }
};
