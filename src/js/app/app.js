var angular = require('angular'),
    utils = require('./utils.js');

//--- Pimp old Twoday classes, e.g. button in a .message
utils.pimpClasses();

//--- Set up the Angular controller
var f5SkinApp = angular.module('f5SkinApp', []);
f5SkinApp.controller('F5SkinController', ['$scope', '$sce', function ($scope, $sce){
    var stdPreferences = JSON.parse($('#stdPreferences').text() || "{}"),
        usrPreferences = JSON.parse($("#usrPreferences").text() || "{}");
    $scope.param = $.extend( {}, stdPreferences, usrPreferences, f5CoreInfo );
    if ($scope.param.topbar.menuItems.topics.text==="")
        $scope.param.topbar.menuItems.topics.text = $scope.param.siteAlias.toLowerCase();
    $scope.param.topbar.menuItems.topics.class["has-dropdown"] = $('#toolbarTopics').has('.dropdown');
    $scope.param.topbar.menuItems.breadcrumbs.items = utils.getBreadcrumbs();
    $scope.param.topbar.menuItems.abo.items = $sce.trustAsHtml(utils.getSpecialMenu("#aboMenu"));
    $scope.param.topbar.menuItems.images.items = $sce.trustAsHtml(utils.getSpecialMenu("#imageMenu"));
    $scope.param.isLoggedIn = function(){ return ($scope.param.userName.length>0); };
    $scope.param.isAdmin = function(){
        return ($scope.param.isLoggedIn() && $scope.param.userRole()==="Administrator");
    };
    $scope.param.isContributor = function(){
        return ($scope.param.isLoggedIn() && ($scope.param.userRole()==="Contributor" || $scope.param.userRole()==="Administrator"));
    };
    $scope.param.sendMail = function(){
        window.location.href = utils.rot13($scope.param.topbar.mailIcon.href);
    };
}]);

//------- Defines a new directive for generating a type-dependant user custom menu-item (see param.topbar.addCustomMenu.items)
f5SkinApp.directive('custom-menuitem', function(menuitem){
    return {
        restrict: 'E', // E = element, A = attribute, C = class, M = comment
        template: '<li>'+(menuitem.type==='label' ? '<label>'+menuitem.text+'</label>' : '<a target="_blank" href="'+menuitem.href+'">'+menuitem.text+'</a>')+'</li>'
    };
});