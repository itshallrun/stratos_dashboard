


FlowRouter.route('/', {
    action: function () {
        FlowRouter.go('/timeline');
    }
});


function checkLoggedIn(ctx, redirect) {
    if (!Meteor.userId()) {

        var route = FlowRouter.current()
        if (route.route.group.name === 'private') {
            Session.set('redirectAfterLogin', route.path)
            redirect('/login')
        }
    }
}

function redirectIfLoggedIn(ctx, redirect) {
    if (Meteor.userId()) {
        redirect('/dashboard')
    }
}

var privateRoutes = FlowRouter.group({
    name: 'private',
    triggersEnter: [
        checkLoggedIn
    ]
})

var publicRoutes = FlowRouter.group({
    name: 'public'
})


publicRoutes.route('/timeline', {
    action: function () {
        BlazeLayout.render("mainLayout", {content: "timeline"});
    }
});

publicRoutes.route('/dashboard', {
    action: function () {
        BlazeLayout.render("mainLayout", {content: "dashboard"});
    }
});

privateRoutes.route('/admin', {
    action: function () {
        BlazeLayout.render("mainLayout", {content: "admin"});
    }
});

privateRoutes.route('/flightcontrol', {
    action: function () {
        BlazeLayout.render("mainLayout", {content: "flightcontrol"});
    }
});

publicRoutes.route('/login', {
    action: function () {
        BlazeLayout.render("mainLayout", {content: "login"});
    }
});

publicRoutes.route('/impressum', {
    action: function () {
        BlazeLayout.render("mainLayout", {content: "impressum"});
    }

})

FlowRouter.notFound = {
    // Subscriptions registered here don't have Fast Render support.

    action: function () {
        BlazeLayout.render("mainLayout", {content: "notFound"});
    }
};

Accounts.onLogin(function () {
    var redirect = Session.get('redirectAfterLogin');
    if (redirect) {
        if (redirect != '/login') {
            FlowRouter.go(redirect)
        }
    }

})
