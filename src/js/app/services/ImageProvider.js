'use strict';

module.exports = function($http, $q){

    return {

        load: function(url){

            var q = $q.defer();

            $http.get( url )

                .success(function(data) { q.resolve(data); })
                .error(function(data, status){ q.reject([], status); });

            return q.promise;

        }
    };
};