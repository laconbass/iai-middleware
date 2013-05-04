//var SectionServer = require('iai-sections');

module.exports = function(root_path) {
  var server = new SectionServer(sections_path)
  return function(req, res, next) {
    server.ready(function(){
      this.resolve(req, res, next);
    });
  };
};
