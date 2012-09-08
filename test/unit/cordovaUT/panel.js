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

var jasmineEnv = jasmine.getEnv(),
    trivialReporter = new jasmine.TrivialReporter(),
    start = document.getElementById("unitTest-start"),
    startInfo = document.getElementById("unitTest-startInfo"),
    result = document.getElementById("unitTest-result"),
    info = document.getElementById("unitTest-Info"),
    flag = true;

jasmineEnv.updateInterval = 1000;
jasmineEnv.addReporter(trivialReporter);
jasmineEnv.specFilter = function (spec) {
    return trivialReporter.specFilter(spec);
};

start.addEventListener('click', function () {
    if (flag) {
        flag = !flag;
        result.style.display = "block";
        startInfo.innerHTML = "Restart";
        info.innerHTML = "Press Restart to reload the page to do the unit test again.<br/>";
        jasmineEnv.execute();
    } else {
        location.reload();
    }
});

module.exports = {
    panel: {
        domId: "unitTest-container",
        collapsed: true,
        pane: "left",
        titleName: "Unit Test",
        display: true
    }
};
