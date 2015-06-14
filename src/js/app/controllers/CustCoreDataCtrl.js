'use strict';

module.exports = function($scope, $rootScope, ImageProvider, UserStyles, toastr){

    var vm = this;
    
    vm.param = $rootScope.param;

    vm.verifyDriveFolder = function(){
        if (vm.param.site.imgFolder.length===0){
            vm.param.site.isDriveVerified = false;
            return;
        }
        ImageProvider.load( vm.param.site.imgFolder ).then(
            function(data){
                var linkToGoogleDrive = $(data).find(".folder-drive-logo>a").eq(0);
                vm.param.site.isDriveVerified = (linkToGoogleDrive.length>0 && linkToGoogleDrive[0].href.indexOf("drive.google.com")>0);
                if (vm.param.site.isDriveVerified)
                    toastr.success("Das GoogleDrive-Verzeichnis kann nun verwendet werden!", vm.param.msgHeader);
                else
                    toastr.error("Das Verzeichnis ist kein gültiges GoogleDrive-Verzeichnis!", vm.param.msgHeader);
            },
            function(){
                vm.param.site.isDriveVerified = false;
                toastr.error("Auf das angegebene Verzeichnis konnte nicht zugegriffen werden!", vm.param.msgHeader);
            }
        );
    };
    
    vm.verifyFlickrUser = function() {
        if (vm.param.site.flickrUserID.length === 0) {
            vm.param.site.isFlickrVerified = false;
            return;
        }
        var params = {
            method: 'flickr.people.getInfo',
            api_key: '',
            user_id: vm.param.site.flickrUserID,
            format: 'json',
            nojsoncallback: 1
        };
        ImageProvider.load( 'https://api.flickr.com/services/rest/', params ).then(
            function(data){
                console.log(data);
                vm.param.site.isFlickrVerified = (data.stat==='ok');
                if (vm.param.site.isFlickrVerified){
                    vm.param.site.flickrUserID = data.person.nsid;
                    toastr.success('Die Verbindung mit Benutzerkonto ' + data.person.username._content + ' wurde erfolgreich hergestellt.', vm.param.msgHeader);
                }
                else
                    toastr.error('Das Benutzerkonto '+vm.param.site.flickrUserID+' konnte nicht gefunden werden!', vm.param.msgHeader);
            },
            function(){
                vm.param.site.isDriveVerified = false;
                toastr.error('Auf das angegebene Benutzerkonto konnte nicht zugegriffen werden!', vm.param.msgHeader);
            }
        );

    };

    vm.testLoader = function(){
        $("#loader-wrapper").show(0).delay(3000).hide(0);
    };

};
