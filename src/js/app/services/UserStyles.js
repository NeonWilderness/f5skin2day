'use strict';

/**
 * Dynamically maintains and generates CSS style overwrites caused by changes in user preferences (e.g. icon color/hover)
 *
 */

var rules = {},
    dependencies = {
        menuBackgroundColor: [
            { selector: '.contain-to-grid,.top-bar,.title-area', style: 'background' }
        ],
        menuIconColor: [
            { selector: '#f5Topbar i,.menuPreview i', style: 'color' }
        ],
        loaderWrapper: [
            { selector: '#loader-wrapper', style: 'color' }
        ],
        loaderColor1: [
            { selector: '#loader', style: 'border-top-color' }
        ],
        loaderColor2: [
            { selector: '#loader:before', style: 'border-top-color' }
        ],
        loaderColor3: [
            { selector: '#loader:after', style: 'border-top-color' }
        ]
    };

module.exports = function($rootScope){

    return {

        initRulesFromPreferences: function(){
            var param = $rootScope.param;
            // Topbar
            this.resolveDependency('menuBackgroundColor', param.topbar.menuBackgroundColor);
            this.resolveDependency('menuIconColor', param.topbar.menuIconColor);
            // Loader animation
            this.resolveDependency('loaderWrapper', param.site.loader.wrapper);
            this.resolveDependency('loaderColor1', param.site.loader.color1);
            this.resolveDependency('loaderColor2', param.site.loader.color2);
            this.resolveDependency('loaderColor3', param.site.loader.color3);
            // push CSS to $rootscope
            this.pushCSS();
        },

        resolveDependency: function(fieldID, value){
            if (fieldID in dependencies){
                var self = this;
                angular.forEach(dependencies[fieldID], function (dependency){
                    self.setRule(dependency.selector, self.formatRule(dependency.style, value));
                });
            } else {
                toastr.error('Keine CSS-Anweisungen für ID: '+fieldID+' gefunden!', vm.param.msgHeader);
            }
        },

        formatRule: function(style, value){
            return style + ':' + value;
        },

        setRule: function(selector, rule){
            rules[selector] = rule;
        },

        pushDependency: function(fieldID, value){
            this.resolveDependency(fieldID, value);
            this.pushCSS();
        },

        pushCSS: function(){
            var css = '';
            angular.forEach(rules, function (rule, selector) { css += selector + '{' + rule + '} ' });
            $rootScope.userStyles = css;
        }

    }

};