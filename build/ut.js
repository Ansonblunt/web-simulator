/*
 *  Copyright 2011 Research In Motion Limited.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var fs = require('fs'),
    jWorkflow = require('jWorkflow'),
    childProcess = require('child_process'),
    _conf = require('./build/conf'),
    _path = require('path');

function matches(type) {
    return function (path) {
        return path.match(new RegExp(type + "$"));
    };
}

function collect(path, files, matches) {
    matches = matches || function (path) {
        return path.match(/\.js$/);
    };

    if (fs.statSync(path).isDirectory()) {
        fs.readdirSync(path).forEach(function (item) {
            collect(_path.join(path, item), files, matches);
        });
    } else if (matches(path)) {
        files.push(path);
    }
}

module.exports = function () {
    var unitTest = [],
        src = {
            js: ""
        },
        _utOutput; 
    collect(_conf.CORDOVAUT, unitTest);
    src.js = unitTest.reduce(function (buffer, file) {
                        return buffer + fs.readFileSync(file, "utf-8");
                    }, "");
    _utOutput = fs.openSync('./lib/ripple/ui/plugins/unitTest.js', 'w+');   
    fs.writeSync(_utOutput, src.js); 

    require('./build')(null, {isTest: true});
};












