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

f5SkinApp.factory("Preferences", function(){
//- Consolidate standardPreferences, userPreferences and generic core info from Twoday macros
    var stdPreferences = JSON.parse($("#stdPreferences").text() || "{}"),
        usrPreferences = JSON.parse($("#usrPreferences").text() || "{}");
    return ($.extend( {}, stdPreferences, usrPreferences, window.f5CoreInfo));
});

f5SkinApp.controller("F5SkinController", ["$scope", "Preferences", "$modal", function ($scope, preferences, $modal){

//- Get the consolidated preferences data
    $scope.param = preferences;

//- Set background image based on hour of the day and user defined image items/slots
    background.setImage($scope.param.timeSlots);

//- Set default value for topics.text if user has not provided one
    if ($scope.param.topbar.menuItems.topics.text.length===0)
        $scope.param.topbar.menuItems.topics.text = $scope.param.siteAlias.toLowerCase();

//- Adjust topics.class if topiclist-macro has found/generated any story topics
    $scope.param.topbar.menuItems.topics.drop = ($("#toolbarTopics").has(".dropdown"));

//- Extract breadcrumb/special menu links and put them into the scope
    $scope.param.topbar.menuItems.breadcrumbs.items = utils.getBreadcrumbs();
    console.dir($scope.param.topbar.menuItems.breadcrumbs.items);
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

    $scope.customize = {

        open: function(){
            var modalCustomize = $modal.open({
                templateUrl: "customizeBlogHtml",
                controller:  "CustomizeBlogController",
                resolve: {
                    param: function (){
                        return $scope.param;
                    }
                },
                backdrop: "static",
                keyboard: false,
                windowClass: "xlarge"
            });
            modalCustomize.result.then(function(customizedParams){
                //dosomething after OK
            }, function(message){
                //dosomething upon cancel
            });
        }
    };
}]);

f5SkinApp.controller("CustomizeBlogController", ["$scope", "$modalInstance", function ($scope, $modalInstance, param){

    $scope.param = param;

    $scope.ok = function(){
        $modalInstance.close("Pressed OK!");
    };

    $scope.cancel = function(){
        $modalInstance.dismiss("Pressed Cancel!");
    }

}]);

f5SkinApp.controller("tmplGrunddatenController", ["$scope", "Preferences", function($scope, preferences){
    $scope.input = preferences;

    $scope.setStaticFolder = function(){
        $scope.input.site.imgFolder = $scope.input.staticUrl + $scope.input.userName + "/images/";
    };

    $scope.testLoader = function(){
        $("#loader-wrapper").show(0).delay(3000).hide(0);
    }
}]);

f5SkinApp.controller("tmplHintergrundbilderController", ["$scope", "Preferences", function($scope, preferences){
    $scope.input = preferences;

    $scope.positions = [
        "left top", "left center", "left bottom",
        "right top", "right center", "right bottom",
        "center top", "center center", "center bottom"
    ];

    $scope.repeats = [ "repeat", "repeat-x", "repeat-y", "no-repeat" ];

    $scope.sizes = [ "auto", "cover", "contain" ];

    $scope.attachments = [ "fixed", "local", "scroll" ];

    $scope.isEditMode = $scope.isCreateMode = false;

    $scope.edit = function(index){
        $scope.slot = angular.copy($scope.input.timeSlots[index]);
        $scope.index = index;
        $scope.isEditMode = true;
    };

    $scope.cancel = function(){
        if ($scope.isCreateMode) delete $scope.slot;
        $scope.isEditMode = $scope.isCreateMode = false;
    };

    $scope.save = function(){
        if ($scope.isCreateMode) $scope.insert(); else $scope.update();
        $scope.isEditMode = $scope.isCreateMode = false;
    };

    $scope.insert = function(){
        $scope.input.timeSlots.push($scope.slot);
    };

    $scope.update = function(){
        $scope.input.timeSlots[$scope.index] = $scope.slot;
    };

    $scope.delete = function(index){
        $scope.input.timeSlots.splice(index, 1);
    };

    $scope.create = function(){
        $scope.slot = { "from": 0, "to": 23, "repeat": "no-repeat", "position": "top center", "size": "cover",
              "attachment": "fixed", "href": "" };
        $scope.isCreateMode = true;
    };

    $scope.usePosition = function(index){
        $scope.slot.position = $scope.positions[index];
    };

    $scope.useRepeat = function(index){
        $scope.slot.repeat = $scope.repeats[index];
    };

    $scope.useSize = function(index){
        $scope.slot.size = $scope.sizes[index];
    };

    $scope.useAttachment = function(index){
        $scope.slot.attachment = $scope.attachments[index];
    };

}]);