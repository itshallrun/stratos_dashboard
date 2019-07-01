Template.login.events({
    'submit form': function (event) {
        event.preventDefault();
        var email = $('[name=email]').val();
        var password = $('[name=password]').val();
        console.log(email);
        Meteor.loginWithPassword(email, password, function (e) {
            console.log("You initiated the login process.");
            if(e){
                alert(e.reason)
                console.log(e.reason);
            }

        });
    }
});
