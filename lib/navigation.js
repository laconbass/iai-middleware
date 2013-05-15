module.exports = {
  ajaxnav: function(){
    // opts: 'base-fill' 'xhr-fn'
    return function(req, res, next){
      res.irender = function(view, locals){
        res.render(view, locals, function(err, html){
          if(err) {
            console.error(err);
            html = '<pre>'+err+'</pre>';
          }
          if(req.xhr)
            res.send(200, {
              schema: "iai-nav"
              ,html: html
              ,scripts: res.locals.js_includes
            });
          else
            res.render('base-fill', { html: html });
        });
      };
      next();
    };
  }
};
