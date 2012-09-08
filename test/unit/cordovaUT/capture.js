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

describe("cordova capture bridge", function () {
    var _camera = require('ripple/platform/cordova/2.0.0/bridge/capture'), 
		_file   = ["cordovaCaptureUt.TXT", {fullPath: ""}],
        camera  = require('ripple/ui/plugins/camera'),
		event   = require('ripple/event');

    beforeEach(function () {
        spyOn(camera, "show").andReturn(1);
    });

    describe("On captureImage", function () {
        it("when capturing pictures with on specifying args", function () {
            var success = jasmine.createSpy("success"),
                error   = jasmine.createSpy("error");

            _camera.captureImage(success, error);
            expect(camera.show).toHaveBeenCalled();
			event.trigger("captured-image", _file, true);
			expect(error).not.toHaveBeenCalled();
			expect(success).toHaveBeenCalled();
			expect(success.mostRecentCall.args[0][0].fullPath).toEqual(_file[0]);
		});

		it("when capturing pictures without error callback", function () {
			var success = jasmine.createSpy("success");

			_camera.captureImage(success);
            expect(camera.show).toHaveBeenCalled();
			event.trigger("captured-image", _file, true);
			expect(success).toHaveBeenCalled();
			expect(success.mostRecentCall.args[0][0].fullPath).toEqual(_file[0]);
		});
    });
});

