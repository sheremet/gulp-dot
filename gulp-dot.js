module.exports = function(config) {
  'use strict';

  var stream = require('stream'),
      doT = require('dot'),
      gutil = require('gulp-util'),
      _ = require('lodash'),
      fs = require('fs'),
      path = require('path'),
      Transform = stream.Transform,
      dot = new Transform({objectMode: true}),
      PluginError = gutil.PluginError;

  config = config || {};
  _.extend({it: {}, def: {}}, config);

  if('object' === typeof config.templateSettings) {
    _.extend(doT.templateSettings, config.templateSettings);
  }

  dot._transform = function(file, encoding, next) {
    var compiled, str;

    if (file.isStream()) {
      this.emit(
        'error', new PluginError('gulp-dot', 'Streaming not supported')
      );
    } else if (file.isNull()) {
      this.push(file); // pass along
      return next();
    }

    if (config.hasOwnProperty('layout')) {
      _.extend(config.def, {content: file.contents});
      str = fs.readFileSync(config.layout);

      if ((new RegExp(path.basename(config.layout))).test(file.path)) {
        this.push(file);
        return next();
      }
    } else {
      str = file.contents;
    }

    compiled = doT.template(
      str,
      null,
      config.def
    );
    file.path = gutil.replaceExtension(file.path, '.html');
    file.contents = new Buffer(compiled(config.it));
    this.push(file);
    next();
  };

  return dot;
};
