"use strict";

var _ = require("lodash"),
    origEnv = _.clone(process.env);

describe("Environment variables", function() {
    afterEach(function() {
        process.env = null;
        process.env = _.clone(origEnv);
    });

    it("should contain a truthy 'envTestVar' when passed as environment",
       function() {
        process.env["STOCKPILER_ENV-TEST-VAR"] = "true";

        var config = require("../index.js")({
            configDir: __dirname + "/config",
            cacheConfig: false
        });

        config.should.have.ownProperty("envTestVar").equal(true);
    });

    it("should contain a nested variable when passed as environment",
       function() {
        process.env["STOCKPILER_NESTED_ENV-TEST-VAR"] = 9;

        var config = require("../index.js")({
            configDir: __dirname + "/config",
            cacheConfig: false
        });

        config.should.have.ownProperty("nested");
        config.nested.should.have.ownProperty("envTestVar").equal(9);
    });

    it("should override file-based config with environment config",
       function() {
        process.env["STOCKPILER_default-var"] = "envOverride";

        var config = require("../index.js")({
            configDir: __dirname + "/config",
            cacheConfig: false
        });

        config.should.have.ownProperty("defaultVar").equal("envOverride");
    });

    it("should detect environment variables with custom prefixes",
       function() {
        process.env["CUSTPREFIX_conf-val"] = true;

        var config = require("../index.js")({
            configDir: __dirname + "/config",
            envPrefix: "CUSTPREFIX",
            cacheConfig: false
        });

        config.should.have.ownProperty("confVal").equal(true);
    });
});

