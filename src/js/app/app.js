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
        usrPreferences = JSON.parse($("#usrPreferences").text() || "{}"),
        preferences = $.extend( {}, stdPreferences, usrPreferences, window.f5CoreInfo);
//- Parse stringified/converted dates and re-convert to true date format
    preferences.update.lastCheck = new Date(Date.parse(preferences.update.lastCheck));
    $.each(preferences.timeSlots, function(){
        this.from = new Date(1970,0,1,(this.from/60>>0),(this.from % 60),0 );
        this.to = new Date(1970,0,1,(this.to/60>>0),(this.to % 60),0 );
    });
//- Provide preferences through dependency injection
    return preferences;
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
    };

}]);

f5SkinApp.controller("tmplGrunddatenController", ["$scope", "Preferences", function($scope, preferences){
    $scope.input = preferences;

    $scope.setStaticFolder = function(){
        $scope.input.site.imgFolder = $scope.input.staticUrl + $scope.input.userName + "/images/";
    };

    $scope.testLoader = function(){
        $("#loader-wrapper").show(0).delay(3000).hide(0);
    };
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

    $scope.slotCheck = function(){
        var slots=$scope.input.timeSlots, slotEnd=-1, status=(slots.length>0 ? "" : "Keine Hintergrund-Zeitfenster vorhanden!");
        $.each( $scope.input.timeSlots, function(){
            //console.log("from: "+utils.getMinute(this.from)+" slotEnd: "+slotEnd+" ("+(slotEnd+1)+")");
            if (utils.getMinute(this.from)!==slotEnd+1){
                status = (slotEnd<0
                       ? "Die Zeitangabe beginnt nicht bei 00:00 Uhr!"
                       : "Es besteht eine Zeitlücke bei "+utils.formatTime(this.from)+" Uhr!");
                return false;
            } else slotEnd = utils.getMinute(this.to);
        });
        if (status.length===0 && slotEnd!==23*60+59) status = "Die Zeitangabe endet nicht bei 23:59 Uhr!";
        $scope.slotStatusOK = (status.length===0);
        $scope.slotStatus = ($scope.slotStatusOK ? "Alle Hintergrund-Zeitfenster vollständig definiert." : status);
    };

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
        $scope.slotCheck();
        $scope.isEditMode = $scope.isCreateMode = false;
    };

    $scope.sort = function(){
        $scope.input.timeSlots.sort( function(a,b){ return utils.getMinute(a.from) - utils.getMinute(b.from); });
    };

    $scope.findFirst = function(cbSelectCondition){
        var slots = $scope.input.timeSlots, selectedIndex = -1;
        $.each( slots, function(index, slot){
            if (cbSelectCondition(slot)){
                selectedIndex = index;
                return false;
            }
        });
        return selectedIndex;
    };

    $scope.insert = function(){
//----- Get the currently defined timeslots
        var slots = $scope.input.timeSlots, slot, sIdx = 0, clone = null;
//----- Delete all old slots that are encompassed/embedded by the new slot
        while (sIdx<slots.length){
            slot = slots[sIdx];
            if (slot.from>=$scope.slot.from && slot.to<=$scope.slot.to)
                $scope.remove(sIdx, false);
            else
                sIdx++;
        }
//----- Find the first slot where new-fromTime is included
        sIdx = $scope.findFirst(function(thisSlot){ return ($scope.slot.from<thisSlot.to); });
        if (sIdx>=0){
            if ($scope.slot.from>slots[sIdx].from && $scope.slot.to<slots[sIdx].to){
                clone = angular.copy(slots[sIdx]);
                clone.from = utils.addMinutes($scope.slot.to, +1);
                slots[sIdx].to = utils.addMinutes($scope.slot.from, -1);
            } else if ($scope.slot.from<=slots[sIdx].from && $scope.slot.to<slots[sIdx].to){
                slots[sIdx].from = utils.addMinutes($scope.slot.to, +1);
            } else if ($scope.slot.to>=slots[sIdx].to){
                slots[sIdx].to = utils.addMinutes($scope.slot.from, -1);
                if (slots.length>sIdx+1) slots[sIdx+1].from = utils.addMinutes($scope.slot.to, +1);
            }
        }
//----- Push the new slot to the array
        slots.push($scope.slot);
//----- Push the clone slot to the array if there is one
        if (clone!==null) slots.push(clone);
//----- and re-sort
        $scope.sort();
    };

    $scope.update = function(){
        $scope.input.timeSlots[$scope.index] = $scope.slot;
        $scope.sort();
    };

    $scope.remove = function(index, nocheck){
//----- Get the currently defined timeslots
        var slots = $scope.input.timeSlots;
//----- If index to delete is not the first, then consolidate times with preceeding timeslot
        if (index>0) slots[index-1].to = slots[index].to;
//----- If index is the first and there is a succeeding timeslot, consolidate with succeeding timeslot
        else if (slots.length>1) slots[1].from = slots[0].from;
//----- anyway delete this index now
        slots.splice(index, 1);
//----- and re-check the slots status unless internal call from insert function
        if (nocheck || true) $scope.slotCheck();
    };

    $scope.create = function(){
        $scope.slot = {
              "from": new Date(1970,0,1,0,0,0), "to": new Date(1970,0,1,23,59,0),
              "repeat": "no-repeat", "position": "center top", "size": "cover",
              "attachment": "fixed", "href": $scope.input.site.imgFolder };
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

    $scope.slotCheck();

}]);

f5SkinApp.controller("tmplAktualisierung", ["$scope", "$filter", "$http", "Preferences", function($scope, $filter, $http, preferences){
    $scope.input = preferences;

    $scope.msgClose = true;

    $scope.dateNextCheck = function(){
        return ($scope.input.update.gap<0
            ? "Keine Prüfung"
            : $filter('date')(new Date($scope.input.update.lastCheck.getTime()+$scope.input.update.gap), "dd.MM.yyyy hh:mm"));
    };

    $scope.updateChecks = [
        { check: "täglich", gap: 24*60*60*1000 },
        { check: "wöchentlich", gap: 7*24*60*60*1000 },
        { check: "monatlich", gap: 30*24*60*60*1000 },
        { check: "niemals", gap: -1 }
    ];

    $scope.useFrequency = function(index){
        var frequency = $scope.updateChecks[index];
        $scope.input.update.check = frequency.check;
        $scope.input.update.gap = frequency.gap;
    };

    $scope.checkForUpdate = function(){
        $http.get($scope.input.update.releaseUrl+"releaseinfo.xml")
          .success(function(data, status, headers, config){
                var $data = $(data);
                $scope.version = $data.find("version").text();
                $scope.releaseDate = new Date(Date.parse($data.find("releasedate").text()));
                $scope.newVersion = (utils.parseVersion($scope.version)>utils.parseVersion($scope.input.update.version));
                $scope.msgClose = false;
          })
          .error(function(data, status, headers, config){
          });
    };

    $scope.downloadRelease = function(){
        alert("Download started!");
    }
}]);