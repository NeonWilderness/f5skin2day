/**
 * Browserify version of Google Analytics for Twoday (modern async version of the root.statsCounter skin)
 */
module.exports( function(uaKey){
    var ga = require("ga-browserify");
    var tracker = ga(uaKey);
    tracker._trackPageview();
});