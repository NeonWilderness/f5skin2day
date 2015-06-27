'use strict';

var jsondiff = require('rfc6902-json-diff'),
    utils = require('../utils.js');

module.exports = function(CacheItem, TwodaySkin, toastr){

    return {
        //-- type: "standard" or "consolidated" (incl. usrPreferences)
        get: function(type){

            //- Read preferences from cache
            var cachedPreferences = CacheItem.get(type+'Preferences');

            //- Have they been cached before?
            if (cachedPreferences){
                return cachedPreferences;
            } else {

                //- Consolidate (deep merge) standardPreferences, userPreferences and generic core info from Twoday macros
                var stdPreferences = JSON.parse($("#stdPreferences").text() || "{}"),
                    usrPreferences = (type === "consolidated" ? JSON.parse($("#usrPreferences").text() || "{}") : {}),
                    preferences = $.extend( true, {}, stdPreferences, usrPreferences, window.f5CoreInfo );

                //- Parse stringified/converted dates and re-convert to true date format
                preferences.update.lastCheck = new Date(Date.parse(preferences.update.lastCheck));
                angular.forEach(preferences.timeSlots, function (slot) {
                    slot.from = new Date(1970, 0, 1, (slot.from / 60 >> 0), (slot.from % 60), 0);
                    slot.to = new Date(1970, 0, 1, (slot.to / 60 >> 0), (slot.to % 60), 0);
                });

                //- Add all format color/background-color attributes to the style option
                angular.forEach(preferences.format, function(options){
                    utils.extendColor(options);
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
            //- Refactor timeslots to a minute number
            angular.forEach(prefs.timeSlots, function (slot) {
                slot.from = utils.getMinute(slot.from);
                slot.to = utils.getMinute(slot.to);
                if (typeof slot.$$hashKey !== 'undefined') delete(slot.$$hashKey);
            });
            //- Remove the format color/background-color attributes from the style option
            angular.forEach(prefs.format, function(options){
                utils.extractColor(options);
            });
            return prefs;

        },

        save: function(param){

            var stdPreferences = this.get("standard"),
                usrPreferences = {},
                cleanParam = this.refactor(param),
                patch = jsondiff(stdPreferences, param),
                excludes = '$$|update/version|topics/drop|breadcrumbs/items|images/items|abo/items'.split('|'),
                i, len, names, objPath, arrayCheck;

            //- save consolidated param as well to the cache
            CacheItem.put('consolidatedPreferences', param);

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

            TwodaySkin.update(
                { name: "Site.usrPreferences", content: angular.toJson(usrPreferences, true), status: "unsaved"},
                param
            ).then( function(skin){
                // success: no user message needed
            }, function(status, skin){
                toastr.error("Skin: '"+skin.name+"' konnte nicht erfolgreich aktualisiert werden (Status: "+status+").", param.msgHeader);
            });

        }
    }

};