'use strict';

module.exports = function($rootScope, $filter, $q, UpdateCheck, TwodaySkin, toastr){
    
    var vm = this;
    
    vm.param = $rootScope.param;

    vm.msgClose = true;
    vm.isChecking = false;

    vm.dateNextCheck = function(){
        return (vm.param.update.gap<0
            ? "Keine Prüfung"
            : $filter('date')(new Date(vm.param.update.lastCheck.getTime()+vm.param.update.gap), "dd.MM.yyyy HH:mm"));
    };

    vm.updateChecks = [
        { check: "täglich", gap: 24*60*60*1000 },
        { check: "wöchentlich", gap: 7*24*60*60*1000 },
        { check: "monatlich", gap: 30*24*60*60*1000 },
        { check: "niemals", gap: -1 }
    ];

    vm.useFrequency = function(index){
        var frequency = vm.updateChecks[index];
        vm.param.update.check = frequency.check;
        vm.param.update.gap = frequency.gap;
    };

    vm.checkSkinUpdate = function(){

        var skinEditUrl = vm.param.layoutUrl+"skins/edit?key=",
            promises = [];

        $.each( vm.release.skins, function(){
            promises.push( TwodaySkin.get(skinEditUrl+this.name) );
        });

        $q.all(promises).then( function(results){ // success: all skins read

            $.each( results, function(index, response){ // response = {config, data, headers, status, statusText}

                var skin = vm.release.skins[index];
                var $form = $(response.data).find("form").eq(0);
                var skinCode = $.trim($form.find("textarea[name=skin]").val());
                var isSkinInitial = (skinCode.length === 0);
                if (typeof vm.param.update.overwrite[skin.name] !== "undefined"){
                    switch(vm.param.update.overwrite[skin.name]){ // always, never
                        case "always": skin.status = "needsupdate"; break;
                        case "never":  skin.status = (isSkinInitial ? "needsupdate" : "skipped"); break;
                    }
                } else {
                    skin.status = (skin.content.length===skinCode.length && skin.content===skinCode ? "isequal" : "needsupdate");
                }
                console.log("Index:", index, skin.name, isSkinInitial, "Rlse:", skin.content.length, "Blog:", skinCode.length, skin.status);
            });

            vm.releaseChecked = true;
        }, function(){ // error: at least one skin read failed
            toastr.error("Mindestens ein Skin konnte nicht fehlerfrei gelesen werden!", vm.param.msgHeader);
        });
    };

    vm.checkReleaseUpdate = function(){

        vm.isChecking = true;
        vm.releaseLoaded = true;
        vm.releaseChecked = false;

        UpdateCheck.verify(vm.param).then(
            function(release){
                vm.release = release.data;
                vm.newVersion = release.newVersion;
                vm.msgClose = false;
                vm.param.update.lastCheck = new Date();
                vm.isChecking = false;
                if (vm.newVersion) vm.checkSkinUpdate();
            },
            function(status){
                vm.isChecking = vm.releaseLoaded = vm.msgClose = false;
            });

    };

    vm.updateStatus = function(skinStatus){

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

    vm.installRelease = function(){

        $.each( vm.release.skins, function(){
            var skin = this;
            if (skin.status === "needsupdate"){
                TwodaySkin.update(skin, vm.param).then(function(skin){
                    // success: skin.status already updated
                }, function(status, skin){
                    // error: skin.status already updated
                });
            }
        });

    };

};
