'use strict';
var lightness = require('lightness');

/**
 * Dynamically maintains and generates CSS style overwrites caused by changes in user preferences (e.g. icon color/hover)
 *
 */

var
    // holds all generated CSS-overwrite rules
    rules = {},
    // holds all field to CSS dependencies, i.e. a change in field xyz needs to generate 1-n CSS overwrites
    dependencies = {
        bodyBackground: {
            style: 'background',
            selector: [ 'body' ],
            derivative: []
        },
        bodyColor: {
            style: 'color',
            selector: [ 'body,p,h1,h2,h3,h4,h5,h6' ],
            derivative: []
        },
        menuBackgroundColor: {
            // CSS-styletag to be overwritten
            style: 'background',
            // CSS-selectors to be overwritten
            selector: [
                '.contain-to-grid,.top-bar,.top-bar.expanded .title-area,.top-bar-section ul li',
                '@media only screen and (min-width: 40.0625em){'+
                    '.top-bar,.top-bar.expanded,.top-bar-section li:not(.has-form) a:not(.button),'+
                    '.top-bar-section .dropdown li a,.top-bar-section .dropdown li:not(.has-form):not(.active) > a:not(.button),'+
                    '.top-bar-section .dropdown li label,.top-bar-section .has-form'
            ],
            // dependent derivatives, e.g. a change of menuColor causes a change in the menu divider color with a different lightness value
            derivative: [ 'menuBackgroundHover', 'menuDropdownLabel', 'dividerBorderRight', 'dividerBorderTop' ]
        },
        menuBackgroundHover: {
            style: 'background-color',
            selector: [
                '.top-bar-section ul li:hover:not(.has-form) > a',
                '@media only screen and (min-width: 40.0625em){.top-bar-section li:not(.has-form) a:not(.button):hover',
                '@media only screen and (min-width: 40.0625em){.top-bar-section .dropdown li:not(.has-form):not(.active):hover>a:not(.button)'
            ],
            lightness: -6,
            derivative: []
        },
        menuDropdownLabel: {
            style: 'color',
            selector: [ '.top-bar-section .dropdown label' ],
            lightness: +20,
            derivative: []
        },
        dividerBorderRight: {
            style: 'border-right-color',
            selector: [ '.top-bar-section > ul > .divider,.top-bar-section > ul > [role="separator"]' ],
            lightness: +10,
            derivative: []
        },
        dividerBorderTop: {
            style: 'border-top-color',
            selector: [ '.top-bar-section .divider,.top-bar-section [role="separator"]' ],
            lightness: -50,
            derivative: []
        },
        menuIconColor: {
            style: 'color',
            selector: [ '#f5Topbar i,.menuPreview i' ],
            derivative: []
        },
        loaderWrapper: {
            style: 'color',
            selector: [ '#loader-wrapper' ],
            derivative: []
        },
        loaderColor1: {
            style: 'border-top-color',
            selector: [ '#loader' ],
            derivative: []
        },
        loaderColor2: {
            style: 'border-top-color',
            selector: [ '#loader:before' ],
            derivative: []
        },
        loaderColor3: {
            style: 'border-top-color',
            selector: [ '#loader:after' ],
            derivative: []
        }
    };

module.exports = function($rootScope, toastr){

    return {

        // init on app start: generates the initial foundation CSS overwrites based on current user preferences
        initRulesFromPreferences: function(){
            var param = $rootScope.param, self = this;
            // Body
            self.resolveDependency('bodyBackground', param.site.body.background);
            self.resolveDependency('bodyColor', param.site.body.color);
            // Topbar
            self.resolveDependency('menuBackgroundColor', param.topbar.menuBackgroundColor);
            self.resolveDependency('menuIconColor', param.topbar.menuIconColor);
            // Loader animation
            self.resolveDependency('loaderWrapper', param.site.loader.wrapper);
            self.resolveDependency('loaderColor1', param.site.loader.color1);
            self.resolveDependency('loaderColor2', param.site.loader.color2);
            self.resolveDependency('loaderColor3', param.site.loader.color3);
            // Special Icons color/hover
            angular.forEach( param.topbar.specialIcons, function(icon){
                self.setRule('.menuspecial-'+icon.name+' i', self.formatRule('color', icon.color, true));
                self.setRule('li:hover .menuspecial-'+icon.name+' i', self.formatRule('color', icon.hover, true));
            });
            // push CSS to $rootscope
            self.pushCSS();
        },

        // processes dependencies object for desired field and generates all required CSS overwrite rules
        resolveDependency: function(fieldID, value){
            if (fieldID in dependencies){
                var self = this,
                    dependency = dependencies[fieldID];
                if ('lightness' in dependency) value = lightness(value, dependency.lightness);
                angular.forEach( dependency.selector, function (cssSelector){
                    self.setRule(cssSelector, self.formatRule(dependency.style, value)+
                        (cssSelector.charAt(0)==="@" ? '}' : ''));
                });
                angular.forEach( dependency.derivative, function(derivedFieldID) {
                    self.resolveDependency(derivedFieldID, value);
                });
            } else {
                toastr.error('Keine CSS-Anweisungen für ID: '+fieldID+' gefunden!', $rootScope.param.msgHeader);
            }
        },

        // formats one CSS rule
        formatRule: function(style, value, important){
            return style + ':' + value + (!important ? '' : '!important');
        },

        // saves/updates a CSS rule
        setRule: function(selector, rule){
            rules[selector] = rule;
            return this;
        },

        // resolves the dependencies for a desired field and pushes the resulting CSS string to the view
        pushDependency: function(fieldID, value){
            this.resolveDependency(fieldID, value);
            this.pushCSS();
        },

        // joins all CSS rules to one string and pushes this to the view (inline style tag "#f5UserStyles")
        pushCSS: function(){
            var css = '';
            angular.forEach(rules, function (rule, selector) { css += selector + '{' + rule + '} ' });
            console.log("pushCSS", css);
            $rootScope.userStyles = css;
        }

    }

};