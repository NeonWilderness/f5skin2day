'use strict';
var utils = require('../utils.js');


module.exports = function($rootScope){

    var vm = this;

    vm.param = $rootScope.param;

    vm.getMenuIcon = function(item){
        return utils.getIcon(vm.param.topbar.menuItems[item].icon);
    }

};