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

describe("cordova camera bridge", function () {
    var _camera = require('ripple/platform/cordova/2.0.0/bridge/camera'), 
		_file = ["cordovaCameraUt.TXT", {fullPath: ""}],
        camera = require('ripple/ui/plugins/camera'),
		event = require('ripple/event');

    beforeEach(function () {
        spyOn(camera, "show").andReturn(1);
    });

    describe("On takePicture", function () {
        it("when taking pictures with specifying args", function () {
            var success = jasmine.createSpy("success"),
                error = jasmine.createSpy("error");

            _camera.takePicture(success, error);

            expect(camera.show).toHaveBeenCalled();
            event.trigger("captured-image", _file, true);
            expect(success).toHaveBeenCalled();
            expect(success.mostRecentCall.args[0]).toEqual(_file[0]);
		});

		it("when taking pictures without error callback", function () {
			var success = jasmine.createSpy("success");

			_camera.takePicture(success);

			expect(camera.show).toHaveBeenCalled();
			event.trigger("captured-image", _file, true);
			expect(success).toHaveBeenCalled();
			expect(success.mostRecentCall.args[0]).toEqual(_file[0]);
		});
    });

	describe("On cleanup", function () {
		it("when cleaning up without args", function () {
			expect(_camera.cleanup).toThrow();
		});

		it("when cleaning up with success callback", function () {
			var success = jasmine.createSpy("success"),
                error = jasmine.createSpy("error"),
				args = [];

			_camera.cleanup(success, error, args);

			expect(success).toHaveBeenCalled();
			expect(error).not.toHaveBeenCalled();
		});
	});
});

