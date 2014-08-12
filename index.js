"use strict";

if(typeof process.env.NODE_ENV === "undefined") {
    process.env.NODE_ENV = "development";
}

var fs = require("fs"),
    _ = require("lodash"),
    defaultsDeep = _.partialRight(_.merge, _.defaults),
    defaultOptions = {
        propagate: true,
        configDir: __dirname + "/../../config",
        envOverride: true,
        envPrefix: "STOCKPILER",
        exposeAllToClient: false,
        cacheConfig: true
    },
    config = {};

module.exports = function (opts) {
    var options = _.defaults(_.isPlainObject(opts) ? opts : {}, defaultOptions),
        defaultConfig = fs.existsSync(options.configDir + "/default.json") ?
        require(options.configDir + "/default.json") : {};

    if(options.cacheConfig && !_.isEmpty(config)) {
        return config;
    } else {
        config = {};
    }

    // Environment specific JSON configuration
    if(!fs.existsSync(options.configDir + "/" + process.env.NODE_ENV + ".json")) {
        console.info("No config file present for environment '" +
            process.env.NODE_ENV + "'. Falling back to default configuration.");
        config = _.clone(defaultConfig);
    } else {
        config = defaultsDeep(_.clone(require(options.configDir + "/" +
            process.env.NODE_ENV + ".json")), _.clone(defaultConfig));
    }

    // Convert environ config to an object
    var envConfig = {},
        mergeReduce = function (memo, val) {
            var tmp = {};
            tmp[val] = memo;
            return tmp;
        };
    for(var key in process.env) {
        if((new RegExp("^" + options.envPrefix, "i")).test(key)) {
            var splitKey = key
                .replace(options.envPrefix + "_", "")
                .toLowerCase()
                .split("_"),
                memo = null;

            // Camelcase the environment variable using "-"
            for(var x in splitKey) {
                if(/-/.test(splitKey[x])) {
                    var splitSplitKey = splitKey[x].split("-");
                    for(var i = 1; i < splitSplitKey.length; i++) {
                        splitSplitKey[i] =
                            splitSplitKey[i].substr(0, 1).toUpperCase() +
                            splitSplitKey[i].substr(1, splitSplitKey[i].length);
                    }
                    splitKey[x] = splitSplitKey.join("");
                }
            }

            // Basic type detection and parsing
            if(_.isFinite(process.env[key])) {
                memo = parseFloat(process.env[key]);
            } else if(/^true$/i.test(process.env[key])) {
                memo = true;
            } else if(/^false$/i.test(process.env[key])) {
                memo = false;
            } else {
                memo = process.env[key];
            }

            envConfig = _.merge(envConfig, _.reduceRight(splitKey, mergeReduce,
                memo));
        }
    }

    // Override JSON config with environment variables
    if(_.size(envConfig)) {
        config = _.merge(config, envConfig);
    }

    return config;
};

