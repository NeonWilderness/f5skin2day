'use strict';
require('jquery');
var utils = require('../utils.js');

module.exports = function($http, $q, toastr){

    return {

        onLoad: function(param){

            if (param.update.lastCheck.getTime()+param.update.gap < Date.now()){
                this.verify(param).then(
                    function(release){
                        if (release.newVersion){
                            toastr.info('Es ist eine neuere Version der Blog App verfügbar! Sie können diese über '+
                                '<i class="fa fa-cogs"></i> und <strong>Aktualisierung</strong> herunterladen.',
                                param.msgHeader);
                        }
                    },
                    function(status){
                        toastr.error('Fehler bei der Prüfung auf eine neue App-Version: '+status,
                                param.msgHeader);
                    }
                );
            }

        },

        verify: function(param){

            var q = $q.defer();

            $http.get(param.update.releaseUrl + "releaseinfo.xml")
            .success(function (data){
                var release = utils.getRelease($(data)),
                    newVersion = (utils.parseVersion(release.version) > utils.parseVersion(param.update.version));
                q.resolve({ 'data': release, 'newVersion': newVersion });
            })
            .error(function (data, status){
                q.reject(status);
            });

            return q.promise;

        }
    };
};