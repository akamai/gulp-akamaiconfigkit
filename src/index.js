let through = require('through2');
let gutil = require('gulp-util');
let PluginError = gutil.PluginError;
let akamaiweb = require('akamaiweb-kit/src/website');
// consts
const PLUGIN_NAME = 'gulp-akamaiweb';


class AkamaiWeb {
    constructor(config = {path:"~/.edgerc", section: "default"}) {
        this._akamaiweb = new akamaiweb.WebSite(config);
    }

    deployStaging(config = {host: 'www.example.com', emailNotifications: ['admin@example.com']}) {

        const activationNote = 'GULP Automatic update to STAGING';
        // Creating a stream through which each file will pass
        return through.obj((file, encoding, callback) => {

            if (file.isNull()) return callback(null, file);

            if (file.isStream()) {
                // file.contents is a Stream - https://nodejs.org/api/stream.html
                throw new PluginError(PLUGIN_NAME, 'Streams not supported!');
                //TODO:
            }
            else if (file.isBuffer()) {
                this._akamaiweb.updateFromFile(config.host, file.path)
                    .then(data => {
                        let newVersion = data.propertyVersion;
                        return this._akamaiweb.activate(config.host, newVersion, akamaiweb.AKAMAI_ENV.STAGING, activationNote, config.emailNotifications);
                    })
                    .then(data => callback(null, file))
                    .catch(error => {
                        callback(error, error.body);
                        throw new PluginError(PLUGIN_NAME, error.body ? error.body : error, error);
                    });
            }
        });

    }
    promoteStagingToProduction(config = {host: 'www.example.com', emailNotifications: ['admin@example.com']}) {
        const activationNote = 'GULP Automatic update to PRODUCTION';
        // Creating a stream through which each file will pass
        return through.obj((file, encoding, callback) => {
            this._akamaiweb.promoteStagingToProd(config.host, activationNote, config.emailNotifications)
                .then(data => {
                    callback(null, file);
                })
                .catch(error => {
                    callback(error, error.body);
                    throw new PluginError(PLUGIN_NAME, error.body ? error.body : error, error);
                });
        });
    }

    testStaging(config) {
        return through.obj((file, encoding, callback) => {
            callback(null, file);
        });
    }
}

module.exports = AkamaiWeb;