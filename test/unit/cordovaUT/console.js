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

describe("cordova console bridge", function () {
    var _console = require('ripple/platform/cordova/2.0.0/bridge/console');
    
    beforeEach(function () {
        spyOn(console, "log").andCallThrough();
    });

    describe("On log", function () {
        it("when logging successfully with array args", function () {
            var w = jasmine.createSpy("win"),
                f = jasmine.createSpy("fail"),
                args = ["print in the console", "lty", "wxm", "sl"];

            _console.log(w, f, args);
            expect(console.log).toHaveBeenCalledWith(args[0]);
        });

        it("when logging with string args", function () {
            var w = jasmine.createSpy("win"),
                f = jasmine.createSpy("fail"),
                args = "print string";

            _console.log(w, f, args);
            expect(console.log).toHaveBeenCalledWith('p');   
        }); 

        it("when logging with number args", function () {
            var w = jasmine.createSpy("win"),
                f = jasmine.createSpy("fail"),
                args = 2012;

            _console.log(w, f, args);
            expect(console.log).toHaveBeenCalledWith(undefined);
        });

        it("when logging with object args", function () {
            var w = jasmine.createSpy("win"),
                f = jasmine.createSpy("fail"),
                args = {name: "lty", age: "23"};

            _console.log(w, f, args);
            expect(console.log).toHaveBeenCalledWith(undefined);
        });
    });
});
