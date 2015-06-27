'use strict';
var utils = require('../utils.js');

module.exports = function($scope, $rootScope, toastr){

    var vm = this;

    vm.param = $rootScope.param;
    vm.formats = angular.copy(vm.param.format);

    vm.resetMode = function(){
        vm.isEditMode = vm.isCreateMode = false;
    };  vm.resetMode();

    vm.isKeyLocked = function(){
        return (typeof vm.item === 'undefined' ? false : !vm.item.user);
    };

    vm.proposeName = function(){
        vm.itemname = utils.legitSlug(vm.item.selector);
    };

    vm.changeColor = function(name){
        var formatOptions, id, linebreak, ngModelCtrl;

        if (!name){
            formatOptions = vm.item; id = 'Item'; linebreak = false;
        } else {
            formatOptions = vm.param.format[name]; id = name; linebreak = true;
        }

        formatOptions = utils.extendColor(formatOptions);
        ngModelCtrl = $('#css-'+id).controller('ngModel');
        ngModelCtrl.$setViewValue(utils.JsonToCss(formatOptions.style, linebreak));
        ngModelCtrl.$render();
    };

    vm.applyColors = function(){
        console.log('called');
        if (vm.item){
            console.log('changed');
            if (vm.item.style.hasOwnProperty('color')) vm.item.color = vm.item.style['color'];
            if (vm.item.style.hasOwnProperty('background-color')) vm.item.bgcolor = vm.item.style['background-color'];
        }
    };

    vm.create = function(){
        vm.item = utils.extendColor({
            selector: "", text: "", user: true, color: "#444444", bgcolor: "transparent", style: {}
        });
        vm.itemname = "";
        vm.isCreateMode = true;
    };

    vm.edit = function(name){
        vm.item = angular.copy(vm.param.format[name]);
        vm.itemname = vm.itemname_before = name;
        vm.isEditMode = true;
    };

    vm.remove = function(name){
        delete vm.param.format[name];
    };

    function doesNameExist(newName){
        var doesExist = (newName in vm.param.format);
        if (doesExist) toastr.error('Der eingegebene Name existiert bereits. Bitte verwenden Sie eine eindeutige Kennung.', vm.param.msgHeader);
        return doesExist;
    }

    vm.save = function(){
        if (vm.isCreateMode){ // Create Mode
            if (doesNameExist(vm.itemname)) return;
        } else { // Edit Mode
            if (vm.itemname!==vm.itemname_before){ // Name was changed during edit
                if (doesNameExist(vm.itemname)) return;
                delete vm.param.format[vm.itemname_before];
            }
        }
        vm.param.format[vm.itemname] = vm.item;
        vm.resetMode();
    };

    vm.cancel = function(){
        if (vm.item) delete vm.item;
        vm.resetMode();
    };

};