var timeinterval;

Countdown = new Mongo.Collection('countdown');
Meteor.subscribe('countdown', function () {
    if (Countdown.findOne()) {
        var endtime = Meteor.myFunctions.timestampToDate(Countdown.findOne().endtime);
        Meteor.call("getCurrentTime", function (error, result) {
            Session.set("time", result);
        });
        timeinterval = setInterval(function () {
            Session.set("time", Session.get('time')+1000);
            var t = getTimeRemaining(endtime);
            Session.set("t", t);
        }, 1000);
    }
});

function getTimeRemaining(endtime) {
    var t = Date.parse(endtime) - Session.get('time');
    var seconds = ("0" + Math.floor((t / 1000) % 60)).slice(-2);
    var minutes = ("0" + Math.floor((t / 1000 / 60) % 60)).slice(-2);
    var hours = ("0" + Math.floor((t / (1000 * 60 * 60)) % 24)).slice(-2);
    var days = Math.floor(t / (1000 * 60 * 60 * 24));

    // console.log(t)
    if (t <= 0)
        clearInterval(timeinterval);

    return {
        'total': t,
        'days': days,
        'hours': hours,
        'minutes': minutes,
        'seconds': seconds
    };

}

Template.countdown.helpers({
    t: function () {
        if (Session.get("t")) {
            return Session.get("t");
        }

    }
});

Template.countdown.helpers({
    ended: function () {
        if (Session.get("t")) {
            // console.log(Session.get("t").total <= 0);
            return Session.get("t").total <= 0;
        }
    }
});

Timeline = new Mongo.Collection('timeline');
Meteor.subscribe('timeline');

Template.timelineBlock.helpers({
    TimelineBlock: function () {
        return Timeline.find().fetch();
    },
});
Template.timelineBlock.events({
    'click #remove-block'(e){
        e.preventDefault();

        Meteor.call('removeTimelineBlock', this._id)
    },
    'click #add-block'(e){
        e.preventDefault();
        $('#add-block-modal-form').modal('toggle');
    },
    'click #add_block_submit'(e){
        e.preventDefault();
        var name = $('input[name="name_input"]').val(),
            description =$('input[name="description_input"]').val(),
            date = $('input[name="date_input"]').val(),
            location = $('input[name="location_input"]').val();
        Meteor.call('addTimelineBlock',name,description,date,location)

    }
})
