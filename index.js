// Copyright 2017 Akamai Technologies, Inc. All Rights Reserved
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

let through = require('through2');
let gutil = require('gulp-util');
let PluginError = gutil.PluginError;
let WebSite = require('AkamaiConfig-kit').WebSite;
// consts
const PLUGIN_NAME = 'gulp-WebSite';


class AkamaiWeb {
    constructor(config = {path:"~/.edgerc", section: "default"}) {
        this._akamaiconfigkit = new WebSite(config);
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
                this._akamaiconfigkit.updateFromFile(config.host, file.path)
                    .then(data => {
                        let newVersion = data.propertyVersion;
                        return this._akamaiconfigkit.activate(config.host, newVersion, WebSite.AKAMAI_ENV.STAGING, activationNote, config.emailNotifications);
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
            this._akamaiconfigkit.promoteStagingToProd(config.host, activationNote, config.emailNotifications)
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
