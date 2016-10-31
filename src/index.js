let through = require('through2');
let gutil = require('gulp-util');
let PluginError = gutil.PluginError;
let akamaiweb = require('akamaiweb-kit/website');

// consts
const PLUGIN_NAME = 'gulp-akamaiweb';


class AkamaiWeb {
    constructor(config = {path:"~/.edgerc", section: "default"}) {
        this._akamaiweb = new akamaiweb.WebSite(config);
    }

    deployStaging(hostname, emailNotifications) {

        const activationNote = 'GULP Automatic update to STAGING';
        // Creating a stream through which each file will pass
        return through.obj((file, encoding, callback) => {

            if (file.isNull()) return callback(null, file);

            if (file.isStream()) {
                // file.contents is a Stream - https://nodejs.org/api/stream.html
                this.emit('error', new PluginError(PLUGIN_NAME, 'Streams not supported!'));
                //TODO:
            }
            else if (file.isBuffer()) {
                this._akamaiweb.update(hostname, file.contents)
                    .then(data => {
                        newVersion = data.propertyVersion;
                        return property.activate(hostname, newVersion, this._website.AKAMAI_ENV.STAGING, activationNote, emailNotifications);
                    })
                    .then(data => {
                        callback(null, file);
                    })
                    .catch(error => {
                        this.emit('error', new PluginError(PLUGIN_NAME, error.body ? error.body : error));
                    });
            }
        });

    }
    promoteStagingToProduction(hostname, emailNotifications) {
        const activationNote = 'GULP Automatic update to PRODUCTION';
        // Creating a stream through which each file will pass
        return through.obj((file, encoding, callback) => {
            this._akamaiweb.promoteStagingToProd(hostname, activationNote, emailNotifications)
                .then(data => {
                    callback(null, file);
                })
                .catch(error => {
                    this.emit('error', new PluginError(PLUGIN_NAME, error.body ? error.body : error));
                });
        });
    }

    testStaging(hostname, urls) {
        return through.obj((file, encoding, callback) => {
            callback(null, file);
        });
    }
}

module.exports = AkamaiWeb;