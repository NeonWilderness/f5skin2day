'use strict';
require('jquery');
var utils = require('../utils.js');

module.exports = function($scope, $filter, $q, Preferences, UpdateCheck, TwodaySkin, toastr){

    $scope.input = Preferences.get("consolidated");

    $scope.msgClose = true;
    $scope.isChecking = false;

    $scope.dateNextCheck = function(){
        return ($scope.input.update.gap<0
            ? "Keine Prüfung"
            : $filter('date')(new Date($scope.input.update.lastCheck.getTime()+$scope.input.update.gap), "dd.MM.yyyy HH:mm"));
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

    $scope.checkSkinUpdate = function(){

        var skinEditUrl = $scope.input.layoutUrl+"skins/edit?key=",
            promises = [];

        $.each( $scope.release.skins, function(){
            promises.push( TwodaySkin.get(skinEditUrl+this.name) );
        });

        $q.all(promises).then( function(results){ // success: all skins read

            $.each( results, function(index, response){ // response = {config, data, headers, status, statusText}

                var skin = $scope.release.skins[index];
                var $form = $(response.data).find("form").eq(0);
                var skinCode = $.trim($form.find("textarea[name=skin]").val());
                var isSkinInitial = (skinCode.length === 0);
                if (typeof $scope.input.update.overwrite[skin.name] !== "undefined"){
                    switch($scope.input.update.overwrite[skin.name]){ // always, never
                        case "always": skin.status = "needsupdate"; break;
                        case "never":  skin.status = (isSkinInitial ? "needsupdate" : "skipped"); break;
                    }
                } else {
                    skin.status = (skin.content.length===skinCode.length && skin.content===skinCode ? "isequal" : "needsupdate");
                }
                console.log("Index:", index, skin.name, isSkinInitial, "Rlse:", skin.content.length, "Blog:", skinCode.length, skin.status);
            });

            $scope.releaseChecked = true;
        }, function(results){ // error: at least one skin read failed
            toastr.error("Mindestens ein Skin konnte nicht fehlerfrei gelesen werden!", $scope.input.msgHeader);
        });
    };

    $scope.checkReleaseUpdate = function(){

        $scope.isChecking = true;
        $scope.releaseLoaded = true;
        $scope.releaseChecked = false;

        UpdateCheck.verify($scope.input).then(
            function(release){
                $scope.release = release.data;
                $scope.newVersion = release.newVersion;
                $scope.msgClose = false;
                $scope.input.update.lastCheck = new Date();
                $scope.isChecking = false;
                if ($scope.newVersion) $scope.checkSkinUpdate();
            },
            function(status){
                $scope.isChecking = $scope.releaseLoaded = $scope.msgClose = false;
            });

    };

    $scope.updateStatus = function(skinStatus){

        var updStatus = {
                "unchecked":    "noch nicht geprüft",
                "isequal":      "ist bereits aktuell",
                "needsupdate":  "wird aktualisiert",
                "updated":      "wurde erfolgreich aktualisiert",
                "error":        "Aktualisierung fehlgeschlagen",
                "skipped":      "Benutzerskin bleibt unverändert"
            },
            statParts = skinStatus.split("~");

        return updStatus[statParts[0]]+(statParts.length>1 ? "->"+statParts[1] : "");

    };

    $scope.installRelease = function(){

        $.each( $scope.release.skins, function(){
            var skin = this;
            if (skin.status === "needsupdate"){
                TwodaySkin.update(skin, $scope.input).then(function(skin){
                    // success: skin.status already updated
                }, function(status, skin){
                    // error: skin.status already updated
                });
            }
        });

    };

};
