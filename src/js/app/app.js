'use strict';
require('jquery');

var angular = require('angular'),
    bodyclass = require('./bodyclass.js'),
    utils = require('./utils.js');

//--- Add additional body classes for individualized CSS rules
bodyclass();

//--- Pimp old Twoday classes, e.g. button in a .message
utils.pimpClasses();

//--- Set up the Angular app, Modernizr constant and run the FastClick js
angular
    .module('f5SkinApp', ['mm.foundation', 'toastr'])
    .config(function(toastrConfig){
        angular.extend(toastrConfig, {
            allowHtml: true,
            closeButton: true,
            progressBar: true,
            timeOut: 8000
        });
    })
    .constant('Modernizr', window.Modernizr)
    .run( function(){ window.FastClick.attach(document.body); });

//--- Require all services and controllers through their folder's index.js
require('./services');
require('./controllers');