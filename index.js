"use strict";

if(typeof process.env.NODE_ENV === "undefined") {
    process.env.NODE_ENV = "development";
}

var fs = require("fs"),
    _ = require("lodash"),
    defaultsDeep = _.partialRight(_.merge, _.defaults),
    defaultOptions = {
        configDir: __dirname + "/../../config",
        envPrefix: "STOCKPILER",
        envMap: {},
        cacheConfig: true
    },
    config = {};

var mergeReduce = function (memo, val) {
    var tmp = {};
    tmp[val] = memo;
    return tmp;
};

module.exports = function (opts) {
    var options = _.defaults(_.isPlainObject(opts) ? opts : {}, defaultOptions),
        defaultConfig = (fs.existsSync(options.configDir + "/default.json") ?
        _.clone(require(options.configDir + "/default.json")) : {}),
        argv = require("minimist")(process.argv.slice(2)),
        envVars = _.clone(process.env);

    if(options.cacheConfig && !_.isEmpty(config)) {
        return _.cloneDeep(config);
    } else {
        config = {};
    }

    // Environment specific JSON configuration
    var fileConfig = {};
    if(!fs.existsSync(options.configDir + "/" + process.env.NODE_ENV +
        ".json")) {
        console.info("No config file present for environment '" +
            process.env.NODE_ENV + "'. Falling back to default configuration.");
    } else {
        fileConfig = _.clone(require(options.configDir + "/" +
            process.env.NODE_ENV + ".json"));
    }

    // Convert environ config to an object
    var envConfig = {};
    for(var key in envVars) {
        if(_.has(options.envMap, key)) {
            var envVar = envVars[key],
                oldKey = key,
                newKey = options.envPrefix + "__" + options.envMap[oldKey];

            envVars[newKey] = envVar;
            delete envVars[oldKey];
            key = newKey;
        }

        if((new RegExp("^" + options.envPrefix, "i")).test(key)) {
            var splitKey = key
                .replace(options.envPrefix + "__", "")
                .toLowerCase()
                .split("__"),
                memo = null;

            // Camelcase the environment variable using "_"
            for(var x in splitKey) {
                if(/_/.test(splitKey[x])) {
                    var splitSplitKey = splitKey[x].split("_");
                    for(var i = 1; i < splitSplitKey.length; i++) {
                        splitSplitKey[i] =
                            splitSplitKey[i].substr(0, 1).toUpperCase() +
                            splitSplitKey[i].substr(1, splitSplitKey[i].length);
                    }
                    splitKey[x] = splitSplitKey.join("");
                }
            }

            // Basic type detection and parsing
            if(_.isFinite(envVars[key])) {
                memo = parseFloat(envVars[key]);
            } else if(/^true$/i.test(envVars[key])) {
                memo = true;
            } else if(/^false$/i.test(envVars[key])) {
                memo = false;
            } else {
                memo = envVars[key];
            }

            envConfig = _.merge(envConfig, _.reduceRight(splitKey, mergeReduce,
                memo));
        }
    }

    // Convert CLI args to an object
    var argConfig = {};
    for(var arg in argv) {
        if(arg !== "_") {
            var splitArg = arg
                .split("-"),
                memo = argv[arg];

            argConfig = _.merge(argConfig, _.reduceRight(splitArg, mergeReduce,
                memo));
        }
    }

    config = _.merge(_.cloneDeep(defaultConfig), _.cloneDeep(fileConfig),
        _.cloneDeep(envConfig), _.cloneDeep(argConfig), {
        "_default": defaultConfig,
        "_file": fileConfig,
        "_env": envConfig,
        "_arg": argConfig
    });

    return _.cloneDeep(config);
};

