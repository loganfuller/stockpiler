"use strict";

var _ = require("lodash"),
    path = require("path"),
    configDir = path.join(__dirname, "config"),
    origEnv = _.clone(process.env);

describe("File config", function() {
    afterEach(function() {
        process.env = null;
        process.env = _.clone(origEnv);
    });

    it("should contain only defaults if called with empty config files",
        function() {
        process.env.NODE_ENV = "";

        var config = require("../index.js")({
            configDir: configDir,
            cacheConfig: false
        });

        config.should.have.ownProperty("defaultVar").equal("default");
    });

    it("should override defaults with file config", function() {
        var config = require("../index.js")({
            configDir: configDir,
            cacheConfig: false
        });

        config.should.have.ownProperty("defaultVar").equal("fileOverride");
    });

    it("should be able to recursively load json config", function() {
        process.env.NODE_ENV = "stockpiler-recursive-test";

        var config = require("../index.js")({
            configDir: configDir,
            cacheConfig: false
        });

        config.should.have.ownProperty("recursion").eql({
            "recursive": {
                "inception": 42
            }
        });
    });
});

