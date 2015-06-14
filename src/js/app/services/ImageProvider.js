'use strict';
var utils = require('../utils.js');

module.exports = function($http, $q){

    return {

        load: function(url, params){

            var q = $q.defer(), config = {};

            config.params = params || {};
            if ('api_key' in config.params) config.params.api_key = utils.getRequestID();

            $http.get( url, config )

                .success(function(data) { q.resolve(data); })
                .error(function(data, status){ q.reject([], status); });

            return q.promise;

        }
    };
};