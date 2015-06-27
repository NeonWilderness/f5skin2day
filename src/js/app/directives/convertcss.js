'use strict';

var utils = require('../utils.js');

module.exports = function(){

    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, element, attrs, ngModel){

            // do nothing if no ng-model
            if (!ngModel) return;

            ngModel.$render = function(){
                element.val(ngModel.$viewValue || '');
            };

            // model to view
            ngModel.$formatters.push(function(styleJson) {
                return utils.JsonToCss(styleJson, attrs.divide==='linebreak');
            });

            // view to model
            ngModel.$parsers.push(function(css) {
                var styleJson = {}, colon, style, attr;
                angular.forEach(css.split(';'), function(styleTag){
                    if (styleTag.length===0) return true;
                    colon = styleTag.indexOf(':');
                    if (colon<0){
                        ngModel.$setValidity('missingColon', false);
                        return false;
                    } else ngModel.$setValidity('missingColon', true);
                    style = $.trim(styleTag.substr(0,colon));
                    attr = $.trim(styleTag.substr(colon+1));
                    styleJson[style] = attr;
                });
                return styleJson;
            });

        }
    };
};