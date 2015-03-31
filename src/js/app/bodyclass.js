require('jquery');
/**
 * Adds additional classes to the BODY element
 * onHome ~ if the homepage is displayed
 * onTopic ~ if a topic page is displayed
 * topic-{topicID} ~ ID of the topic (lowercase ID)
 * onStory ~ if a story is displayed
 * story-{storyID} ~ ID of the story (lowercase ID)
 *
 * Examples:
 * pathname="/" ===> bodyclasses="onHome"
 * pathname="/topics/Testthema/" ==> bodyclasses="onTopic topic-testthema"
 * pathname="/stories/is-it-me-youre-looking-for/" ==> bodyclasses="onStory story-is-it-me-youre-looking-for"
 *
 */
module.exports = function(){
    var bodyclass = "";
    if (location.pathname==="/") bodyclass = "onHome";
    else {
        var path = location.pathname.replace(/\//g, " ").trim().split(" ");
        switch (path[0]) {
            case "topics":  bodyclass = "onTopic " + path[1].toLowerCase(); break;
            case "stories": bodyclass = "onStory " + path[1].toLowerCase(); break;
        }
    }
    if (bodyclass.length>0) $("body").addClass(bodyclass);
};