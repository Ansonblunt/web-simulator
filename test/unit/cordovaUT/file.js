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

describe("cordova file bridge", function () {
    var _file = require('ripple/platform/cordova/2.0.0/bridge/file'),
        topCordova = require('ripple/platform/cordova/2.0.0/spec'),
        flag   = false,
        result = {};

    function initFile() {
        beforeEach(function () {
            var _beforeFlag = false;
 
            runs(function () {
                _file.write(function () {
                    _beforeFlag = true;
                }, null, [{name: "/ut.txt"}, "this is a test for writing a file"]);
            });
            waitsFor(function () {
                return _beforeFlag;
            }, "file init", 200);
        });
    }

    function unInitFile() {
        afterEach(function () {
            var _afterFlag = false;

			flag   = false;
			result = {};

            runs(function () {
                _file.remove(function () {
                    _afterFlag = true;
                }, null, ["/ut.txt"]);
            });
            waitsFor(function () {
                return _afterFlag;
            }, "file uninit", 200);
		});
    }

    function initDir() {
        beforeEach(function () {
            var _beforeFlag = false;

            runs(function () {
                _file.getDirectory(function () {
                    _beforeFlag = true;
                }, null, ["/", "Document", {create: true}]);
            });
            waitsFor(function () {
                return _beforeFlag;
            }, "directory init", 200);
        });
    }

    function unInitDir() {
        afterEach(function () {
            var _afterFlag = false;

			flag = false;
			result = {};

            runs(function () {
                _file.removeRecursively(function () {
                    _afterFlag = true;
                }, null, ["/Document"]);
            });
            waitsFor(function () {
                return _afterFlag;
            }, "directory uninit", 200);
		});
    }

    function allInit() {
        beforeEach(function () {
            var _beforeFlag = false;

            runs(function () {
                _file.getDirectory(function () {
                    _file.getDirectory(function () {
                        _file.getFile(function () {
                            _beforeFlag = true;
                        }, null, ["/Document/UT", "ut.txt", {create: true}]); 
                    }, null, ["/Document", "UT", {create: true}]);
                }, null, ["/", "Document", {create: true}]);
            });
            waitsFor(function () {
                return _beforeFlag;
            }, "init", 200);
        });
    }

    describe("On requestFileSystem", function () {
		afterEach(function () {
			flag   = false;
			result = {};
        });

        it("when requesting file sysrem with legal args", function () {
            var success = jasmine.createSpy("success").andCallFake(function (fs) {
                    result = fs;
					flag = true;
                }),
                error = jasmine.createSpy("error"),
                args  = [window.TEMPORARY, 2 * 1024 * 1024];

            runs(function () {
				_file.requestFileSystem(success, error, args);
			});

			waitsFor(function () {
				return flag;
			}, "Requesting file system", 200);


			runs(function () {
                expect(error).not.toHaveBeenCalled();
                expect(success).toHaveBeenCalled();
				expect(result.name).not.toEqual("");
				expect(result.root.fullPath).toEqual("/");
				expect(result.root.name).toEqual("");
			});
        });

        it("when requesting file system without error callback", function () {
			var success = jasmine.createSpy("success").andCallFake(function (fs) {
                    result = fs;
					flag = true;
                }),
                args = [window.TEMPORARY, 2 * 1024 * 1024];
			
			runs(function () {
				_file.requestFileSystem(success, null, args);
			});

			waitsFor(function () {
				return flag;
			}, "Requesting file system", 200);

			runs(function () {
                expect(success).toHaveBeenCalled();
				expect(result.name).not.toEqual("");
				expect(result.root.fullPath).toEqual("/");
				expect(result.root.name).toEqual("");
			});
		});

        it("when requesting file system beyond its maxsize", function () {
			var success = jasmine.createSpy("success"),
                error = jasmine.createSpy("error").andCallFake(function (e) {
                    result = e;
					flag = true;
                }),
				args = [window.TEMPORARY, 1024 * 1024 * 1024 + 1];
			
			runs(function () {
				_file.requestFileSystem(success, error, args);
			});

			waitsFor(function () {
				return flag;
			}, "Requesting file system", 200);

			runs(function () {
                expect(error).toHaveBeenCalled();
				expect(success).not.toHaveBeenCalled();
				expect(result).toEqual(10);
			});
		});

        it("when requesting file system without args", function () {
			expect(_file.requestFileSystem).toThrow();
		}); 
    });

    describe("On resolveLocalFileSystemURI", function () {
        initFile();
        unInitFile();

        it("when resolving local file system URI with '/ut.txt' args", function () {
            var success = jasmine.createSpy("success").andCallFake(function (entry) {
                    result = entry;
					flag = true;
                }),
                error = jasmine.createSpy("error"),
                args = ["/ut.txt"];

            runs(function () {
                _file.resolveLocalFileSystemURI(success, error, args);
			});	
      
            waitsFor(function () {
				return flag;
			}, "resolving local file system URI", 200);

			runs(function () {
                expect(success).toHaveBeenCalled();
				expect(error).not.toHaveBeenCalled();
                expect(result.isFile).toEqual(true);
				expect(result.fullPath).toEqual("/ut.txt");
				expect(result.name).toEqual("ut.txt");
			});
        });

        it("when resolving local file system URI with 'file://localhost/ut.txt' args", function () {
            var success = jasmine.createSpy("success").andCallFake(function (entry) {
                    result = entry;
                    flag = true;
                }),
                error = jasmine.createSpy("error"),
                args = ["file://localhost/ut.txt"];

            runs(function () {
                _file.resolveLocalFileSystemURI(success, error, args);
			});	
      
            waitsFor(function () {
				return flag;
			}, "resolving local file system URI", 200);

			runs(function () {
                expect(success).toHaveBeenCalled();
				expect(error).not.toHaveBeenCalled();
                expect(result.isFile).toEqual(true);
				expect(result.fullPath).toEqual("/ut.txt");
				expect(result.name).toEqual("ut.txt");
			});
        });

        it("when resolving local file system URI with not exist path args", function () {
            var success = jasmine.createSpy("success"),
                error = jasmine.createSpy("error").andCallFake(function (e) {
                    result = e;
                    flag = true;
                }),
                args = ["/not-exist.txt"];

            runs(function () {
                _file.resolveLocalFileSystemURI(success, error, args);
			});	
      
            waitsFor(function () {
				return flag;
			}, "resolving local file system URI", 200);

            runs(function () {
                expect(success).not.toHaveBeenCalled();
                expect(error).toHaveBeenCalled();
				expect(result).toEqual(1);
            });
        });

        it("when resolving local file system URI without error callback", function () {
            var success = jasmine.createSpy("success").andCallFake(function (entry) {
                    result = entry;
					flag = true;
                }),
                args = ["/ut.txt"];

            runs(function () {
                _file.resolveLocalFileSystemURI(success, null, args);
			});	
      
            waitsFor(function () {
				return flag;
			}, "resolving local file system URI", 200);

			runs(function () {
                expect(success).toHaveBeenCalled();
                expect(result.isFile).toEqual(true);
				expect(result.fullPath).toEqual("/ut.txt");
				expect(result.name).toEqual("ut.txt");
			});
        });

        it("when resolving local file system URI without args", function () {
			expect(_file.resolveLocalFileSystemURI).toThrow();
		});
    });

    describe("On getFile", function () {
        unInitFile();

        it("when getting an aleady exsit file", function () {
			var success = jasmine.createSpy("success").andCallFake(function (entry) {
                    result = entry;
                    flag = true;
                }),
                error = jasmine.createSpy("error"),
				args = ["/", "ut.txt", {create: false}];

			runs(function () {
                _file.getFile(function () {
                    _file.getFile(success, error, args);
				}, null, ["/", "ut.txt", {create: true, exclusive: false}]);
			});

            waitsFor(function () {
				return flag;
			}, "getting file", 200);
			
			runs(function () {
				expect(error).not.toHaveBeenCalled();
                expect(success).toHaveBeenCalled();
				expect(result.isFile).toEqual(true);
				expect(result.name).toEqual("ut.txt");
				expect(result.fullPath).toEqual("/ut.txt");
			});
        });
   
        it("when getting an not exsit file with 'create: true' arg", function () {
			var success = jasmine.createSpy("success").andCallFake(function (entry) {
                    result = entry;
                    flag = true;
                }),
                error = jasmine.createSpy("error"),
				args = ["/", "ut.txt", {create: true}];

			runs(function () {
                _file.getFile(success, error, args);
            });

			waitsFor(function () {
				return flag;
			}, "getting file", 200);
			
			runs(function () {
				expect(error).not.toHaveBeenCalled();
                expect(success).toHaveBeenCalled();
				expect(result.isFile).toEqual(true);
				expect(result.name).toEqual("ut.txt");
				expect(result.fullPath).toEqual("/ut.txt");
			});
		});

        it("when getting an none exsit file without 'create: true' arg", function () {
			var success = jasmine.createSpy("success"),
                error = jasmine.createSpy("error").andCallFake(function (e) {
                    result = e;
                    flag = true;
                }),
				args = ["/", "not-exsit.txt", {}];

			runs(function () {
                _file.getFile(function () {
                    _file.getFile(success, error, args);
				}, null, ["/", "ut.txt", {create: true, exclusive: false}]);
			});

			waitsFor(function () {
				return flag;
			}, "getting file", 200);
			
			runs(function () {
				expect(success).not.toHaveBeenCalled();
                expect(error).toHaveBeenCalled();
				expect(result).toEqual(1);
			});
		});

        it("when getting file without args", function () {
			runs(function () {
                _file.getFile(function () {
                    flag = true;
				}, null, ["/", "ut.txt", {create: true, exclusive: false}]);
			});

			waitsFor(function () {
				return flag;
			}, "getting file", 200);
	
			runs(function () {
				expect(_file.getFile).toThrow();
			});	
		});
    });


    describe("On remove", function () {
        afterEach(function () {
			flag   = false;
			result = {};
		});

        it("when removing an already exsit file", function () {
			var success = jasmine.createSpy("success").andCallFake(function () {
                    flag = true;
                }),
				error = jasmine.createSpy("error"),
                args = ["/ut.txt"];

			runs(function () {
                _file.getFile(function () {
                    _file.remove(success, error, args);
                }, null, ["/", "ut.txt", {create: true}]);
			});

			waitsFor(function () {
				return flag;
			}, "removing file", 200);
	
			runs(function () {
                expect(success).toHaveBeenCalled();
				expect(error).not.toHaveBeenCalled();
			});	
		});

        it("when removing a not exist file", function () {
			var success = jasmine.createSpy("success"),
                error = jasmine.createSpy("error").andCallFake(function (e) {
                    result = e;
                    flag = true;
                }),
                args = ["/ut.txt"];

			runs(function () {
                _file.remove(success, error, args);
			});

			waitsFor(function () {
				return flag;
			}, "removing file", 200);
	
			runs(function () {
				expect(success).not.toHaveBeenCalled();
                expect(error).toHaveBeenCalled();
				expect(result.code).toEqual(1);
			});	
		});

        it("when removing file without args", function () {
			expect(_file.remove).toThrow();
		});
    });

    describe("On readEntries", function () {
        initDir();
        unInitDir();

        it("when reading entries", function () {
			var success = jasmine.createSpy("success").andCallFake(function (entries) {
                    result = entries;
                    flag = true;
                }),
                error = jasmine.createSpy("error"),
				args  = ["/"];
	
			runs(function () {
                _file.readEntries(success, error, args);
			});

			waitsFor(function () {
				return flag;
			}, "removing file", 200);
	
			runs(function () {
				expect(error).not.toHaveBeenCalled();
                expect(success).toHaveBeenCalled();
				expect(result.length).toEqual(1);
                expect(result[0]["name"]).toEqual("Document");
			});	
		});

        it("when reading entries from an empty entry", function () {
			var success = jasmine.createSpy("success").andCallFake(function (entries) {
                    result = entries;
                    flag = true;
                }),
                error = jasmine.createSpy("error"),
				args = ["/Document"];
	
			runs(function () {
                _file.readEntries(success, error, args);
			});

			waitsFor(function () {
				return flag;
			}, "reading entries", 200);
	
			runs(function () {
				expect(error).not.toHaveBeenCalled();
                expect(success).toHaveBeenCalled();
                expect(result.length).toEqual(0);
            });
        });

        it("when reading entries with not exsit path args", function () {
			var success = jasmine.createSpy("success"),
                error = jasmine.createSpy("error").andCallFake(function (e) {
                    result = e;
                    flag = true;
                }),
				args = ["/not-exsit"];
				
			runs(function () {
                _file.readEntries(success, error, args);
			});

			waitsFor(function () {
				return flag;
			}, "reading entries", 200);
	
			runs(function () {
				expect(success).not.toHaveBeenCalled();
                expect(error).toHaveBeenCalled();
				expect(result).toEqual(1);
			});		
		});

        it("when reading entries without args", function () {
			expect(_file.readEntries).toThrow();
		});
    });

    describe("On getDirectory", function () {
        unInitDir();

        it("when getting an aleady exsit dirctory", function () {
			var success = jasmine.createSpy("success").andCallFake(function (entry) {
                    result = entry;
                    flag = true;
                }),
                error = jasmine.createSpy("error"),
				args = ["/", "Document", {create: false}];

			runs(function () {
                _file.getDirectory(function () {
                    _file.getDirectory(success, error, args);
				}, null, ["/", "Document", {create: true, exclusive: false}]);
			});

            waitsFor(function () {
				return flag;
			}, "getting directory", 200);
			
			runs(function () {
				expect(error).not.toHaveBeenCalled();
                expect(success).toHaveBeenCalled();
				expect(result.isDirectory).toEqual(true);
				expect(result.name).toEqual("Document");
				expect(result.fullPath).toEqual("/Document");
			});
        });

        it("when getting a not exsit dirctory with 'create: true' arg", function () {
			var success = jasmine.createSpy("success").andCallFake(function (entry) {
                    result = entry;
                    flag = true;
                }),
                error = jasmine.createSpy("error"),
				args = ["/", "Document", {create: true}];

			runs(function () {
                _file.getDirectory(success, error, args);
            });

			waitsFor(function () {
				return flag;
			}, "getting dirctory", 200);
			
			runs(function () {
				expect(error).not.toHaveBeenCalled();
                expect(success).toHaveBeenCalled();
				expect(result.isDirectory).toEqual(true);
				expect(result.name).toEqual("Document");
				expect(result.fullPath).toEqual("/Document");
			});
		});

        it("when getting a not exsit dirctory without 'create: true' arg", function () {
			var success = jasmine.createSpy("success"),
                error = jasmine.createSpy("error").andCallFake(function (e) {
                    result = e;
                    flag = true;
                }),
				args = ["/", "not-exsit", {}];

			runs(function () {
                _file.getDirectory(function () {
                    _file.getDirectory(success, error, args);
				}, null, ["/", "Document", {create: true, exclusive: false}]);
			});

			waitsFor(function () {
				return flag;
			}, "getting dirctory", 200);
			
			runs(function () {
				expect(success).not.toHaveBeenCalled();
                expect(error).toHaveBeenCalled();
				expect(result).toEqual(1);
			});
		});

        it("when getting dirctory without args", function () {
			runs(function () {
                _file.getDirectory(function () {
                    flag = true;
				}, null, ["/", "Document", {create: true, exclusive: false}]);
			});

			waitsFor(function () {
				return flag;
			}, "getting dirctory", 200);
	
			runs(function () {
				expect(_file.getDirectory).toThrow();
			});	
		});
    });

    describe("On removeRecursively", function () {
        afterEach(function () {
			flag   = false;
			result = {};
		});
 
        it("when removing recursively with an already exsit path arg", function () {
            var success = jasmine.createSpy("success").andCallFake(function () {
                    flag = true;
                }),
                error = jasmine.createSpy("error"),
				args = ["/Document"];
           
            runs(function () {
                _file.getDirectory(function () {
                    _file.removeRecursively(success, error, args);
				}, null, ["/", "Document", {create: true, exclusive: false}]);
            });

            waitsFor(function () {
                return flag;
            }, "removing recursively", 200);

            runs(function () {
                expect(error).not.toHaveBeenCalled();
                expect(success).toHaveBeenCalled();
            });
        });

        it("when removing recursively with a not exsit path arg", function () {
            var success = jasmine.createSpy("success"),
                error = jasmine.createSpy("error").andCallFake(function (e) {
                    result = e;
                    flag = true;
                }),
				args = ["/not-exsit"];
           
            runs(function () {
                _file.removeRecursively(success, error, args);
            });

            waitsFor(function () {
                return flag;
            }, "removing recursively", 200);

            runs(function () {
                expect(success).not.toHaveBeenCalled();
                expect(error).toHaveBeenCalled();
                expect(result).toEqual(1);
            });
        });

        it("when removing recursively with '/' root path arg", function () {
            var success = jasmine.createSpy("success"),
                error = jasmine.createSpy("error").andCallFake(function (e) {
                    result = e;
                    flag = true;
                }),
				args = ["/"];

            runs(function () {
                _file.removeRecursively(success, error, args);
            });

            waitsFor(function () {
                return flag;
            }, "removing recursively", 200);

            runs(function () {
                expect(success).not.toHaveBeenCalled();
                expect(error).toHaveBeenCalled();
                expect(result).toEqual(9);
            });
        });

        it("when removing recursively without error callback", function () {
            var success = jasmine.createSpy("success").andCallFake(function () {
                    flag = true;
                }),
				args = ["/Document"];
           
            runs(function () {
                _file.getDirectory(function () {
                    _file.removeRecursively(success, null, args);
				}, null, ["/", "Document", {create: true, exclusive: false}]);
            });

            waitsFor(function () {
                return flag;
            }, "removing recursively", 200);

            runs(function () {
                expect(success).toHaveBeenCalled();
            });
        });

        it("when removing recursively without args", function () {
            expect(_file.removeRecursively).toThrow();
        });
    });

    describe("On getFileMetadata", function () {
        initFile();
        unInitFile();
        
        it("when getting file metadata with an already exsit path arg", function () {
            var success = jasmine.createSpy("success").andCallFake(function (entry) {
                    result = entry;
                    flag = true;
                }),
                error = jasmine.createSpy("error"),
                args = ["/ut.txt"];

            runs(function () {
                _file.getFileMetadata(success, error, args);
            });

            waitsFor(function () {
                return flag;
            }, "getting file metadata", 200);

            runs(function () {
                expect(error).not.toHaveBeenCalled();
                expect(success).toHaveBeenCalled();
                expect(result.name).toEqual("ut.txt");
                expect(result.size).toEqual(jasmine.any(Number));
                expect(result.type).toEqual("text/plain");
            });
        });

        it("when getting file metadata with a not exsit path arg", function () {
            var success = jasmine.createSpy("success"),
                error = jasmine.createSpy("error").andCallFake(function (e) {
                    result = e;
                    flag = true;
                }),
                args = ["/not-exsit"];

            runs(function () {
                _file.getFileMetadata(success, error, args);
            });

            waitsFor(function () {
                return flag;
            }, "getting file metadata", 200);

            runs(function () {
                expect(success).not.toHaveBeenCalled();
                expect(error).toHaveBeenCalled();
                expect(result).toEqual(1);
            });
        });

        it("when getting file metadata without error callback", function () {
            var success = jasmine.createSpy("success").andCallFake(function (entry) {
                    result = entry;
                    flag = true;
                }),
                args = ["/ut.txt"];

            runs(function () {
                _file.getFileMetadata(success, null, args);
            });

            waitsFor(function () {
                return flag;
            }, "getting file metadata", 200);

            runs(function () {
                expect(success).toHaveBeenCalled();
                expect(result.name).toEqual("ut.txt");
                expect(result.size).toEqual(jasmine.any(Number));
                expect(result.type).toEqual("text/plain");
            });
        });

        it("when getting file metadata without callbacks", function () {
            var args = ["/ut.txt"];
           
            expect(function () {
                _file.getFileMetadata(null, null, args).not.toThrow();
            });
        });

        it("when getting file metadata without args", function () {
            expect(_file.getFileMetadata).toThrow();
        });
    });

    describe("On getMetadata", function () {
        initDir();
        unInitDir();
        
        it("when getting metadata with an already exsit path arg", function () {
            var success = jasmine.createSpy("success").andCallFake(function (entry) {
                    result = entry;
                    flag = true;
                }),
                error = jasmine.createSpy("error"),
                args = ["/Document"];

            runs(function () {
                _file.getMetadata(success, error, args);
            });

            waitsFor(function () {
                return flag;
            }, "getting metadata", 200);

            runs(function () {
                expect(error).not.toHaveBeenCalled();
                expect(success).toHaveBeenCalled();
                expect(result.modificationTime).toEqual(jasmine.any(Date));
            });
        });

        it("when getting metadata with a not exsit path arg", function () {
            var success = jasmine.createSpy("success"),
                error = jasmine.createSpy("error").andCallFake(function (e) {
                    result = e;
                    flag = true;
                }),
                args = ["/not-exsit"];

            runs(function () {
                _file.getMetadata(success, error, args);
            });

            waitsFor(function () {
                return flag;
            }, "getting metadata", 200);

            runs(function () {
                expect(success).not.toHaveBeenCalled();
                expect(error).toHaveBeenCalled();
                expect(result).toEqual(1);
            });
        });

        it("when getting metadata without error callback", function () {
            var success = jasmine.createSpy("success").andCallFake(function (entry) {
                    result = entry;
                    flag = true;
                }),
                args = ["/Document"];

            runs(function () {
                _file.getMetadata(success, null, args);
            });

            waitsFor(function () {
                return flag;
            }, "getting file metadata", 200);

            runs(function () {
                expect(success).toHaveBeenCalled();
                expect(result.modificationTime).toEqual(jasmine.any(Date));
            });
        });

        it("when getting metadata without callbacks", function () {
            var args = ["/Document"];
           
            expect(function () {
                _file.getMetadata(null, null, args).not.toThrow();
            });
        });

        it("when getting metadata without args", function () {
            expect(_file.getMetadata).toThrow();
        });
    });

    describe("On getParent", function () {
        initDir();
        unInitDir();

        it("when getting an already exsit parent", function () {
            var success = jasmine.createSpy("success").andCallFake(function (entry) {
                    result = entry;
                    flag = true;
                }),
                error = jasmine.createSpy("error"),
                args = ["/Document"];

            runs(function () {
                _file.getParent(success, error, args);
            });

            waitsFor(function () {
                return flag;
            }, "getting parent", 200);

            runs(function () {
                expect(error).not.toHaveBeenCalled();
                expect(success).toHaveBeenCalled();
                expect(result.isDirectory).toEqual(true);
                expect(result.name).toEqual("");
                expect(result.fullPath).toEqual("/");
            });
        });
      
        it("when getting root's parent", function () {
            var success = jasmine.createSpy("success").andCallFake(function (entry) {
                    result = entry;
                    flag = true;
                }),
                error = jasmine.createSpy("error"),
                args = ["/"];

            runs(function () {
                _file.getParent(success, error, args);
            });

            waitsFor(function () {
                return flag;
            }, "getting parent", 200);

            runs(function () {
                expect(error).not.toHaveBeenCalled();
                expect(success).toHaveBeenCalled();
                expect(result.isDirectory).toEqual(true);
                expect(result.name).toEqual("");
                expect(result.fullPath).toEqual("/");
            });
        });

        it("when getting not exsit directory's parent", function () {
            var success = jasmine.createSpy("success"),
                error = jasmine.createSpy("error").andCallFake(function (e) {
                    result = e;
                    flag = true;
                }),
                args = ["/not-exsit"];

            runs(function () {
                _file.getParent(success, error, args);
            });

            waitsFor(function () {
                return flag;
            }, "getting parent", 200);

            runs(function () {
                expect(success).not.toHaveBeenCalled();
                expect(error).toHaveBeenCalled();
                expect(result).toEqual(1);
            });
        });

        it("when getting parent without callbacks", function () {
            var args = ["/Document"];
           
            expect(function () {
                _file.getParent(null, null, args).not.toThrow();
            });
        });

        it("when getting parent without args", function () {
            expect(_file.getParent).toThrow();
        });
    });

    describe("On copyTo", function () {
        allInit();
        unInitDir();
 
        it("when copying a file to a parent directory with original name", function () {
            var success = jasmine.createSpy("success").andCallFake(function (entry) {
                    result = entry;
                    flag = true;
                }),
                error = jasmine.createSpy("error"),
                args = ["/Document/UT/ut.txt", "/Document", "ut.txt"];

            runs(function () {
                _file.copyTo(success, error, args);
            });
   
            waitsFor(function () {
                return flag;
            }, "copying to", 200);
    
            runs(function () {
                expect(error).not.toHaveBeenCalled();
                expect(success).toHaveBeenCalled();
                expect(result.name).toEqual("ut.txt");
                expect(result.isFile).toEqual(true);
                expect(result.fullPath).toEqual("/Document/ut.txt");
            });
        });

        it("when copying a file to a parent directory with a new name", function () {
            var success = jasmine.createSpy("success").andCallFake(function (entry) {
                    result = entry;
                    flag = true;
                }),
                error = jasmine.createSpy("error"),
                args = ["/Document/UT/ut.txt", "/Document", "newut.txt"];

            runs(function () {
                _file.copyTo(success, error, args);
            });
   
            waitsFor(function () {
                return flag;
            }, "copying to", 200);
    
            runs(function () {
                expect(error).not.toHaveBeenCalled();
                expect(success).toHaveBeenCalled();
                expect(result.name).toEqual("newut.txt");
                expect(result.isFile).toEqual(true);
                expect(result.fullPath).toEqual("/Document/newut.txt");
            });
        });

        it("when copying a file to own directory with original name", function () {
            var success = jasmine.createSpy("success"),
                error = jasmine.createSpy("error").andCallFake(function (e) {
                    result = e;
                    flag = true;
                }),
                args = ["/Document/UT/ut.txt", "/Document/UT", "ut.txt"];

            runs(function () {
                _file.copyTo(success, error, args);
            });
   
            waitsFor(function () {
                return flag;
            }, "copying to", 200);
    
            runs(function () {
                expect(success).not.toHaveBeenCalled();
                expect(error).toHaveBeenCalled();
                expect(result).toEqual(9);
            });
        });

        it("when copying a file to own directory with a new name", function () {
            var success = jasmine.createSpy("success").andCallFake(function (entry) {
                    result = entry;
                    flag = true;
                }),
                error = jasmine.createSpy("error"),
                args = ["/Document/UT/ut.txt", "/Document/UT", "newut.txt"];

            runs(function () {
                _file.copyTo(success, error, args);
            });
   
            waitsFor(function () {
                return flag;
            }, "copying to", 200);
    
            runs(function () {
                expect(error).not.toHaveBeenCalled();
                expect(success).toHaveBeenCalled();
                expect(result.name).toEqual("newut.txt");
                expect(result.isFile).toEqual(true);
                expect(result.fullPath).toEqual("/Document/UT/newut.txt");
            });
        });

        it("when copying a directory to child directory", function () {
            var success = jasmine.createSpy("success"),
                error = jasmine.createSpy("error").andCallFake(function (e) {
                    result = e;
                    flag = true;
                }),
                args = ["/Document", "/Document/UT", "Document"];

            runs(function () {
                _file.copyTo(success, error, args);
            });
   
            waitsFor(function () {
                return flag;
            }, "copying to", 200);
    
            runs(function () {
                expect(success).not.toHaveBeenCalled();
                expect(error).toHaveBeenCalled();
                expect(result).toEqual(9);
            });
        });

        it("when copying without callbacks", function () {
            var args = ["/Document/UT/ut.txt", "/Document", "ut.txt"];

            expect(function () {
                _file.copyTo(null, null, args).not.toThrow();
            });
        });
 
        it("when copying without args", function () {
            expect(_file.copyTo).toThrow();
        });
    });

    describe("On moveTo", function () {
        allInit();
        unInitDir();

        it("when moving a file to a parent directory with original name", function () {
            var success = jasmine.createSpy("success").andCallFake(function (entry) {
                    result = entry;
                    flag = true;
                }),
                error = jasmine.createSpy("error"),
                args = ["/Document/UT/ut.txt", "/Document", "ut.txt"];

            runs(function () {
                _file.moveTo(success, error, args);
            });
   
            waitsFor(function () {
                return flag;
            }, "moving to", 200);
    
            runs(function () {
                expect(error).not.toHaveBeenCalled();
                expect(success).toHaveBeenCalled();
                expect(result.name).toEqual("ut.txt");
                expect(result.isFile).toEqual(true);
                expect(result.fullPath).toEqual("/Document/ut.txt");
            });
        });

        it("when moving a file to a parent directory with a new name", function () {
            var success = jasmine.createSpy("success").andCallFake(function (entry) {
                    result = entry;
                    flag = true;
                }),
                error = jasmine.createSpy("error"),
                args = ["/Document/UT/ut.txt", "/Document", "newut.txt"];

            runs(function () {
                _file.moveTo(success, error, args);
            });
   
            waitsFor(function () {
                return flag;
            }, "moving to", 200);
    
            runs(function () {
                expect(error).not.toHaveBeenCalled();
                expect(success).toHaveBeenCalled();
                expect(result.name).toEqual("newut.txt");
                expect(result.isFile).toEqual(true);
                expect(result.fullPath).toEqual("/Document/newut.txt");
            });
        });

        it("when moving a file to own directory with original name", function () {
            var success = jasmine.createSpy("success"),
                error = jasmine.createSpy("error").andCallFake(function (e) {
                    result = e;
                    flag = true;
                }),
                args = ["/Document/UT/ut.txt", "/Document/UT", "ut.txt"];

            runs(function () {
                _file.moveTo(success, error, args);
            });
   
            waitsFor(function () {
                return flag;
            }, "moving to", 200);
    
            runs(function () {
                expect(success).not.toHaveBeenCalled();
                expect(error).toHaveBeenCalled();
                expect(result).toEqual(9);
            });
        });

        it("when moving a file to own directory with a new name", function () {
            var success = jasmine.createSpy("success").andCallFake(function (entry) {
                    result = entry;
                    flag = true;
                }),
                error = jasmine.createSpy("error"),
                args = ["/Document/UT/ut.txt", "/Document/UT", "newut.txt"];

            runs(function () {
                _file.moveTo(success, error, args);
            });
   
            waitsFor(function () {
                return flag;
            }, "moving to", 200);
    
            runs(function () {
                expect(error).not.toHaveBeenCalled();
                expect(success).toHaveBeenCalled();
                expect(result.name).toEqual("newut.txt");
                expect(result.isFile).toEqual(true);
                expect(result.fullPath).toEqual("/Document/UT/newut.txt");
            });
        });

        it("when moving a directory to child directory", function () {
            var success = jasmine.createSpy("success"),
                error = jasmine.createSpy("error").andCallFake(function (e) {
                    result = e;
                    flag = true;
                }),
                args = ["/Document", "/Document/UT", "Document"];

            runs(function () {
                _file.moveTo(success, error, args);
            });
   
            waitsFor(function () {
                return flag;
            }, "moving to", 200);
    
            runs(function () {
                expect(success).not.toHaveBeenCalled();
                expect(error).toHaveBeenCalled();
                expect(result).toEqual(9);
            });
        });

        it("when moving without callbacks", function () {
            var args = ["/Document/UT/ut.txt", "/Document", "ut.txt"];

            expect(function () {
                _file.moveTo(null, null, args).not.toThrow();
            });
        });
 
        it("when moving without args", function () {
            expect(_file.moveTo).toThrow();
        });
    });

    describe("On write", function () {
        initFile();
        unInitFile();

        it("when writing a file with an already exist path arg", function () {
            var success = jasmine.createSpy("success").andCallFake(function (entry) {
                    result = entry;
                    flag = true;
                }),
                error = jasmine.createSpy("error"),
                args = [{name: "/ut.txt"}, "this is a test for writing a file"];
        
            runs(function () {
                _file.write(success, error, args);
            });
 
            waitsFor(function () {
                return flag;
            }, "write", 200);

            runs(function () {
                expect(error).not.toHaveBeenCalled();
                expect(success).toHaveBeenCalled();
                expect(result).toEqual(jasmine.any(Number));
            });
        });

        it("when writing a file with a 'position' arg", function () {
            var success = jasmine.createSpy("success").andCallFake(function (entry) {
                    result = entry;
                    flag = true;
                }),
                error = jasmine.createSpy("error"),
                args = [{name: "/ut.txt"}, "this is a test for writing a file", 2];
        
            runs(function () {
                _file.write(success, error, args);
            });
 
            waitsFor(function () {
                return flag;
            }, "write", 200);

            runs(function () {
                expect(error).not.toHaveBeenCalled();
                expect(success).toHaveBeenCalled();
                expect(result).toEqual(jasmine.any(Number));
            });
        });

        it("when writing a file without callbacks", function () {
            var args = [{name: "/ut.txt"}, "this is a test for writing a file"];
   
            expect(function () {
                _file.write(null, null, args).not.toThrow();
            });         
        });

        it("when writing a file without arg", function () {
            expect(_file.write).toThrow(); 
        });
    });

    describe("On readAsText", function () {
        initFile();
        unInitFile();

        it("when reading as test with an already exist path arg", function () {
            var success = jasmine.createSpy("success").andCallFake(function (content) {
                    result = content;
                    flag = true;
                }),
                error = jasmine.createSpy("error"),
                args = ["/ut.txt", "utf-8"];

            runs(function () {
                _file.readAsText(success, error, args);
            });

            waitsFor(function () {
                return flag; 
            }, "read as text", 200);

            runs(function () {
                expect(error).not.toHaveBeenCalled();
                expect(success).toHaveBeenCalled();
                expect(result).toEqual("this is a test for writing a file");
            });
        });

        it("when reading as test with a not exist path arg", function () {
            var success = jasmine.createSpy("success"),
                error = jasmine.createSpy("error").andCallFake(function (e) {
                    result = e;
                    flag = true;
                }),
                args = ["/not-exist.txt", "utf-8"];

            runs(function () {
                _file.readAsText(success, error, args);
            });

            waitsFor(function () {
                return flag; 
            }, "read as text", 200);

            runs(function () {
                expect(success).not.toHaveBeenCalled();
                expect(error).toHaveBeenCalled();
                expect(result).toEqual(1);
            });
        });

        it("when reading as test without callbacks", function () {
            var args = ["/ut.txt", "utf-8"];
   
            expect(function () {
                _file.readAsText(null, null, args).not.toThrow();
            });         
        });

        it("when reading as test without arg", function () {
            expect(_file.readAsText).toThrow(); 
        });
    });

    describe("On readAsDataURL", function () {
        initFile();
        unInitFile();

        it("when reading as data URL with an already exist path arg", function () {
            var success = jasmine.createSpy("success").andCallFake(function (content) {
                    result = content;
                    flag = true;
                }),
                error = jasmine.createSpy("error"),
                args = ["/ut.txt"];

            runs(function () {
                _file.readAsDataURL(success, error, args);
            });

            waitsFor(function () {
                return flag; 
            }, "read as data url", 200);

            runs(function () {
                expect(error).not.toHaveBeenCalled();
                expect(success).toHaveBeenCalled();
                expect(result).toEqual(jasmine.any(String));
            });
        });

        it("when reading as data URL with a not exist path arg", function () {
            var success = jasmine.createSpy("success"),
                error = jasmine.createSpy("error").andCallFake(function (e) {
                    result = e;
                    flag = true;
                }),
                args = ["/not-exist.txt", "utf-8"];

            runs(function () {
                _file.readAsDataURL(success, error, args);
            });

            waitsFor(function () {
                return flag; 
            }, "read as data url", 200);

            runs(function () {
                expect(success).not.toHaveBeenCalled();
                expect(error).toHaveBeenCalled();
                expect(result).toEqual(1);
            });
        });

        it("when reading as data URL without callbacks", function () {
            var args = ["/ut.txt"];
   
            expect(function () {
                _file.readAsDataURL(null, null, args).not.toThrow();
            });         
        });

        it("when reading as data URL without arg", function () {
            expect(_file.readAsDataURL).toThrow(); 
        });        
    });

    describe("On truncate", function () {
        initFile();
        unInitFile();

        it("when truncating with an already exist file path arg", function () {
            var success = jasmine.createSpy("success").andCallFake(function (length) {
                    result = length;
                    flag = true;
                }),
                error = jasmine.createSpy("error"),
                args = [{name: "/ut.txt"}, 2];

            runs(function () {
                _file.truncate(success, error, args);
            });

            waitsFor(function () {
                return flag;
            }, "truncate", 200);

            runs(function () {
                expect(error).not.toHaveBeenCalled();
                expect(success).toHaveBeenCalled();
                expect(result).toEqual(2);
            });
        });

        it("when truncating with a not exist file path arg", function () {
            var success = jasmine.createSpy("success"),
                error = jasmine.createSpy("error").andCallFake(function (e) {
                    result = e;
                    flag = true;
                }),
                args = [{name: "/no-exist.txt"}, 2];

            runs(function () {
                _file.truncate(success, error, args);
            });

            waitsFor(function () {
                return flag;
            }, "truncate", 200);

            runs(function () {
                expect(success).not.toHaveBeenCalled();
                expect(error).toHaveBeenCalled();
                expect(result).toEqual(1);
            });
        });

        it("when truncating with a negative 'position' arg", function () {
            var success = jasmine.createSpy("success"),
                error = jasmine.createSpy("error"),
                args = [{name: "/ut.txt"}, -1];

            runs(function () {
                expect(function () {
                    _file.truncate(success, error, args).toThrow();
                });
            });
        });

        it("when truncating without callbacks", function () {
            var args = [{name: "/ut.txt"}, 2];
   
            expect(function () {
                _file.truncate(null, null, args).not.toThrow();
            });         
        });

        it("when truncating without arg", function () {
            expect(_file.truncate).toThrow(); 
        });    
    });
});
