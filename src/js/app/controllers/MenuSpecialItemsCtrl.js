'use strict';
var utils = require('../utils.js');

module.exports = function($rootScope){

    var vm = this;

    vm.param = $rootScope.param;
    vm.isCreateMode = vm.isEditMode = false;
    vm.sortedIcons = [];

    vm.sortIcons = function(){
        $.each(vm.param.topbar.specialIcons, function(key, icon){
            var data = angular.copy(icon);
            if (key==='mail') data.href = utils.rot13(icon.href).replace('mailto:','')
            vm.sortedIcons.push( $.extend( {}, {key: key}, data) );
        });
        vm.sortedIcons.sort( function(a,b){ return a.position - b.position; } );
    };
    vm.sortIcons();

    vm.syncIcons = function(){
        var iconSet = {}, key, data;
        $.each(vm.sortIcons, function(index, icon){
            data = angular.copy(icon);
            data.position = index;
            key = data.key;
            delete data.key;
            iconSet[key] = data;
        });
        vm.param.topbar.specialIcons = iconSet;
    };

    vm.getMenuIcon = function(iconname){
        return utils.getIcon(iconname || '');
    };

    vm.getEmail = function(){
        return utils.rot13(vm.param.topbar.specialIcons.mail.href).replace('mailto:','');
    };

    vm.getPreviewClass = function(){
        return (typeof vm.icon === "undefined" ? "" : vm.icon.key + "Preview");
    };

    vm.isKeyLocked = function(){
        return (typeof vm.icon === "undefined" ? false : !vm.icon.delete);
    };

    vm.isUrlLocked = function(){
        return (typeof vm.icon === "undefined" ? false : vm.icon.key==="customize");
    };

    vm.create = function(){
        vm.icon = {
            "key": "",
            "activate": true, "text": "", "icon": "fa-question", "divider": true,
            "title": "Neues Icon", "href": "", "color": vm.param.topbar.menuIconColor,
            "hover": "#fff", "delete": true, "position": vm.sortIcons.length
        };
        vm.isCreateMode = true;
    };

    vm.edit = function(index){
        vm.icon = angular.copy(vm.sortedIcons[index]);
        vm.index = index;
        vm.isEditMode = true;
    };

    vm.remove = function(index){
        vm.sortedIcons.splice(index, 1);
        vm.syncIcons();
    };

    vm.moveup = function(index){
        if (index>0){
            utils.swap(vm.sortedIcons, index, index-1);
            vm.syncIcons();

        }
    };

    vm.movedown = function(index){
        if (index<vm.param.topbar.addCustomMenu.items.length-1){
            utils.swap(vm.sortedIcons, index, index+1);
            vm.syncIcons();
        }
    };

    vm.save = function(){
        if (vm.isCreateMode)
            vm.sortedIcons.push(vm.icon);
        else
            vm.sortedIcons[vm.index] = vm.icon;
        vm.syncIcons();
        vm.isEditMode = vm.isCreateMode = false;
    };

    vm.cancel = function(){
        if (vm.isCreateMode) delete(vm.icon);
        vm.isCreateMode = vm.isEditMode = false;
    };

};