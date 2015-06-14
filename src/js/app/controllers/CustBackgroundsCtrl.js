'use strict';

var background = require('../background.js'),
    utils = require('../utils.js');

module.exports = function($rootScope, ImageProvider, $window, toastr){
    
    var vm = this;
    
    vm.param = $rootScope.param;

    vm.positions = [
        "left top", "left center", "left bottom",
        "right top", "right center", "right bottom",
        "center top", "center center", "center bottom"
    ];

    vm.repeats = [ "repeat", "repeat-x", "repeat-y", "no-repeat" ];

    vm.sizes = [ "auto", "cover", "contain" ];

    vm.attachments = [ "fixed", "local", "scroll" ];

    vm.isEditMode = vm.isCreateMode = vm.isQueryImage = false;

    vm.slotCheck = function(){
        var slots=vm.param.timeSlots, slotEnd=-1, status=(slots.length>0 ? "" : "Keine Hintergrund-Zeitfenster vorhanden!");
        $.each( vm.param.timeSlots, function(){
            //console.log("from: "+utils.getMinute(this.from)+" slotEnd: "+slotEnd+" ("+(slotEnd+1)+")");
            if (utils.getMinute(this.from)!==slotEnd+1){
                status = (slotEnd<0
                       ? "Die Zeitangabe beginnt nicht bei 00:00 Uhr!"
                       : "Es besteht eine Zeitlücke bei "+utils.formatTime(this.from)+" Uhr!");
                return false;
            } else slotEnd = utils.getMinute(this.to);
        });
        if (status.length===0 && slotEnd!==23*60+59) status = "Die Zeitangabe endet nicht bei 23:59 Uhr!";
        vm.slotStatusOK = (status.length===0);
        vm.slotStatus = (vm.slotStatusOK ? "Alle Hintergrund-Zeitfenster vollständig definiert." : status);
    };

    vm.edit = function(index){
        vm.slot = angular.copy(vm.param.timeSlots[index]);
        vm.index = index;
        vm.isEditMode = true;
    };

    vm.cancel = function(){
        if (vm.isCreateMode) delete vm.slot;
        vm.isEditMode = vm.isCreateMode = false;
    };

    vm.save = function(){
        if (vm.isCreateMode) vm.insert(); else vm.update();
        background.setImage(vm.param.timeSlots);
        vm.slotCheck();
        vm.isEditMode = vm.isCreateMode = false;
    };

    vm.sort = function(){
        vm.param.timeSlots.sort( function(a,b){ return utils.getMinute(a.from) - utils.getMinute(b.from); });
    };

    vm.findFirst = function(cbSelectCondition){
        var slots = vm.param.timeSlots, selectedIndex = -1;
        $.each( slots, function(index, slot){
            if (cbSelectCondition(slot)){
                selectedIndex = index;
                return false;
            }
        });
        return selectedIndex;
    };

    vm.insert = function(){
//----- Get the currently defined timeslots
        var slots = vm.param.timeSlots, slot, sIdx = 0, clone = null;
//----- Delete all old slots that are encompassed/embedded by the new slot
        while (sIdx<slots.length){
            slot = slots[sIdx];
            if (slot.from>=vm.slot.from && slot.to<=vm.slot.to)
                vm.remove(sIdx, "nocheck");
            else
                sIdx++;
        }
//----- Find the first slot where new-fromTime is included
        sIdx = vm.findFirst(function(thisSlot){ return (vm.slot.from<thisSlot.to); });
        if (sIdx>=0){
            if (vm.slot.from>slots[sIdx].from && vm.slot.to<slots[sIdx].to){
                clone = angular.copy(slots[sIdx]);
                clone.from = utils.addMinutes(vm.slot.to, +1);
                slots[sIdx].to = utils.addMinutes(vm.slot.from, -1);
            } else if (vm.slot.from<=slots[sIdx].from && vm.slot.to<slots[sIdx].to){
                slots[sIdx].from = utils.addMinutes(vm.slot.to, +1);
            } else if (vm.slot.to>=slots[sIdx].to){
                slots[sIdx].to = utils.addMinutes(vm.slot.from, -1);
                if (slots.length>sIdx+1) slots[sIdx+1].from = utils.addMinutes(vm.slot.to, +1);
            }
        }
//----- Push the new slot to the array
        slots.push(vm.slot);
//----- Push the clone slot to the array if there is one
        if (clone!==null) slots.push(clone);
//----- and re-sort
        vm.sort();
    };

    vm.update = function(){
        vm.param.timeSlots[vm.index] = vm.slot;
        vm.sort();
    };

    vm.remove = function(index, nocheck){
//----- Get the currently defined timeslots
        var slots = vm.param.timeSlots;
//----- If index to delete is not the first, then consolidate times with preceeding timeslot
        if (index>0) slots[index-1].to = slots[index].to;
//----- If index is the first and there is a succeeding timeslot, consolidate with succeeding timeslot
        else if (slots.length>1) slots[1].from = slots[0].from;
//----- anyway delete this index now
        slots.splice(index, 1);
//----- and re-check the slots status unless internal call from insert function
        if (nocheck || '' !== 'nocheck') vm.slotCheck();
    };

    vm.create = function(){
        vm.slot = {
              "from": new Date(1970,0,1,0,0,0), "to": new Date(1970,0,1,23,59,0),
              "repeat": "no-repeat", "position": "center top", "size": "cover",
              "attachment": "fixed", "href": vm.param.site.imgFolder };
        vm.isCreateMode = true;
    };

    vm.usePosition = function(index){
        vm.slot.position = vm.positions[index];
    };

    vm.useRepeat = function(index){
        vm.slot.repeat = vm.repeats[index];
    };

    vm.useSize = function(index){
        vm.slot.size = vm.sizes[index];
    };

    vm.useAttachment = function(index){
        vm.slot.attachment = vm.attachments[index];
    };

    vm.navImagePool = {
        providers: [
            {
                name: 'Unsplash',
                url: function(){ return vm.param.update.releaseUrl+'unsplash.json'; },
                load: function(data){ return data || []; },
                getFormatInfo: function(target, srcRatio){
                    var w, h;
                    switch (target){
                        case 'gallery': w=240; h=160; break;
                        case 'fullscreen': w=$window.screen.width; h=$window.screen.height; break;
                        case 'background': w=1920; h=Math.round(1920/srcRatio); break;
                    }
                    return { image: 'img_url', suffix: '?fm=jpg&q=75&w='+w+'&h='+h+'&fit=crop' };
                }
            },
            {
                name: 'Picjumbo',
                url: function(){ return vm.param.update.releaseUrl+'picjumbo.json'; },
                load: function(data){ return data || []; },
                getFormatInfo: function(target, srcRatio){
                    return { image: 'img_url', suffix: '' };
                }
            },
            {
                name: 'GoogleDrive',
                domain: 'https://googledrive.com',
                load: function(data){
                    var items = [], href, item, objectIs, self=this,
                        folderImgUrl = vm.param.update.releaseUrl+'folder.jpg';
                    $(data).find(".folder-cell>a").each( function(){
                        href = $(this).attr("href"); // suppress domain insertion
                        item = decodeURI(href).split('/').pop();
                        objectIs = utils.isItem(item);
                        if (!objectIs.aFolder && !objectIs.anImage) return true;
                        if (objectIs.aFolder) item = item  || 'zurück';
                        items.push({
                            'isImage': objectIs.anImage,
                            'href': href,
                            'fname': item,
                            'img_url': (objectIs.aFolder ? folderImgUrl : self.domain+href)
                        });
                    });
                    return items;
                },
                url: function() {
                    var gd = utils.removeTrailingSlash(vm.param.site.imgFolder);
                    if (gd.length===0){
                        toastr.warning('Bitte geben Sie zuerst Ihr GoogleDrive-Bildverzeichnis im Tab "Grunddaten" ein!', vm.param.msgHeader);
                        return '';
                    }
                    if (gd.indexOf('drive.google.com')>=0){
                        gd = vm.param.site.imgFolder = 'https://googledrive.com/host/' + gd.split('/').pop();
                    } else if (gd.indexOf('googledrive.com/host')<0){
                        toastr.error('Das angegebene Bildverzeichnis ist keine gültige GoogleDrive-URL!', vm.param.msgHeader);
                        return '';
                    }
                    return gd;
                },
                getFormatInfo: function(target, srcRatio){
                    return { image: 'img_url', suffix: '' };
                }
            },
            {
                name: 'Flickr',
                load: function(data){
                    var items = [];
                    angular.forEach( data.query.results.photo, function(item){
                        items.push({
                            'isImage': (item.media==='photo'),
                            'img_url': item.url_o,
                            'fname': item.title,
                            'img_sml': item.url_s,
                            'ratio': (parseInt(item.width_o, 10) / parseInt(item.height_o, 10))
                        });
                    });
                    return items;
                },
                url: function() {
                    if (vm.param.site.flickrUserID.length===0){
                        toastr.warning('Bitte geben Sie zuerst Ihr Flickr-Benutzer-ID im Tab "Grunddaten" ein!', vm.param.msgHeader);
                        return '';
                    }
                    if (!vm.param.site.isFlickrVerified){
                        toastr.warning('Die eingegebene Benutzer-ID muss vorher noch überprüft werden (Tab "Grunddaten")!', vm.param.msgHeader);
                        return '';
                    }
                    var yql = 'https://query.yahooapis.com/v1/public/yql?q=#q',
                        qry = encodeURIComponent(
                            'SELECT * FROM flickr.people.publicphotos(0) WHERE api_key="#k" AND user_id="#u" AND extras="media,o_dims,url_o,url_s"'
                            .replace('#k', utils.getRequestID())
                            .replace('#u', vm.param.site.flickrUserID));
                    return yql.replace('#q', qry)+'&env=store://datatables.org/alltableswithkeys&format=json&callback=';
                },
                getFormatInfo: function(target, srcRatio){
                    var field;
                    switch (target){
                        case 'gallery': field = 'img_sml'; break;
                        default: field = 'img_url'; break;
                    }
                    return { image: field, suffix: '' };
                }
            }

        ],
        provider: {},
        images: [],
        page: -1,
        lastPage: 0,
        pageSize: 24,
        pageImages: [],
        isLoadingImages: false,
        subFolder: '',
        isFirstPage: function(){ return (this.page===0); },
        isLastPage: function(){ return (this.page===this.lastPage); },
        useProvider: function(index){
            this.provider = this.providers[index];
            this.subFolder = '';
            this.loadImages('');
        },
        nextPage: function(){ ++this.page; this.showImages(); },
        prevPage: function(){ --this.page; this.showImages(); },
        toFirstPage: function(){ this.page=0; this.showImages(); },
        toLastPage: function(){ this.page=this.lastPage; this.showImages(); },
        selectFolder: function(index){
            var i = this.page*this.pageSize+index;
            this.subFolder = (this.provider.domain+utils.removeTrailingSlash(this.images[i].href))
                .replace(this.provider.url(), '');
            this.loadImages(this.subFolder);
        },
        viewImage: function(index){
            var i = this.page*this.pageSize,
                j = Math.min(i+this.pageSize, this.images.length),
                fmt = this.provider.getFormatInfo('fullscreen'),
                swipeImages = [];
            while (i<j){
                swipeImages.push({ href: this.images[i][fmt.image]+fmt.suffix });
                ++i;
            }
            $.swipebox( swipeImages, {useSVG: false, initialIndexOnArray: index} );
        },
        selectImage: function(index){
            var i = this.page*this.pageSize+index,
                ratio = (typeof this.images[i].ratio !== 'undefined' ? this.images[i].ratio : 1.5),
                fmt = this.provider.getFormatInfo('background', ratio);
            vm.slot.href = this.images[i][fmt.image]+fmt.suffix;
            vm.isQueryImage = false;
        },
        showImages: function(){
            var i = this.page*this.pageSize,
                j = Math.min(i+this.pageSize, this.images.length),
                item, isImage, fName, bgUrl,
                fmt = this.provider.getFormatInfo('gallery');
            this.pageImages.length = 0;
            while (i<j){
                item = this.images[i];
                isImage = (item.hasOwnProperty('isImage') ? item.isImage : true);
                fName = (item.hasOwnProperty('fname') ? item.fname : '');
                bgUrl = 'url("'+item[fmt.image]+fmt.suffix+'")';
                this.pageImages.push({
                    isImage: isImage,
                    fName: fName,
                    style: {'background-image': bgUrl}
                });
                ++i;
            }
        },
        loadImages: function(subFolder){
            var self = this;
            self.images.length = 0;
            self.isLoadingImages = true;
            self.pageImages.length = 0;
            self.page = 0;
            var url = self.provider.url();
            if (url.length===0) return;
            ImageProvider.load( url+subFolder ).then(
                function(data){
                    console.log(data);
                    self.images = self.provider.load(data);
                    self.lastPage = (self.images.length===0 ? 0 : Math.floor((self.images.length-1)/self.pageSize));
                    self.showImages();
                    self.isLoadingImages = false;
                },
                function(data, status){
                    toastr.error("Fehler beim Lesen der Bilddaten von "+self.provider.name+", Status: "+status, vm.param.msgHeader);
                    self.lastPage = 0;
                    self.isLoadingImages = false;
                }
            );
        }
    };

    vm.queryImage = function(){
        vm.isQueryImage = true;
        if (vm.navImagePool.page<0) vm.navImagePool.useProvider(0);
    };

    vm.slotCheck();

};