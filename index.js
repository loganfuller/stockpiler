"use strict";

if(typeof process.env.NODE_ENV === "undefined") {
    process.env.NODE_ENV = "development";
}

var fs = require("fs"),
    path = require("path"),
    _ = require("lodash"),
    minimist = require("minimist"),
    defaultConfigDir = path.join(__dirname, "..", "..", "config"),
    defaultsDeep = _.partialRight(_.merge, _.defaults),
    defaultOptions = {
        configDir: defaultConfigDir,
        defaultsDir: defaultConfigDir,
        envPrefix: "STOCKPILER",
        envMap: {},
        cacheConfig: true
    },
    _config;

var mergeReduce = function (memo, val) {
    var tmp = {};
    tmp[val] = memo;
    return tmp;
};

// Config class
var Config = function(defaultConfig, fileConfig, envConfig, argConfig) {
    var mergedConfig = _.merge({}, defaultConfig, fileConfig, envConfig, argConfig);

    for(var prop in mergedConfig) {
        this[prop] = mergedConfig[prop];
    }

    Object.defineProperties(this, {
        "_default": {
            value: defaultConfig,
            enumerable: false
        },
        "_file": {
            value: fileConfig,
            enumerable: false
        },
        "_env": {
            value: envConfig,
            enumerable: false
        },
        "_arg": {
            value: argConfig,
            enumerable: false
        }
    });
};

module.exports = function (opts) {
    var options = defaultsDeep(_.isPlainObject(opts) ? opts : {},
        defaultOptions);

    // Stockpiler environment overrides
    if (process.env.STOCKPILER_CONFIG_DIR) {
        options.configDir = process.env.STOCKPILER_CONFIG_DIR;
    }
    if (process.env.STOCKPILER_DEFAULTS_DIR) {
        options.defaultsDir = process.env.STOCKPILER_DEFAULTS_DIR;
    } else {
        options.defaultsDir = options.configDir;
    }

    if(options.cacheConfig && _config) {
        return _config;
    }

    var defaultConfig = (fs.existsSync(options.defaultsDir + "/default.json") ?
        _.cloneDeep(require(options.defaultsDir + "/default.json")) : {}),
        argv = minimist(process.argv.slice(2)),
        envVars = _.clone(process.env);

    // Environment specific JSON configuration
    var fileConfig = {};
    if(!fs.existsSync(options.configDir + "/" + process.env.NODE_ENV +
        ".json")) {
        console.info("No config file present for environment '" +
            process.env.NODE_ENV + "'. Falling back to default configuration.");
    } else {
        fileConfig = _.cloneDeep(require(options.configDir + "/" +
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

    var configInstance = new Config(defaultConfig, fileConfig, envConfig, argConfig);

    if(options.cacheConfig) _config = configInstance;

    return configInstance;
};
