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

describe("cordova device bridge", function () {
    var _device = require('ripple/platform/cordova/2.0.0/bridge/device'), 
        devices = require('ripple/devices');

    beforeEach(function () {
        spyOn(devices, "getCurrentDevice").andReturn({osName: "ios", name: "phoneName", osVersion: "5.1.1", uuid: "2012"});
    });

    it("when getting the device info", function () {
        var s = jasmine.createSpy("success"),
            f = jasmine.createSpy("fail"),
            args = [];

        _device.getDeviceInfo(s, f, args);

        expect(s).toHaveBeenCalled();
    });
});

