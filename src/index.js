let through = require('through2');
let gutil = require('gulp-util');
let PluginError = gutil.PluginError;

// consts
const PLUGIN_NAME = 'gulp-akamaiweb';


class AkamaiWeb {
    constructor() {

    }

    function sample() {
        return through.obj(function(file, encoding, callback) {
            if (file.isNull()) {
                // nothing to do
                return callback(null, file);
            }

            if (file.isStream()) {
                // file.contents is a Stream - https://nodejs.org/api/stream.html
                this.emit('error', new PluginError(PLUGIN_NAME, 'Streams not supported!'));

                // or, if you can handle Streams:
                //file.contents = file.contents.pipe(...
                //return callback(null, file);
            } else if (file.isBuffer()) {
                // file.contents is a Buffer - https://nodejs.org/api/buffer.html
                this.emit('error', new PluginError(PLUGIN_NAME, 'Buffers not supported!'));

                // or, if you can handle Buffers:
                //file.contents = ...
                //return callback(null, file);
            }
        });
    };
}

module.exports =