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
        topCordova = require('ripple/platform/cordova/2.0.0/spec');

    describe("On requestFileSystem", function () {
        var result = {},
			flag = false;

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
                args  = [window.TEMPORARY, 2*1024*1024];

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
                args = [window.TEMPORARY, 2*1024*1024];
			
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
				args = [window.TEMPORARY, 1024*1024*1024 + 1];
			
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
        var flag   = false,
			result = {};

        beforeEach(function () {
            var _beforeFlag = false;
 
            runs(function () {
                _file.getFile(function () {
				    _beforeFlag = true;	
			    }, null, ["/", "ut.txt", {create: true, exclusive: false}])
            });
            waitsFor(function () {
                return _beforeFlag;
            }, "resolveLocalFileSystemURI init", 200);
        });

        afterEach(function () {
            var _afterFlag = false;

			flag   = false;
			result = {};

            runs(function () {
                _file.remove(function () {
				    _afterFlag = true;	
			    }, null, ["/ut.txt"])
            });
            waitsFor(function () {
                return _afterFlag;
            }, "resolveLocalFileSystemURI recover", 200);
		});

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
        var flag   = false,
			result = {};

        afterEach(function () {
            var _afterFlag = false;

			flag   = false;
			result = {};

			runs(function () {
                _file.remove(function () {
				    _afterFlag = true;	
			    }, null, ["/ut.txt"])
            });
            waitsFor(function () {
                return _afterFlag;
            }, "getFile recover", 200);
		});

        it("when getting an aleady exsit file", function () {
			var success = jasmine.createSpy("success").andCallFake(function (entry) {
                    result = entry;
		            flag = true;
                }),
                error = jasmine.createSpy("error"),
				args = ["/", "ut.txt", {create: false}];

			runs(function () {
                _file.getFile(function () {
			        _file.getFile(success, error, args)
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
                _file.getFile(success, error, args)
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
			        _file.getFile(success, error, args)
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
		})
    });


    describe("On remove", function () {
        var flag   = false,
			result = {};

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
			    }, null, ["/", "ut.txt", {create: true}])
			});

			waitsFor(function () {
				return flag;
			}, "removing file", 200);
	
			runs(function () {
                expect(success).toHaveBeenCalled();
				expect(error).not.toHaveBeenCalled();
			});	
		});

        it("when removing a no texist file", function () {
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
        var flag   = false,
			result = {};

        beforeEach(function () {
            var _beforeFlag = false;

            runs(function () {
                _file.getDirectory(function () {
                    _beforeFlag = true;
                }, null, ["/", "Document", {create: true}]);
            });
            waitsFor(function () {
                return _beforeFlag;
            }, "readEntries init", 200);
        });

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
            }, "readEntries recover", 200);
		});

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
        var flag   = false,
			result = {};

        afterEach(function () {
            var _afterFlag = false;

			flag   = false;
			result = {};

			runs(function () {
                _file.removeRecursively(function () {
				    _afterFlag = true;	
			    }, null, ["/Document"])
            });
            waitsFor(function () {
                return _afterFlag;
            }, "getDirectory recover", 200);
		});

        it("when getting an aleady exsit dirctory", function () {
			var success = jasmine.createSpy("success").andCallFake(function (entry) {
                    result = entry;
		            flag = true;
                }),
                error = jasmine.createSpy("error"),
				args = ["/", "Document", {create: false}];

			runs(function () {
                _file.getDirectory(function () {
			        _file.getDirectory(success, error, args)
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
                _file.getDirectory(success, error, args)
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
			        _file.getDirectory(success, error, args)
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
		})
    });

    describe("On removeRecursively", function () {
        var flag   = false,
			result = {};

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
        var flag = false,
			result = {};

        beforeEach(function () {
            var _beforeFlag = false;
 
            runs(function () {
                _file.getFile(function () {
				    _beforeFlag = true;	
			    }, null, ["/", "ut.txt", {create: true, exclusive: false}])
            });
            waitsFor(function () {
                return _beforeFlag;
            }, "getFileMetadata init", 200);
        });

        afterEach(function () {
            var _afterFlag = false;

			flag = false;
			result = {};

            runs(function () {
                _file.remove(function () {
				    _afterFlag = true;	
			    }, null, ["/ut.txt"])
            });
            waitsFor(function () {
                return _afterFlag;
            }, "getFileMetadata recover", 200);
		});
        
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
                expect(result.size).toEqual(0);
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
                expect(result.size).toEqual(0);
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
        var flag = false,
			result = {};

        beforeEach(function () {
            var _beforeFlag = false;

            runs(function () {
                _file.getDirectory(function () {
                    _beforeFlag = true;
                }, null, ["/", "Document", {create: true}]);
            });

            waitsFor(function () {
                return _beforeFlag;
            }, "getMetadata init", 200);
        });

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
            }, "getMetadata recover", 200);
		});
        
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
        var flag = false,
			result = {};

        beforeEach(function () {
            var _beforeFlag = false;

            runs(function () {
                _file.getDirectory(function () {
                    _beforeFlag = true;
                }, null, ["/", "Document", {create: true}]);
            });
            waitsFor(function () {
                return _beforeFlag;
            }, "getParent init", 200);
        });

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
            }, "getParent recover", 200);
		});

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

        it("when getting metadata without callbacks", function () {
            var args = ["/Document"];
           
            expect(function () {
                _file.getParent(null, null, args).not.toThrow();
            });
        });

        it("when getting metadata without args", function () {
            expect(_file.getParent).toThrow();
        });
    });
});
