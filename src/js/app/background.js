require('jquery');
/**
 * Sets the appropriate background image based on the actual hour of the day and user defined image items/slots
 */
module.exports = {
    setImage: function(timeSlots){
//----- return immediately if there are no user defined time slots/images        
        if (timeSlots.length===0) return;
//----- get the current hour of the day        
        var h = new Date().getHours();
//----- check with each timeslot to find the appropriate entry
        $.each( timeSlots, function(){
            if (h>=this.from && h<this.to){
//------------- once timeslot was found, preload the image
                var self = this;
                $('<img/>').attr('src', self.href).load( function(){
//----------------- remove the temp img to prevent memory leaks
                    $(this).remove();
//----------------- now set the background-image with all params
                    $('body').css({
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