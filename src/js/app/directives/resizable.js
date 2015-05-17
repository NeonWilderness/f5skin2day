'use strict';

module.exports = function($window){

    return {
        restrict: 'A',
        controller: function ($scope, $element) {

            var resizePhotoContainer = function(){
                $scope.width = $element.width();
                $scope.height = Math.round($scope.width/1.5);
                $element.css('height', $scope.height+'px');
            };

            angular.element($window).bind('resize', resizePhotoContainer);

            resizePhotoContainer();

        }
    }
};