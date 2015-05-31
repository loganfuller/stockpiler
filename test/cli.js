"use strict";

var _ = require("lodash"),
    path = require("path"),
    configDir = path.join(__dirname, "config"),
    origEnv = _.clone(process.env),
    origArgv = process.argv.slice(0,2);

describe("Command line", function() {
    afterEach(function() {
        process.argv = [];
        process.argv = _.clone(origArgv);

        process.env = null;
        process.env = _.clone(origEnv);
    });

    it("should contain a numerical 'cliTestVar' when passed as argument",
        function() {
        process.argv.push("--cliTestVar", "42");

        var config = require("../index.js")({
            configDir: configDir,
            cacheConfig: false
        });

        config.cliTestVar.should.equal(42);
    });

    it("should contain a nested variable when passed as argument", function() {
        process.argv.push("--nested-deep-cliTestVar");

        var config = require("../index.js")({
            configDir: configDir,
            cacheConfig: false
        });

        config.should.have.ownProperty("nested");
        config.nested.should.have.ownProperty("deep");
        config.nested.deep.should.have.ownProperty("cliTestVar").equal(true);
    });

    it("should override file-based config with argument", function() {
        process.argv.push("--defaultVar", "cliOverride");

        var config = require("../index.js")({
            configDir: configDir,
            cacheConfig: false
        });

        config.should.have.ownProperty("defaultVar").equal("cliOverride");
    });

    it("should override environment-based config with argument", function() {
        process.env["STOCKPILER__ENVIRONMENT_OR_CLI"] = "environment";
        process.argv.push("--environmentOrCli", "cli");

        var config = require("../index.js")({
            configDir: configDir,
            cacheConfig: false
        });

        config.should.have.ownProperty("environmentOrCli").equal("cli");
    });
});

