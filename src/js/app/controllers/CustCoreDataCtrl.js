'use strict';

module.exports = function($rootScope, ImageProvider, toastr){

    var vm = this;
    
    vm.param = $rootScope.param;

    vm.verifyDriveFolder = function(){
        if (vm.param.site.imgFolder.length===0){
            vm.param.site.isFolderVerified = false;
            return;
        }
        ImageProvider.load( vm.param.site.imgFolder ).then(
            function(data){
                var linkToGoogleDrive = $(data).find(".folder-drive-logo>a").eq(0);
                vm.param.site.isFolderVerified = (linkToGoogleDrive.length>0 && linkToGoogleDrive[0].href.indexOf("drive.google.com")>0);
                if (vm.param.site.isFolderVerified)
                    toastr.success("Das GoogleDrive-Verzeichnis kann nun verwendet werden!", vm.param.msgHeader);
                else
                    toastr.error("Das Verzeichnis ist kein gültiges GoogleDrive-Verzeichnis!", vm.param.msgHeader);
            },
            function(){
                vm.param.site.isFolderVerified = false;
                toastr.error("Auf das angegebene Verzeichnis konnte nicht zugegriffen werden!", vm.param.msgHeader);
            }
        );
    };

    vm.testLoader = function(){
        $("#loader-wrapper").show(0).delay(3000).hide(0);
    };

};
