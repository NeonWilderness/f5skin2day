'use strict';
var utils = require('../utils.js');

module.exports = function($rootScope){

    var vm = this;

    vm.param = $rootScope.param;
    vm.isCreateMode = vm.isEditMode = false;

    vm.getIcon = function(){
        var faIcon = $.trim(vm.param.topbar.addCustomMenu.icon.replace(/fa-margin/gi, ''));
        return (faIcon.length>0 ? 'fa '+faIcon : '');
    };

    vm.getEntryType = function(){
        var type = (typeof vm.entry === "undefined" ? false : vm.entry.link);
        return (type ? 'Linktext' : 'Überschrift');
    };

    vm.create = function(){
        vm.entry = { link: true, text: '', href: '' };
        vm.isCreateMode = true;
    };

    vm.edit = function(index){
        vm.entry = angular.copy(vm.param.topbar.addCustomMenu.items[index]);
        vm.index = index;
        vm.isEditMode = true;
    };

    vm.remove = function(index){
        vm.param.topbar.addCustomMenu.items.splice(index, 1);
    };

    vm.moveup = function(index){
        if (index>0) utils.swap(vm.param.topbar.addCustomMenu.items, index, index-1);
    };

    vm.movedown = function(index){
        if (index<vm.param.topbar.addCustomMenu.items.length-1) utils.swap(vm.param.topbar.addCustomMenu.items, index, index+1);
    };

    vm.save = function(){
        if (vm.isCreateMode)
            vm.param.topbar.addCustomMenu.items.push(vm.entry);
        else
            vm.param.topbar.addCustomMenu.items[vm.index] = vm.entry;
        vm.isEditMode = vm.isCreateMode = false;
    };

    vm.cancel = function(){
        vm.isCreateMode = vm.isEditMode = false;
    };

};