'use strict';
require('jquery');
var utils = require('../utils.js');

module.exports = function($scope, Preferences, ImageProvider, $window, toastr){

    $scope.input = Preferences.get("consolidated");

    $scope.positions = [
        "left top", "left center", "left bottom",
        "right top", "right center", "right bottom",
        "center top", "center center", "center bottom"
    ];

    $scope.repeats = [ "repeat", "repeat-x", "repeat-y", "no-repeat" ];

    $scope.sizes = [ "auto", "cover", "contain" ];

    $scope.attachments = [ "fixed", "local", "scroll" ];

    $scope.isEditMode = $scope.isCreateMode = $scope.isQueryImage = false;

    $scope.slotCheck = function(){
        var slots=$scope.input.timeSlots, slotEnd=-1, status=(slots.length>0 ? "" : "Keine Hintergrund-Zeitfenster vorhanden!");
        $.each( $scope.input.timeSlots, function(){
            //console.log("from: "+utils.getMinute(this.from)+" slotEnd: "+slotEnd+" ("+(slotEnd+1)+")");
            if (utils.getMinute(this.from)!==slotEnd+1){
                status = (slotEnd<0
                       ? "Die Zeitangabe beginnt nicht bei 00:00 Uhr!"
                       : "Es besteht eine Zeitlücke bei "+utils.formatTime(this.from)+" Uhr!");
                return false;
            } else slotEnd = utils.getMinute(this.to);
        });
        if (status.length===0 && slotEnd!==23*60+59) status = "Die Zeitangabe endet nicht bei 23:59 Uhr!";
        $scope.slotStatusOK = (status.length===0);
        $scope.slotStatus = ($scope.slotStatusOK ? "Alle Hintergrund-Zeitfenster vollständig definiert." : status);
    };

    $scope.edit = function(index){
        $scope.slot = angular.copy($scope.input.timeSlots[index]);
        $scope.index = index;
        $scope.isEditMode = true;
    };

    $scope.cancel = function(){
        if ($scope.isCreateMode) delete $scope.slot;
        $scope.isEditMode = $scope.isCreateMode = false;
    };

    $scope.save = function(){
        if ($scope.isCreateMode) $scope.insert(); else $scope.update();
        $scope.slotCheck();
        $scope.isEditMode = $scope.isCreateMode = false;
    };

    $scope.sort = function(){
        $scope.input.timeSlots.sort( function(a,b){ return utils.getMinute(a.from) - utils.getMinute(b.from); });
    };

    $scope.findFirst = function(cbSelectCondition){
        var slots = $scope.input.timeSlots, selectedIndex = -1;
        $.each( slots, function(index, slot){
            if (cbSelectCondition(slot)){
                selectedIndex = index;
                return false;
            }
        });
        return selectedIndex;
    };

    $scope.insert = function(){
//----- Get the currently defined timeslots
        var slots = $scope.input.timeSlots, slot, sIdx = 0, clone = null;
//----- Delete all old slots that are encompassed/embedded by the new slot
        while (sIdx<slots.length){
            slot = slots[sIdx];
            if (slot.from>=$scope.slot.from && slot.to<=$scope.slot.to)
                $scope.remove(sIdx, false);
            else
                sIdx++;
        }
//----- Find the first slot where new-fromTime is included
        sIdx = $scope.findFirst(function(thisSlot){ return ($scope.slot.from<thisSlot.to); });
        if (sIdx>=0){
            if ($scope.slot.from>slots[sIdx].from && $scope.slot.to<slots[sIdx].to){
                clone = angular.copy(slots[sIdx]);
                clone.from = utils.addMinutes($scope.slot.to, +1);
                slots[sIdx].to = utils.addMinutes($scope.slot.from, -1);
            } else if ($scope.slot.from<=slots[sIdx].from && $scope.slot.to<slots[sIdx].to){
                slots[sIdx].from = utils.addMinutes($scope.slot.to, +1);
            } else if ($scope.slot.to>=slots[sIdx].to){
                slots[sIdx].to = utils.addMinutes($scope.slot.from, -1);
                if (slots.length>sIdx+1) slots[sIdx+1].from = utils.addMinutes($scope.slot.to, +1);
            }
        }
//----- Push the new slot to the array
        slots.push($scope.slot);
//----- Push the clone slot to the array if there is one
        if (clone!==null) slots.push(clone);
//----- and re-sort
        $scope.sort();
    };

    $scope.update = function(){
        $scope.input.timeSlots[$scope.index] = $scope.slot;
        $scope.sort();
    };

    $scope.remove = function(index, nocheck){
//----- Get the currently defined timeslots
        var slots = $scope.input.timeSlots;
//----- If index to delete is not the first, then consolidate times with preceeding timeslot
        if (index>0) slots[index-1].to = slots[index].to;
//----- If index is the first and there is a succeeding timeslot, consolidate with succeeding timeslot
        else if (slots.length>1) slots[1].from = slots[0].from;
//----- anyway delete this index now
        slots.splice(index, 1);
//----- and re-check the slots status unless internal call from insert function
        if (nocheck || true) $scope.slotCheck();
    };

    $scope.create = function(){
        $scope.slot = {
              "from": new Date(1970,0,1,0,0,0), "to": new Date(1970,0,1,23,59,0),
              "repeat": "no-repeat", "position": "center top", "size": "cover",
              "attachment": "fixed", "href": $scope.input.site.imgFolder };
        $scope.isCreateMode = true;
    };

    $scope.usePosition = function(index){
        $scope.slot.position = $scope.positions[index];
    };

    $scope.useRepeat = function(index){
        $scope.slot.repeat = $scope.repeats[index];
    };

    $scope.useSize = function(index){
        $scope.slot.size = $scope.sizes[index];
    };

    $scope.useAttachment = function(index){
        $scope.slot.attachment = $scope.attachments[index];
    };

    $scope.navImagePool = {
        providers: [
            {
                name: 'Unsplash',
                file: 'unsplash.json',
                append: function(target, srcRatio){
                    var w, h;
                    switch (target){
                        case 'gallery': w=300; h=200; break;
                        case 'fullscreen': w=$window.screen.width; h=$window.screen.height; break;
                        case 'background': w=1920; h=Math.round(1920/srcRatio); break;
                    }
                    return '?fm=jpg&q=75&w='+w+'&h='+h+'&fit=crop';
                }
            },
            {
                name: "Picjumbo",
                file: 'picjumbo.json',
                append: function(target, srcRatio){
                    return '';
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
        isFirstPage: function(){ return this.page === 0; },
        isLastPage: function(){ return this.page === this.lastPage; },
        useProvider: function(index){ this.provider = this.providers[index]; this.loadImages(); },
        nextPage: function(){ ++this.page; this.showImages(); },
        prevPage: function(){ --this.page; this.showImages(); },
        toFirstPage: function(){ this.page=0; this.showImages(); },
        toLastPage: function(){ this.page=this.lastPage; this.showImages(); },
        viewImage: function(index){
            var i = this.page*this.pageSize,
                j = Math.min(i+this.pageSize, this.images.length),
                swipeImages = [];
            while (i<j){
                swipeImages.push({ href: this.images[i]['img_url']+this.provider.append('fullscreen') });
                ++i;
            }
            $.swipebox( swipeImages, {useSVG: false, initialIndexOnArray: index} );
        },
        selectImage: function(index){
            var i = this.page*this.pageSize+index,
                ratio = (typeof this.images[i].ratio !== 'undefined' ? this.images[i].ratio : 1.5);
            $scope.slot.href = this.images[i]['img_url']+this.provider.append('background', ratio);
            $scope.isQueryImage = false;
        },
        showImages: function(){
            var i = this.page*this.pageSize,
                j = Math.min(i+this.pageSize, this.images.length);
            this.pageImages.length = 0;
            while (i<j){
                this.pageImages.push({
                    'background-image': 'url('+this.images[i]['img_url']+this.provider.append('gallery')+')'
                });
                ++i;
            }
        },
        loadImages: function(){
            var self = this;
            self.isLoadingImages = true;
            self.images.length = 0;
            self.pageImages.length = 0;
            self.page = 0;
            ImageProvider.load($scope.input.update.releaseUrl+self.provider.file).then(
                function(data){
                    self.images = data || [];
                    self.lastPage = (self.images.length===0 ? 0 : Math.floor((self.images.length-1)/self.pageSize));
                    self.showImages();
                    self.isLoadingImages = false;
                },
                function(data, status){
                    toastr.error("Fehler beim Lesen der Bilddaten von "+self.provider+", Status: "+status, $scope.input.msgHeader);
                    self.lastPage = 0;
                    self.isLoadingImages = false;
                }
            );
        }
    };

    $scope.queryImage = function(){
        $scope.isQueryImage = true;
        if ($scope.navImagePool.page<0) $scope.navImagePool.useProvider(0);
    };

    $scope.slotCheck();

};