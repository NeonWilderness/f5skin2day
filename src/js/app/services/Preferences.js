'use strict';
require('jquery');
var jsondiff = require('rfc6902-json-diff');

module.exports = function(CacheItem){

    return {
        get: function(){

            //- Read preferences from cache
            var cachedPreferences = CacheItem.get('preferences');

            //- Have they been cached before?
            if (cachedPreferences){
                return cachedPreferences;
            } else {

                //- Consolidate standardPreferences, userPreferences and generic core info from Twoday macros
                var stdPreferences = JSON.parse($("#stdPreferences").text() || "{}"),
                    usrPreferences = JSON.parse($("#usrPreferences").text() || "{}"),
                    preferences = $.extend({}, stdPreferences, usrPreferences, window.f5CoreInfo);

                //- Parse stringified/converted dates and re-convert to true date format
                preferences.update.lastCheck = new Date(Date.parse(preferences.update.lastCheck));
                $.each(preferences.timeSlots, function () {
                    this.from = new Date(1970, 0, 1, (this.from / 60 >> 0), (this.from % 60), 0);
                    this.to = new Date(1970, 0, 1, (this.to / 60 >> 0), (this.to % 60), 0);
                });

                //- Put preferences into cache area
                CacheItem.put('preferences', preferences);

                //- and return the preferences object
                return preferences;

            }

        },

        save: function(param){
            var stdPreferences = JSON.parse($("#stdPreferences").text() || "{}");
            var patch = jsondiff(stdPreferences, param);
            console.dir(patch);
        }
    }

};