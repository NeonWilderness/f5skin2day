require('jquery');
var angular = require('angular'),
    background = require('./background.js'),
    bodyclass = require('./bodyclass.js'),
    utils = require('./utils.js');

//--- Add additional body classes for individualized CSS rules
bodyclass();

//--- Pimp old Twoday classes, e.g. button in a .message
utils.pimpClasses();

//--- Set up the Angular app and controller
var f5SkinApp = angular.module("f5SkinApp", ['mm.foundation']);
f5SkinApp.controller("F5SkinController", ["$scope", function ($scope){

//- Consolidate standardPreferences, userPreferences and generic core info from Twoday macros
    var stdPreferences = JSON.parse($("#stdPreferences").text() || "{}"),
        usrPreferences = JSON.parse($("#usrPreferences").text() || "{}");
    $scope.param = $.extend( {}, stdPreferences, usrPreferences, f5CoreInfo );

//- Set background image based on hour of the day and user defined image items/slots
    background.setImage($scope.param.timeSlots);

//- Set default value for topics.text if user has not provided one
    if ($scope.param.topbar.menuItems.topics.text.length===0)
        $scope.param.topbar.menuItems.topics.text = $scope.param.siteAlias.toLowerCase();

//- Adjust topics.class if topiclist-macro has found/generated any story topics
    $scope.param.topbar.menuItems.topics.class = ($("#toolbarTopics").has(".dropdown") ? "has-dropdown" : "");

//- Extract breadcrumb/special menu links and put them into the scope
    $scope.param.topbar.menuItems.breadcrumbs.items = utils.getBreadcrumbs();
    $scope.param.topbar.menuItems.abo.items = utils.getSpecialMenu("#aboMenu");
    $scope.param.topbar.menuItems.images.items = utils.getSpecialMenu("#imageMenu");

//- Add utility functions to be used in ng-functions (view)
    $scope.param.isLoggedIn = function(){
        return ($scope.param.userName.length>0);
    };
    $scope.param.isAdmin = function(){
        return ($scope.param.isLoggedIn() && $scope.param.userRole()==="Administrator");
    };
    $scope.param.isContributor = function(){
        return ($scope.param.isLoggedIn() && ($scope.param.userRole()==="Contributor" || $scope.param.userRole()==="Administrator"));
    };
    $scope.param.sendMail = function(){
        window.location.href = utils.rot13($scope.param.topbar.mailIcon.href);
    };
//- When true (user clicked the close button), it triggers the fadeout of the response alert-box
    $scope.msgClose = false;
}]);