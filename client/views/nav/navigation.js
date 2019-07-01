Template.navigation.rendered = function () {

    // Initialize metisMenu
    $('#side-menu').metisMenu();

};

//Meteor.subscribe('logo');

Template.navigation.helpers({
    // logoUrl: function(){
    //     if(Logo.findOne()){
    //         return Logo.findOne().url;
    //     }
    // },
    logoUrl: '/logo_2016.png',
    email: function () {
        if (Meteor.user()) {
            return Meteor.user().emails[0].address;
        }
    }
})

Template.navigation.events({
    'click .logout': function (event) {
        event.preventDefault();
        Meteor.logout(function (err) {
            if (FlowRouter.current().route.group.name === 'private') {
                FlowRouter.go('/login')
            }
        });
    }
});