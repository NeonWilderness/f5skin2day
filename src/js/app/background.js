'use strict';

/**
 * Sets the appropriate background image based on the actual hour of the day and user defined image items/slots
 *
 */

function isSlotIdent(actual, stored){
    return (typeof stored === "undefined" ? false :
        actual.href===stored.href && actual.repeat===stored.repeat && actual.position===stored.position && actual.size===stored.size && actual.attachment===stored.attachment);
}

module.exports = {

    setImage: function(timeSlots){
        var getMinute = function(date){ return date.getHours()*60+date.getMinutes(); };
//----- return immediately if there are no user defined time slots/images
        if (timeSlots.length===0) return;
//----- get the current minute of the day
        var h = getMinute(new Date());
//----- check with each timeslot to find the appropriate entry
        $.each( timeSlots, function(){
            if (h>=getMinute(this.from) && h<=getMinute(this.to)){
                var $body = $('body');
//------------- do nothing if this background image has already been installed before with same params
                if (isSlotIdent(this, $body.data('timeSlot'))) return false;
//------------- once timeslot was found and needs to be installed, then preload/cache the image
                var self = this;
                $('<img/>').attr('src', self.href).load( function(){
//----------------- remove the temp img to prevent memory leaks
                    $(this).remove();
//----------------- now save and set the background-image with all params
                    $body.data('timeSlot', self)
                         .css({
                            'background-image': 'url("'+self.href+'")',
                            'background-repeat': self.repeat,
                            'background-position': self.position,
                            'background-attachment': self.attachment,
                            'background-size': self.size,
                            'height': '100%'
                    });
//----------------- and fade the preloading animation
                    $("#loader-wrapper").fadeOut("slow");
                });
//------------- then quit the each loop
                return false;
            }
        });
    }

};