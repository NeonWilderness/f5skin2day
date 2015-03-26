var angular = require('angular'),
    utils = require('./utils.js'),
    jq = angular.element;

//--- Pimp old Twoday classes, e.g. button in a .message
utils.pimpClasses();

//--- Set up the Angular controller
var f5SkinApp = angular.module('f5SkinApp', []);
f5SkinApp.controller('F5SkinController', ['$scope', function ($scope){
    var stdPreferences = JSON.parse(jq('#stdPreferences').text() || "{}"),
        usrPreferences = JSON.parse(jq("#usrPreferences").text() || "{}");
    $scope.param = angular.extend( {}, stdPreferences, usrPreferences, f5CoreInfo );
    if ($scope.param.topbar.menuItems.topics.text==="")
        $scope.param.topbar.menuItems.topics.text = $scope.siteAlias.toLowerCase();
    $scope.param.topbar.menuItems.topics.class["has-dropdown"] = jq('#toolbarTopics').has('.dropdown');
    $scope.param.topbar.breadcrumbs = utils.getBreadCrumbs(this.param.navPath);
    $scope.param.isLoggedIn = function(){ return (this.param.userName.length>0); };
    $scope.param.isAdmin = function(){
        return (this.param.isLoggedIn() && this.param.userRole()==="Administrator");
    };
    $scope.param.isContributor = function(){
        return (this.param.isLoggedIn() && (this.param.userRole()==="Contributor" || this.param.userRole()==="Administrator"));
    };
    $scope.param.sendMail = function(){ window.location.href = utils.rot13(this.param.topbar.mailIcon.href); }
}]);