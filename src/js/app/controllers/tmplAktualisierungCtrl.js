'use strict';
require('jquery');
var utils = require('../utils.js');

module.exports = function($scope, $filter, $http, $q, Preferences, UpdateCheck){

    $scope.input = Preferences.get();

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

    $scope.synchronousSkinUpdate = function(index){
        do { ++index; }
        while (index<$scope.release.skins.length && $scope.release.skins[index].status !== "needsupdate");
        if (index>=$scope.release.skins.length) return;
        var skin = $scope.release.skins[index];
        console.log("Index:", index, skin.name, skin.status);
        $http.get( $scope.input.layoutUrl+"skins/edit?key="+skin.name )
            .success(function(data){
                var $form = $(data).find("form").eq(0);
                $http({
                    method: $form.attr("method"),
                    url: $form.attr("action"),
                    headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'},
                    data: $.param({
                        secretKey: $form.find("input[name=secretKey]").val(),
                        action: $form.find("input[name=action]").val(),
                        key: $form.find("input[name=key]").val(),
                        skinset: $form.find("input[name=skinset]").val(),
                        module: $form.find("input[name=module]").val(),
                        title: $form.find("input[name=title]").val(),
                        description: $form.find("textarea[name=description]").html(),
                        skin: skin.content,
                        save: $form.find("input[name=save]").val()
                    })
                })
                .success(function(data){
                    skin.status = "updated";
                    $scope.synchronousSkinUpdate(index);
                })
                .error(function(data, status){
                    skin.status = "error~"+status;
                });
            })
            .error(function(data, status){
                skin.status = "error~"+status;
            });
    };

    $scope.checkSkinUpdate = function(){
        var skinEditUrl = $scope.input.layoutUrl+"skins/edit?key=",
            promises = [];
        $.each( $scope.release.skins, function(){ promises.push( $http.get(skinEditUrl+this.name) ); });
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
            console.error("Error reading skins:", results);
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
        $scope.synchronousSkinUpdate(-1);
    };

};
