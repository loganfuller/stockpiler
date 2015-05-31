"use strict";

var _ = require("lodash"),
    path = require("path"),
    configDir = path.join(__dirname, "config"),
    origEnv = _.clone(process.env),
    origArgv = process.argv.slice(0,2);

describe("Meta", function() {
    afterEach(function() {
        process.argv = null;
        process.argv = _.clone(origArgv);

        process.env = null;
        process.env = _.clone(origEnv);
    });

    it("should contain non-enumerable properties _default, _file, _env, and _arg", function() {
        process.env["STOCKPILER__ENV_TEST_VAR"] = "envTest";
        process.env["NODE_ENV"] = "stockpiler-meta-test";
        process.argv.push("--cliTestVar", "cliTest");

        var config = require("../index.js")({
            configDir: configDir,
            cacheConfig: false
        });

        config.should.not.have.enumerables(["_default", "_file", "_env", "_arg"]);
        config.should.have.enumerables(["defaultVar", "fileTestVar", "envTestVar", "cliTestVar"]);

        config.should.containEql({ _default: { defaultVar: "default" } });
        config.should.containEql({ _file: { fileTestVar: "fileTest" } });
        config.should.containEql({ _env: { envTestVar: "envTest" } });
        config.should.containEql({ _arg: { cliTestVar: "cliTest" } });
    });
});
