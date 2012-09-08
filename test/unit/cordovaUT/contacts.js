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

describe("cordova contacts bridge", function () {
	var _contacts = require('ripple/platform/cordova/2.0.0/bridge/contacts'),
		_default = [{
            "name": { formatted: "Brent Lintner" },
            "id": 1,
            "displayName": "Brent Lintner",
            "emails": [{ type: "work", value: "brent@tinyhippos.com", pref: false }]
        }, {
            "name": { formatted: "PJ Lowe" },
			"id": 2,
            "displayName": "PJ Lowe",
            "emails": [{ type: "work", value: "pj@tinyhippos.com", pref: false }]
        }, {
            "name": { formatted: "Dan Silivestru" },
			"id": 3,
            "displayName": "Dan Silivestru",
            "emails": [{ type: "work", value: "dan@tinyhippos.com", pref: false }]
        }, {
            "name": { formatted: "Gord Tanner" },
			"id": 4,
            "displayName": "Gord Tanner",
            "emails": [{ type: "work", value: "gord@tinyhippos.com", pref: true }]
        }, {
            "name": { formatted: "Mark McArdle" },
			"id": 5,
            "displayName": "Mark McArdle",
            "emails": [{ type: "work", value: "mark@tinyhippos.com", pref: false }]
        }],
		_navigator,
		_userContacts,
		db = require('ripple/db');

    function init() {
        beforeEach(function () {
            var _beforeFlag = false;

            _userContacts = db.retrieve("cordova-contacts");

            runs(function () {
                db.remove("cordova-contacts", "tinyhippos-", function () {
                    db.saveObject("cordova-contacts", _default, "tinyhippos-", function () {
                        _beforeFlag = true;
                    });
                }); 
            });
            waitsFor(function () {
                return _beforeFlag;
            }, "init cordova contacts", 500);
        });
    }

    function recover() {
        afterEach(function () {
            var _afterRFlag = false,
                _afterSFlag = false;

            runs(function () {
                db.remove("cordova-contacts", "tinyhippos-", function () {
                    _afterRFlag = true;
                });
            });
            waitsFor(function () {
                return _afterRFlag;
            }, "recover cordova contacts", 500);

            if (_userContacts) {
                runs(function () {
                    db.saveObject("cordova-contacts", _userContacts, "tinyhippos-", function () {
                        _afterSFlag = true;
                    });
                });
                waitsFor(function () {
                    return _afterSFlag;
                }, "recover cordova contacts", 500);
            }
        
        });
    }
		
	beforeEach(function () {
		_navigator = window.navigator;
        window.navigator = {
            contacts: { 
                create: jasmine.createSpy("navigator.contacts.create").andCallFake(function (obj) {
                    return obj;
                })
            }
        };  
    });

	afterEach(function () {
        window.navigator = _navigator;
    });

    describe("On search", function () {
        init();
        recover();

        it("when searching contacts without field args", function () {
            var success = jasmine.createSpy("success"),
                error = jasmine.createSpy("error"),         
                args = [[]];

            _contacts.search(success, error, args);

            expect(error).not.toHaveBeenCalled();
            expect(success).toHaveBeenCalled();
            expect(success.mostRecentCall.args[0].length).toEqual(0);
        });

        it("when searching contacts with one field arg", function () {
            var success = jasmine.createSpy("success"),
                error = jasmine.createSpy("error"),
                args    = [["displayName"], {}];

            _contacts.search(success, error, args);

            expect(error).not.toHaveBeenCalled();
            expect(success).toHaveBeenCalled();
            expect(success.mostRecentCall.args[0].length).toEqual(5);
            expect(success.mostRecentCall.args[0][0]["displayName"]).toEqual(_default[0]["displayName"]);
            expect(success.mostRecentCall.args[0][0]["id"]).toEqual(_default[0]["id"]);
            expect(success.mostRecentCall.args[0][0]["name"]).toEqual(undefined);
            expect(success.mostRecentCall.args[0][0]["emails"]).toEqual(undefined);
        });

        it("when searching contacts with more than one field args", function () {
            var success = jasmine.createSpy("success"),
                error = jasmine.createSpy("error"),
                args = [["name", "displayName"], {}];

            _contacts.search(success, error, args);

            expect(error).not.toHaveBeenCalled();
            expect(success).toHaveBeenCalled();
            expect(success.mostRecentCall.args[0].length).toEqual(5);
            expect(success.mostRecentCall.args[0][0]["displayName"]).toEqual(_default[0]["displayName"]);
            expect(success.mostRecentCall.args[0][0]["id"]).toEqual(_default[0]["id"]);
            expect(success.mostRecentCall.args[0][0]["name"]).toEqual(_default[0]["name"]);
            expect(success.mostRecentCall.args[0][0]["emails"]).toEqual(undefined);
        });

        it("when searching contacts with filer 'Brent' args", function () {
            var success = jasmine.createSpy("success"),
                error = jasmine.createSpy("error"),
                args = [["displayName"], {filter: "Brent"}];

            _contacts.search(success, error, args);
            expect(error).not.toHaveBeenCalled();
            expect(success).toHaveBeenCalled();
            expect(success.mostRecentCall.args[0].length).toEqual(1);
            expect(success.mostRecentCall.args[0][0]["displayName"]).toEqual(_default[0]["displayName"]);
            expect(success.mostRecentCall.args[0][0]["id"]).toEqual(_default[0]["id"]);
            expect(success.mostRecentCall.args[0][0]["name"]).toEqual(undefined);
            expect(success.mostRecentCall.args[0][0]["emails"]).toEqual(undefined);
        });

        it("when searching contacts with multiple[flase] args", function () {
            var success = jasmine.createSpy("success"),
                error = jasmine.createSpy("error"),
                args = [["displayName"], {filter: "", multiple: false}];
            
            _contacts.search(success, error, args);
            
            expect(error).not.toHaveBeenCalled();
            expect(success).toHaveBeenCalled();
            expect(success.mostRecentCall.args[0].length).toEqual(1);
            expect(success.mostRecentCall.args[0][0]["displayName"]).toEqual(_default[0]["displayName"]);
            expect(success.mostRecentCall.args[0][0]["id"]).toEqual(_default[0]["id"]);
            expect(success.mostRecentCall.args[0][0]["name"]).toEqual(undefined);
            expect(success.mostRecentCall.args[0][0]["emails"]).toEqual(undefined);
        });
            
        it("when searching contacts without args", function () {
            expect(_contacts.search).toThrow();
        });

    });

    describe("On save", function () {
        init();
        recover();
        
        it("when saving a new contact", function () {
            var success = jasmine.createSpy("success"),
                error = jasmine.createSpy("error"),
                _contact = {
                    "name": { formatted: "Anson Liao" },
                    "displayName": "Anson Liao",
                    "emails": [{ type: "work", value: "liaoty528@gmail.com", pref: false }]
                },
                args = [_contact];

            _contacts.save(success, error, args);
            
            expect(error).not.toHaveBeenCalled();
            expect(success).toHaveBeenCalled();
            expect(success.mostRecentCall.args[0]).toEqual(_contact);
        });

        it("when saving an already exist contact", function () {
            var success = jasmine.createSpy("success"),
                error = jasmine.createSpy("error"),
                _contact  = {
                    "name": { formatted: "Anson Liao" },
                    "id": 1,
                    "displayName": "Anson Liao",
                    "emails": [{ type: "work", value: "liaoty528@gmail.com", pref: false }]
				},
                args = [_contact];

            _contacts.save(success, error, args);
            
            expect(error).not.toHaveBeenCalled();
            expect(success).toHaveBeenCalled();
            expect(success.mostRecentCall.args[0]).toEqual(_contact);
        }); 

        it("when saving an illegal defined contact", function () {
            var success = jasmine.createSpy("success"),
                error = jasmine.createSpy("error"),
                _contact = {"age": 23},
                args = [_contact];

            _contacts.save(success, error, args);
 
            expect(error).not.toHaveBeenCalled();
            expect(success).toHaveBeenCalled();
            expect(success.mostRecentCall.args[0]).toEqual(_contact);
        });

        it("when saving a contact without error callback", function () {
            var success = jasmine.createSpy("success"),
                _contact = {
                    "name": { formatted: "Anson Liao" },
                    "displayName": "Anson Liao",
                    "emails": [{ type: "work", value: "liaoty528@gmail.com", pref: false }]
				},
                args = [_contact];

            _contacts.save(success, null, args);
     
            expect(success).toHaveBeenCalled();
            expect(success.mostRecentCall.args[0]).toEqual(_contact);
        });

        it("when saving a contact without args", function () {
			expect(_contacts.save).toThrow();
		});
    });
 
    describe("On remove", function () {
        init();
        recover();

        it("when removing a contact with a legal id", function () {
            var success = jasmine.createSpy("success"),
                error = jasmine.createSpy("error"),
                args = [1];

            _contacts.remove(success, error, args);
 
            expect(error).not.toHaveBeenCalled();
            expect(success).toHaveBeenCalled();
        });

        it("when removing a contact with an un-exist id", function () {
			var success = jasmine.createSpy("success"),
				error = jasmine.createSpy("error"),
				args = [6];

			_contacts.remove(success, error, args);

			expect(success).not.toHaveBeenCalled();
			expect(error).toHaveBeenCalledWith(jasmine.any(Object));
			expect(error.mostRecentCall.args[0]["code"]).toEqual(3);
        });

        it("when removing a contact without error callback", function () {
			var success  = jasmine.createSpy("success"),
				args = [1];

			_contacts.remove(success, null, args);

			expect(success).toHaveBeenCalled();
        });

        it("when removing a contact without args", function () {
			expect(_contacts.remove).toThrow();
		});
    });
});
