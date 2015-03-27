module.exports = {

//- Extract breadcrumbs out of Twoday's modToolbarNavigationpath-macro
    getBreadcrumbs: function(){
        var breadcrumbs = $("#breadcrumbsMenu").find(":not(a[id])");
        return (breadcrumbs.length>0 ? breadcrumbs.wrap("<li></li>")[0].outerHTML : "");
    },

//- Get special menu items (imageMenu/aboMenu) and convert DIVs to LIs
    getSpecialMenu: function(menuID){
        return ($(menuID).html().replace(/div>/g, "li>"));
    },

//- Pimp server generated Twoday classes to enforce Foundation style
    pimpClasses: function(){
        $(".message .button").addClass("secondary tiny radius");
    },

//- Rotation13 method used to obfuscate email-address
    rot13: function(){
        return this.replace(/[a-zA-Z]/g, function(c){
            return String.fromCharCode((c <= "Z" ? 90 : 122) >= (c = c.charCodeAt(0) + 13) ? c : c - 26);
        });
    }

};