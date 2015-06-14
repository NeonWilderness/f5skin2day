'use strict';
var utils = require('../utils.js');

module.exports = function($scope, $rootScope, UserStyles){

    var vm = this;

    vm.param = $rootScope.param;
    vm.isCreateMode = vm.isEditMode = false;

    vm.getMenuIcon = function(faIconname){
        return utils.getIcon(faIconname || '');
    };

    vm.getPreviewClass = function(){
        return (typeof vm.icon === 'undefined' ? '' : 'menuspecial-'+vm.icon.name);
    };

    vm.isKeyLocked = function(){
        return (typeof vm.icon === 'undefined' ? false : !vm.icon.user);
    };

    vm.isUrlLocked = function(){
        return (typeof vm.icon === 'undefined' ? false : vm.icon.name==='customize');
    };

    vm.changeColor = function(){
        UserStyles.setRule('.menuspecial-'+vm.icon.name+' i', UserStyles.formatRule('color', vm.icon.color, true)).pushCSS();
    };

    vm.changeHover = function(){
        UserStyles.setRule('li:hover .menuspecial-'+vm.icon.name+' i', UserStyles.formatRule('color', vm.icon.hover, true)).pushCSS();
    };

    vm.create = function(){
        vm.icon = {
            "name": "", "activate": true, "text": "", "icon": "fa-question", "divider": true,
            "title": "Neues Icon", "href": "", "color": vm.param.topbar.menuIconColor,
            "hover": "#fff", "user": true, "position": vm.param.topbar.specialIcons.length
        };
        vm.isCreateMode = true;
    };

    vm.edit = function(index){
        vm.icon = vm.param.topbar.specialIcons[index];
        vm.index = index;
        vm.isEditMode = true;
    };

    var renumberPositions = function(from){
        for (var i=Math.max(from,0), len=vm.param.topbar.specialIcons.length; i<len; ++i){
            vm.param.topbar.specialIcons[i].position = i;
        }
    };

    vm.remove = function(index){
        vm.param.topbar.specialIcons.splice(index, 1);
        renumberPositions(index);
    };

    vm.moveup = function(index){
        if (index>0){
            utils.swap(vm.param.topbar.specialIcons, index, index-1);
            renumberPositions(index-1);
        }
    };

    vm.movedown = function(index){
        if (index<vm.param.topbar.specialIcons.length-1){
            utils.swap(vm.param.topbar.specialIcons, index, index+1);
            renumberPositions(index);
        }
    };

    vm.save = function(){
        if (vm.isCreateMode)
            vm.param.topbar.specialIcons.push(vm.icon);
        else
            vm.param.topbar.specialIcons[vm.index] = vm.icon;
        vm.isEditMode = vm.isCreateMode = false;
    };

    vm.cancel = function(){
        vm.isCreateMode = vm.isEditMode = false;
    };

};