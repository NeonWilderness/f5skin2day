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
//------------- once timeslot was found set the background-image with all params                
                $('body').css({
                    'background-image': 'url("'+this.href+'")',
                    'background-repeat': this.repeat,
                    'background-position': this.position,
                    'background-attachment': this.attachment,
                    'background-size': this.size,
                    'height': '100%'
                });
//------------- then quit the each loop
                return false;
            }
        });
    }
};