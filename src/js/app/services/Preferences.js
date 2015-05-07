'use strict';
require('jquery');
var jsondiff = require('rfc6902-json-diff'),
    utils = require('../utils.js');

module.exports = function(CacheItem){

    return {
        //-- type: "standard" or "consolidated" (incl. usrPreferences)
        get: function(type){

            //- Read preferences from cache
            var cachedPreferences = CacheItem.get(type+'Preferences');

            //- Have they been cached before?
            if (cachedPreferences){
                return cachedPreferences;
            } else {

                //- Consolidate standardPreferences, userPreferences and generic core info from Twoday macros
                var stdPreferences = JSON.parse($("#stdPreferences").text() || "{}"),
                    usrPreferences = (type === "consolidated" ? JSON.parse($("#usrPreferences").text() || "{}") : {}),
                    preferences = $.extend({}, stdPreferences, usrPreferences, window.f5CoreInfo);

                //- Parse stringified/converted dates and re-convert to true date format
                preferences.update.lastCheck = new Date(Date.parse(preferences.update.lastCheck));
                $.each(preferences.timeSlots, function () {
                    this.from = new Date(1970, 0, 1, (this.from / 60 >> 0), (this.from % 60), 0);
                    this.to = new Date(1970, 0, 1, (this.to / 60 >> 0), (this.to % 60), 0);
                });

                //- Put preferences into cache area
                CacheItem.put(type+'Preferences', preferences);

                //- and return the preferences object
                return preferences;

            }

        },

        refactor: function(param){

            var prefs = {};
            $.extend( true, prefs, param );
            $.each(prefs.timeSlots, function () {
                this.from = utils.getMinute(this.from);
                this.to = utils.getMinute(this.to);
                if (typeof this.$$hashKey !== 'undefined') delete(this.$$hashKey);
            });
            return prefs;

        },

        save: function(param){

            var stdPreferences = this.get("standard"),
                usrPreferences = {},
                cleanParam = this.refactor(param),
                patch = jsondiff(stdPreferences, param),
                excludes = '$$|topics/drop|breadcrumbs/items|images/items|abo/items'.split('|'),
                i, len, names, objPath, arrayCheck;

            //console.dir(patch);
            $.each( patch, function(){

                //- do not include functions whatsoever
                if (typeof this.value === "function") return true;

                //- test for excludes to be ignored
                for (i=0, len=excludes.length; i<len; ++i){
                    if (this.path.indexOf(excludes[i])>=0) return true;
                }

                //- eliminate 1st slash and split path into field names (e.g. "/site/title" --> ["site", "title"])
                names = this.path.substr(1).split('/');
                objPath = 'usrPreferences';
                for (i=0, len=names.length; i<len; ++i){
                    objPath += '.'+names[i];
                    if (i+1 === len){
                        if (typeof this.value.$$hashKey !== 'undefined') delete(this.value.$$hashKey);
                        eval(objPath+'=this.value');
                    } else {
                        arrayCheck = 'cleanParam.'+objPath.substr(15);
                        if (eval('angular.isArray('+arrayCheck+')')){
                            if (eval('typeof ' + objPath) === 'undefined'){
                                eval(objPath+'='+arrayCheck);
                            }
                            return true;
                        } else {
                            if (eval('typeof ' + objPath) === 'undefined') {
                                eval(objPath + '={}');
                            }
                        }
                    }
                }
            });

            console.log(JSON.stringify(usrPreferences));
            // UpdateSkin({ name: "Site.usrPreferences", content: JSON.stringify(usrPreferences), status: "unsaved"});

        }
    }

};