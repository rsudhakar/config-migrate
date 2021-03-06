'use strict';

var migrator = require('../lib/migrator.js');
var fs = require('fs');

exports.migrateTests = {

    setUp: function(callback) {
        this.configDirectory = __dirname+"/data/configs";
        this.migrationDirectory = __dirname+"/data/migrations";
        this.configFile = "sample-config.json";
        callback();
    },

    'default migrate': function (test) {
        var value = Math.random() * 100;
        migrator("V1__first.js", this.configDirectory, this.migrationDirectory);

        migrate(this.configFile, function (jsonObject) {
            jsonObject[0].value = value;
            return jsonObject;
        });

        var updatedJson = require(this.configDirectory + "/" + this.configFile);
        test.equal(updatedJson[0].value, value);
        test.done();
    },

    'if migration does not return anything dont write the config file': function(test) {
        var configFilePath = this.configDirectory + "/" + this.configFile;
        var initialFileContents = fs.readFileSync(configFilePath, 'utf-8');
        migrator("V1__first.js", this.configDirectory, this.migrationDirectory);

        migrate(this.configFile, function(jsonObject) {
            //return nothing as there is nothing to be done based on some condition;
        });

        var fileContentsAfterMigration = fs.readFileSync(configFilePath, 'utf-8');
        test.equals(fileContentsAfterMigration, initialFileContents);
        test.done();
    },

    'should throw error for config file not present': function(test) {
        migrator("V1__first.js", this.configDirectory, this.migrationDirectory);
        var logMessage = false;
        var originalLog = console.log;
        console.log = function(message) {
            originalLog(message);
            logMessage = message;
            return;
        };

        migrate("not-found.json", function(jsonObj){});
        test.equal(logMessage, "Config file not found: " + this.configDirectory + "/not-found.json");
        test.done();
    }
};
