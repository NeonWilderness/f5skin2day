'use strict';
var background = require('../background.js'),
    utils = require('../utils.js');

module.exports = function ($scope, Preferences, UpdateCheck, $modal){

//- Get the consolidated preferences data
    $scope.param = Preferences.get("consolidated");

//- Set background image based on hour of the day and user defined image items/slots
    background.setImage($scope.param.timeSlots);

//- Set default value for topics.text if user has not provided one
    if ($scope.param.topbar.menuItems.topics.text.length===0)
        $scope.param.topbar.menuItems.topics.text = $scope.param.siteAlias.toLowerCase();

//- Adjust topics.class if topiclist-macro has found/generated any story topics
    $scope.param.topbar.menuItems.topics.drop = ($("#toolbarTopics").has(".dropdown"));

//- Extract breadcrumb/special menu links and put them into the scope
    $scope.param.topbar.menuItems.breadcrumbs.items = utils.getBreadcrumbs();
    //console.dir($scope.param.topbar.menuItems.breadcrumbs.items);
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

        hide: function(){ $('#f5container').fadeOut(); },

        show: function(){ $('#f5container').fadeIn(); },

        open: function(){
            var self = this;
            self.hide();
            var modalCustomize = $modal.open({
                templateUrl: "customizeBlogHtml",
                controller:  "CustomizeBlogCtrl",
                resolve: {
                    param: function (){
                        return $scope.param;
                    }
                },
                backdrop: "static",
                keyboard: false,
                windowClass: "xlarge"
            });
            modalCustomize.result.then(
                function(customizedParams){
                    Preferences.save($scope.param);
                    self.show();
                },
                function(message){
                    self.show();
                });
        }
    };

//- Check for available updates if user is admin and check frequency is not "never"
    if ($scope.param.isAdmin() && $scope.param.update.gap>0){
        UpdateCheck.onLoad($scope.param);
    }
};