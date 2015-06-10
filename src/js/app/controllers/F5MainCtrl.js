'use strict';

var background = require('../background.js'),
    utils = require('../utils.js');

module.exports = function ($scope, $rootScope, Preferences, UpdateCheck, UserStyles, $window, $interval, $modal){
    
//- Define viewmodel as this
    var vm = this;

//- Get the consolidated preferences data (includes standard and user modified settings)
    vm.param = $rootScope.param = Preferences.get("consolidated");

//- Dynamically generate CSS form user preferences / overrides (e.g. icon colors)
    UserStyles.initRulesFromPreferences();
    vm.userStyles = $rootScope.userStyles;

//- Set background image based on time of the day and user defined image items/slots
    var UpdateBackgroundImage = function(){
        background.setImage(vm.param.timeSlots);
    };  UpdateBackgroundImage();

//- Install background image check routine to be called every 5 seconds
    var checkBackgroundTimer = $interval( UpdateBackgroundImage, 5000 );

//- Make sure interval timer will be removed once controller gets destroyed
    $scope.$on('$destroy', function(){
        $interval.cancel(checkBackgroundTimer);
    });

//- Set default value for topics.text if user has not provided one
    if (vm.param.topbar.menuItems.topics.text.length===0)
        vm.param.topbar.menuItems.topics.text = vm.param.siteAlias.toLowerCase();

//- Adjust topics.class if topiclist-macro has found/generated any story topics
    vm.param.topbar.menuItems.topics.drop = ($("#toolbarTopics").has(".dropdown"));

//- Extract breadcrumb/special menu links and put them into the scope
    vm.param.topbar.menuItems.breadcrumbs.items = utils.getBreadcrumbs();
    //console.dir(vm.param.topbar.menuItems.breadcrumbs.items);
    vm.param.topbar.menuItems.abo.items = utils.getSpecialMenu("#aboMenu");
    vm.param.topbar.menuItems.images.items = utils.getSpecialMenu("#imageMenu");

//- Add utility functions to be used in ng-functions (view)
    vm.param.isLoggedIn = function(){
        return (vm.param.userName.length>0);
    };
    vm.param.isAdmin = function(){
        return (vm.param.isLoggedIn() && vm.param.userRole()==="Administrator");
    };
    vm.param.isContributor = function(){
        return (vm.param.isLoggedIn() && (vm.param.userRole()==="Contributor" || vm.param.userRole()==="Administrator"));
    };
    vm.param.sendMail = function(){
        $window.location.href = utils.rot13(vm.param.topbar.mailIcon.href);
    };

//- When true (user clicked the close button), it triggers the fadeout of the response alert-box
    vm.msgClose = false;

    vm.customize = {

        hide: function(){ $('#f5container').fadeOut(400); },

        show: function(){ $('#f5container').fadeIn(400); },

        loadSpectrum: function(){
        },

        open: function(){
            var self = this;
            self.hide();
            Modernizr.load(
                {
                    test: (typeof $.fn.spectrum === "undefined"),
                    yep: [
                        'https://cdnjs.cloudflare.com/ajax/libs/spectrum/1.7.0/spectrum.min.css',
                        'https://cdnjs.cloudflare.com/ajax/libs/spectrum/1.7.0/spectrum.min.js'
                    ],
                    complete: function(){

                        var localization = $.spectrum.localization["de"] = {
                            cancelText: "Abbrechen",
                            chooseText: "Wählen",
                            clearText: "Farbauswahl zurücksetzen",
                            noColorSelectedText: "Keine Farbe ausgewählt",
                            togglePaletteMoreText: "Mehr",
                            togglePaletteLessText: "Weniger"
                        }, spectrumDefaults = {
                            allowEmpty: true,
                            clickoutFiresChange: false,
                            localStorageKey: "f5spectrum",
                            preferredFormat: "hex",
                            showAlpha: true,
                            showInitial: true,
                            showInput: true
                        };

                        $.extend($.fn.spectrum.defaults, spectrumDefaults, localization);

                        var copyOfParam = $.extend(true, {}, vm.param);

                        var modalCustomize = $modal.open({
                            templateUrl: "customizeBlogHtml", // in Site-ngTemplates.jade
                            controller:  "CustomizeCtrl as customize",
                            resolve: {},
                            backdrop: "static",
                            keyboard: false,
                            windowClass: "xlarge"
                        });

                        modalCustomize.result.then(
                            function(){ // User confirmed change
                                if (!angular.equals(copyOfParam, vm.param)) Preferences.save(vm.param);
                                self.show();
                            },
                            function(){ // User cancelled change
                                if (!angular.equals(copyOfParam, vm.param)) vm.param = copyOfParam;
                                self.show();
                            }
                        );
                    }
                }
            );
        }
    };

//- Check for available updates if user is admin and check frequency is not "never"
    if (vm.param.isAdmin() && vm.param.update.gap>0){
        UpdateCheck.onLoad(vm.param);
    }
};