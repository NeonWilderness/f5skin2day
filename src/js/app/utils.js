var jq = require('angular').element;
module.exports = {
//- Extract breadcrumbs out of Twoday's modToolbarNavigationpath-macro
    getBreadCrumbs: function(navPath){
        return (jq(navPath).find(":not(a[id])").wrap("<li></li>")[0].outerHTML);
    },
//- Pimp server generated Twoday classes to enforce Foundation style
    pimpClasses: function(){
        jq('.message .button').addClass('secondary tiny radius');
    },
//- Rotation13 method to obfuscate email-address
    rot13: function(){
        return this.replace(/[a-zA-Z]/g, function(c){
            return String.fromCharCode((c <= "Z" ? 90 : 122) >= (c = c.charCodeAt(0) + 13) ? c : c - 26);
        });
    }
};