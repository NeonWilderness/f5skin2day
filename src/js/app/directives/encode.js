'use strict';
var utils = require('../utils.js');

module.exports = function(){

    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, element, attrs, ngModel){

          // model to view
          ngModel.$formatters.push(function(value) {
              return utils.rot13(value).replace('mailto:', '');
          });

          // view to model
          ngModel.$parsers.push(function(value) {
              value = $.trim(value);
              if (value.indexOf('mailto:')<0) value = 'mailto:' + value;
              return utils.rot13(value);
          });

        }
    }
};