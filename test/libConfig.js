"use strict";

var _ = require("lodash"),
    origEnv = _.clone(process.env),
    origArgv = process.argv.slice(0,2);

describe("Command line", function() {
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
            configDir: __dirname + "/config",
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
            configDir: __dirname + "/config",
            cacheConfig: false
        });

        config.should.have.ownProperty("defaultVar").equal("default");
        config.should.have.ownProperty("altConfigVar").equal("alternate");
    });
});

