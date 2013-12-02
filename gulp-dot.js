module.exports = function (options) {

  var es = require('event-stream'),
      doT = require('dot'),
      util = require('gulp-util'),
      glob = require('glob'),
      path = require('path'),
      fs = require('fs'),
      def = {},
      compile;

  options = options || {};

  if (options.def) {
    var defs = glob.sync(options.def);

    for (var i=0; i<defs.length; i++) {
      def[path.basename(defs[i], '.def')] = fs.readFileSync(defs[i]);
    }
  }

  compile = function (file, cb) {
    file.shortened = util.replaceExtension(file.shortened, '.html');
    file.contents = new Buffer(doT.template(file.contents, options.templateSettings, def)(options.data));

    cb(null, file);
  };

  return es.map(compile);
};
