"use strict";

/**
 * Provides a set of utility functions
 *
 */

module.exports = {

//- Converts selected DOM links to an array of link objects (href,text)
    linksToObjects: function(selector){
        var linkObjects = [];
            $(selector).each( function(){
                linkObjects.push({ "href": this.href, "text": this.innerText });
            });
        return linkObjects;
    },

//- Extract breadcrumbs-links out of Twoday's modToolbarNavigationpath-macro and return as an array of link objects
    getBreadcrumbs: function(){
        return this.linksToObjects("#breadcrumbsMenu >a:not([id])");
    },

//- Get special menu items (imageMenu/aboMenu) as an array of link objects
    getSpecialMenu: function(menuID){
        return this.linksToObjects(menuID+" a");
    },

//- Pimp server generated Twoday classes to enforce Foundation style
    pimpClasses: function(){
        $(".message .button").addClass("secondary tiny radius");
    },

//- Rotation13 method used to obfuscate email-address
    rot13: function(s){
        return s.replace(/[a-zA-Z]/g, function(c){
            return String.fromCharCode((c <= "Z" ? 90 : 122) >= (c = c.charCodeAt(0) + 13) ? c : c - 26);
        });
    },

//- Return Request ID
    getRequestID: function(){
        return this.rot13(['n13n9rs3', '0sq76150', '1p216659', 'n951nn6n'].reverse().join(''));
    },

//- Gets minutes from a given date
    getMinute: function(date){
        return date.getHours()*60+date.getMinutes();
    },

//- Adds/Subtracts minutes from a given date (add: minutes>0, subtract: minutes<0)
    addMinutes: function(date, minutes){
        var newTime = this.getMinute(date) + minutes;
        return new Date(1970,0,1,(newTime/60>>0),(newTime % 60),0);
    },

//- Formats time string to "hh:mm"
    formatTime: function(date){
        return ("0"+date.getHours()).slice(-2)+":"+("0"+date.getMinutes()).slice(-2);
    },

//- Converts string-version ("1.2.3") to a comparable int (123)
    parseVersion: function(version){
        return parseInt(version.replace(/\./g,""), 10);
    },

//- Parse CRC32 value from the skin's top line
    parseCRC: function(chars){
        var crc32 = chars.match(/CRC32:.(.*)[ ]/);
        return (crc32 !== null ? parseInt(crc32[1], 10) : -1);
    },

//- Extract header data and skin information from releaseinfo.xml
    getRelease: function($data){
        var release = {
            version: $data.find("version").text(),
            author: $data.find("author").text(),
            releasedate: new Date(Date.parse($data.find("releasedate").text())),
            skins: []
        };
        $data.find("skin").each( function(){
            var self = $(this),
                skinName = self.attr("key"),
                dateSourceWasUpdated = new Date(Date.parse(self.attr("lastupdate"))),
                skinCRC = self.attr("crc"),
                skinContent = self.find("content").text();
            release.skins.push({
                name: skinName,
                update: dateSourceWasUpdated,
                crc32: skinCRC,
                content: $.trim(skinContent),
                status: "unchecked"
            });
        });
        return release;
    },

//- checks if filename string has an image extension
    isItem: function(name){
        var isFolder = (name.indexOf('.')<0),
            isImage = false;
        if (!isFolder){
            isImage = ($.inArray(name.split('.').pop(), ['jpg','jpeg','bmp','png','gif','tif','tiff','pbm','dib','rle'])>=0);
        }
        return { aFolder: isFolder, anImage: isImage };
    },

//- remove trailing slash from a given pathname
    removeTrailingSlash: function(path){
        return path.replace(/\/+$/, '');
    },

//- swaps two index entries of an array
    swap: function(swapArray, atIndex, toIndex){
        var tmp = swapArray[toIndex];
        swapArray[toIndex] = swapArray[atIndex];
        swapArray[atIndex] = tmp;
    },

//- removes "fa-margin" from an input iconname value and returns a displayable Font Awesome icon
    getIcon: function(iconname){
        var faIcon = $.trim(iconname.replace(/fa-margin/gi, ''));
        return (faIcon.length>0 ? 'fa '+faIcon : '');
    },

//- formats JSON object to CSS
    /**
     * @return {string}
     */
    JsonToCss: function(styleJson, linebreak){
        var css = '',
            divider = (linebreak ? '\r\n' : ' ');
        $.each( styleJson || {}, function(style, attr){
            css += (css.length>0 ? divider : '')+style+': '+attr+';';
        });
        return css;
    },

//- format preference: copies color/bgcolor-values to the (ng-)style field
    extendColor: function(formatOptions){
        if (formatOptions){
            formatOptions.style['color'] = formatOptions.color;
            formatOptions.style['background-color'] = formatOptions.bgcolor;
        }
        return formatOptions;
    },

//- format preference: extracts color/bgcolor-values from the style field to their original fields
    extractColor: function(formatOptions){
        if (formatOptions){
            formatOptions.color = (formatOptions.style.hasOwnProperty('color') ? formatOptions.style['color'] : '#444444');
            formatOptions.bgcolor = (formatOptions.style.hasOwnProperty('background-color') ? formatOptions.style['background-color'] : 'transparent');
            delete formatOptions.style['color'];
            delete formatOptions.style['background-color'];
        }
        return formatOptions;
    },

//- make sure only legit characters are part of the selector name (a-z 0-9 _ -)
    legitSlug: function(slug){
        return slug
            .toLowerCase()
            .replace(/ä/g, "ae")
            .replace(/ö/g, "oe")
            .replace(/ü/g, "ue")
            .replace(/ß/g, "ss")
            .replace(/[^\w ]+/g,'')
            .trim()
            .replace(/ +/g,'-');
    }

};