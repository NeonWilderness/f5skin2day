!function e(n,t,o){function r(a,s){if(!t[a]){if(!n[a]){var u="function"==typeof require&&require;if(!s&&u)return u(a,!0);if(i)return i(a,!0);var d=new Error("Cannot find module '"+a+"'");throw d.code="MODULE_NOT_FOUND",d}var f=t[a]={exports:{}};n[a][0].call(f.exports,function(e){var t=n[a][1][e];return r(t?t:e)},f,f.exports,e,n,t,o)}return t[a].exports}for(var i="function"==typeof require&&require,a=0;a<o.length;a++)r(o[a]);return r}({1:[function(e){(function(n){"undefined"!=typeof window?window.$:"undefined"!=typeof n?n.$:null;var t="undefined"!=typeof window?window.angular:"undefined"!=typeof n?n.angular:null,o=e("./background.js"),r=e("./bodyclass.js"),i=e("./utils.js");r(),i.pimpClasses();var a=t.module("f5SkinApp",["mm.foundation"]);a.controller("F5SkinController",["$scope",function(e){var n=JSON.parse($("#stdPreferences").text()||"{}"),t=JSON.parse($("#usrPreferences").text()||"{}");e.param=$.extend({},n,t,f5CoreInfo),o.setImage(e.param.timeSlots),0===e.param.topbar.menuItems.topics.text.length&&(e.param.topbar.menuItems.topics.text=e.param.siteAlias.toLowerCase()),e.param.topbar.menuItems.topics["class"]=$("#toolbarTopics").has(".dropdown")?"has-dropdown":"",e.param.topbar.menuItems.breadcrumbs.items=i.getBreadcrumbs(),e.param.topbar.menuItems.abo.items=i.getSpecialMenu("#aboMenu"),e.param.topbar.menuItems.images.items=i.getSpecialMenu("#imageMenu"),e.param.isLoggedIn=function(){return e.param.userName.length>0},e.param.isAdmin=function(){return e.param.isLoggedIn()&&"Administrator"===e.param.userRole()},e.param.isContributor=function(){return e.param.isLoggedIn()&&("Contributor"===e.param.userRole()||"Administrator"===e.param.userRole())},e.param.sendMail=function(){window.location.href=i.rot13(e.param.topbar.mailIcon.href)},e.msgClose=!1}])}).call(this,"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{"./background.js":2,"./bodyclass.js":3,"./utils.js":4}],2:[function(e,n){(function(e){"undefined"!=typeof window?window.$:"undefined"!=typeof e?e.$:null,n.exports={setImage:function(e){if(0!==e.length){var n=(new Date).getHours();$.each(e,function(){return n>=this.from&&n<this.to?($("body").css({"background-image":'url("'+this.href+'")',"background-repeat":this.repeat,"background-position":this.position,"background-attachment":this.attachment,"background-size":this.size,height:"100%"}),!1):void 0})}}}}).call(this,"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{}],3:[function(e,n){(function(e){"undefined"!=typeof window?window.$:"undefined"!=typeof e?e.$:null,n.exports=function(){var e="";if("/"===location.pathname)e="onHome";else{var n=location.pathname.replace(/\//g," ").trim().split(" ");switch(n[0]){case"topics":e="onTopic "+n[1].toLowerCase();break;case"stories":e="onStory "+n[1].toLowerCase()}}e.length>0&&$("body").addClass(e)}}).call(this,"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{}],4:[function(e,n){(function(e){"undefined"!=typeof window?window.$:"undefined"!=typeof e?e.$:null,n.exports={linksToObjects:function(e){var n=[];return $(e).each(function(){n.push({href:this.href,text:this.innerText})}),n},getBreadcrumbs:function(){return this.linksToObjects("#breadcrumbsMenu >a:not([id])")},getSpecialMenu:function(e){return this.linksToObjects(e+" a")},pimpClasses:function(){$(".message .button").addClass("secondary tiny radius")},rot13:function(e){return e.replace(/[a-zA-Z]/g,function(e){return String.fromCharCode(("Z">=e?90:122)>=(e=e.charCodeAt(0)+13)?e:e-26)})}}}).call(this,"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{}]},{},[1]);
//# sourceMappingURL=app.js.map