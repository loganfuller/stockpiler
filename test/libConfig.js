"use strict";

var _ = require("lodash"),
    path = require("path"),
    configDir = path.join(__dirname, "config"),
    origEnv = _.clone(process.env),
    origArgv = process.argv.slice(0,2);

describe("Library Config", function() {
    afterEach(function() {
        process.argv = null;
        process.argv = _.clone(origArgv);

        process.env = null;
        process.env = _.clone(origEnv);
    });

    it("should use custom config dir when passed as env var", function() {
        process.env["STOCKPILER_CONFIG_DIR"] = __dirname + "/altconfig";
        process.env["NODE_ENV"] = "stockpiler-alt-config-test";

        var config = require("../index.js")({
            configDir: configDir,
            cacheConfig: false
        });

        config.should.have.ownProperty("defaultVar").equal("altDefault");
        config.should.have.ownProperty("altConfigVar").equal("alternate");
    });

    it("should use custom defaults dir when passed as env var", function() {
        process.env["STOCKPILER_CONFIG_DIR"] = __dirname + "/altconfig";
        process.env["STOCKPILER_DEFAULTS_DIR"] = __dirname + "/config";
        process.env["NODE_ENV"] = "stockpiler-alt-config-test";

        var config = require("../index.js")({
            configDir: configDir,
            cacheConfig: false
        });

        config.should.have.ownProperty("defaultVar").equal("default");
        config.should.have.ownProperty("altConfigVar").equal("alternate");
    });

    it("should properly cache config on subsequent calls", function() {
        process.env["STOCKPILER__ENV_TEST_VAR"] = "envTest";
        process.env["NODE_ENV"] = "stockpiler-meta-test";
        process.argv.push("--cliTestVar", "cliTest");

        var configOne = require("../index.js")({
           configDir: configDir,
            cacheConfig: true
        });

        var configTwo = require("../index.js")();

        configOne.should.be.exactly(configTwo);
    });

    it("should allow config cache to be disabled", function() {
        process.env["STOCKPILER__ENV_TEST_VAR"] = "envTest";
        process.env["NODE_ENV"] = "stockpiler-meta-test";
        process.argv.push("--cliTestVar", "cliTest");

        var configOne = require("../index.js")({
            configDir: configDir,
            cacheConfig: false
        });

        var configTwo = require("../index.js")({
            configDir: configDir,
            cacheConfig: false
        });

        configOne.should.not.be.exactly(configTwo);
    });
});

