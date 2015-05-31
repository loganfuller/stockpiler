"use strict";

var _ = require("lodash"),
    path = require("path"),
    configDir = path.join(__dirname, "config"),
    origEnv = _.clone(process.env);

describe("Environment variables", function() {
    afterEach(function() {
        process.env = null;
        process.env = _.clone(origEnv);
    });

    it("should contain a truthy 'envTestVar' when passed as environment",
       function() {
        process.env["STOCKPILER__ENV_TEST_VAR"] = "true";

        var config = require("../index.js")({
            configDir: configDir,
            cacheConfig: false
        });

        config.should.have.ownProperty("envTestVar").equal(true);
    });

    it("should contain a nested variable when passed as environment",
       function() {
        process.env["STOCKPILER__NESTED__ENV_TEST_VAR"] = 9;

        var config = require("../index.js")({
            configDir: configDir,
            cacheConfig: false
        });

        config.should.have.ownProperty("nested");
        config.nested.should.have.ownProperty("envTestVar").equal(9);
    });

    it("should override file-based config with environment config",
       function() {
        process.env["STOCKPILER__DEFAULT_VAR"] = "envOverride";

        var config = require("../index.js")({
            configDir: configDir,
            cacheConfig: false
        });

        config.should.have.ownProperty("defaultVar").equal("envOverride");
    });

    it("should detect environment variables with custom prefixes",
       function() {
        process.env["CUSTPREFIX__CONF_VAL"] = true;

        var config = require("../index.js")({
            configDir: configDir,
            envPrefix: "CUSTPREFIX",
            cacheConfig: false
        });

        config.should.have.ownProperty("confVal").equal(true);
    });

    it("should properly map uncontrolled environment variables",
       function() {
        process.env["PORT"] = 8080;
        process.env["DBSERVERTYPE"] = "mysql";

        var config = require("../index.js")({
            configDir: configDir,
            cacheConfig: false,
            envMap: {
                "PORT": "PORT_NUMBER",
                "DBSERVERTYPE": "DB__SERVER_TYPE"
            }
        });

        config.should.have.ownProperty("portNumber").equal(8080);
        config.should.have.ownProperty("db");
        config.db.should.have.ownProperty("serverType").equal("mysql");
    });
});

