Template.flightcontrol.helpers({
    ActiveFlight: function(){
    if(ActiveFlight.findOne()){
        return ActiveFlight.findOne();
    }
}
})
Template.flightcontrol.rendered = function () {
    var date = new Date();
    var dd = date.getDate();
    var month = new Array();
    month[0] = "January";
    month[1] = "February";
    month[2] = "March";
    month[3] = "April";
    month[4] = "May";
    month[5] = "June";
    month[6] = "July";
    month[7] = "August";
    month[8] = "September";
    month[9] = "October";
    month[10] = "November";
    month[11] = "December";
    var n = month[date.getMonth()];
    var yyyy = date.getFullYear();
    var today = dd + ' ' + n + ' ' + yyyy;

    $('#datepicker').val(today);
    // Initialie datepicker
    $('#data_1 .input-group.date').datepicker({
        todayBtn: "linked",
        keyboardNavigation: false,
        forceParse: false,
        calendarWeeks: true,
        autoclose: true,
        language: 'de',
        format: 'dd MM yyyy'
    });
    // Initialie clockpicker
    $('.clockpicker').clockpicker();
}
Template.flightcontrol.events({
    'click #reset_meta':function(event){
        event.preventDefault();
        if(confirm('Sind Sie sicher das Sie die Werte zurücksetzen möchten?')) {

            Meteor.call('reset_meta', function (e, r) {
                if (e) {
                    console.log(e);
                } else {
                    alert('Werte zurückgesetzt.')
                }
            })
        }
    },
    'click #reset_sensorval':function(event){
        event.preventDefault();
        if(confirm('Sind Sie sicher das Sie die Werte zurücksetzen möchten?')) {

            Meteor.call('reset_sensorval', function (e, r) {
                if (e) {
                    console.log(e);
                } else {
                    alert('Werte zurückgesetzt.')
                }
            })
        }

    },
    'click #reset_forecast':function(event){
        event.preventDefault();
        if(confirm('Sind Sie sicher das Sie die Werte zurücksetzen möchten?')) {
            Meteor.call('reset_forecast', function (e, r) {
                if (e) {
                    console.log(e);
                } else {
                    alert('Werte zurückgesetzt.')
                }
            })
        }
    },
    'click #reset_activeFlight':function(event){
        event.preventDefault();
        if(confirm('Sind Sie sicher das Sie die Werte zurücksetzen möchten?')) {
            Meteor.call('reset_activeFlight', function (e, r) {
                if (e) {
                    console.log(e);
                } else {
                    alert('Werte zurückgesetzt.')
                }
            })
        }
    }
})
Template.setCountdown.events({
    'submit form': function (event) {
        event.preventDefault();
        var dataval = $('#datepicker').val();
        var clockval = $('#clockpicker').val();
        var endtime = String(Date.parse(dataval + ' ' + clockval));
        Meteor.call('setEndtime', endtime, function (e, r) {
            // console.log(e);
            // console.log(r);
        })
    }
})

Template.setCountdown.helpers({
    endTime: function () {
        if (Countdown.findOne()) {
            return 'Das aktuelle Enddatum ist: ' + Meteor.myFunctions.timestampToDate(Countdown.findOne().endtime);
        }
    }

})
var allowupload = 0;
var jsonParsed = 0;
Template.forecast.events({
    'submit form': function (event) {
        event.preventDefault();
        if (!allowupload) {
            var forcastInput = $('#forecastInput');
            var csv = forcastInput.val();
            if (csv == '') {
                alert('Eingabe leer')
            } else {
                var jsonRaw = Meteor.myFunctions.CSV2JSON(csv)
                var jsonFormat = 0;
                try {
                    jsonParsed = JSON.parse(jsonRaw);
                    if (('timestamp' in jsonParsed[0])
                        && ('lat' in jsonParsed[0])
                        && ('lng' in jsonParsed[0])
                        && ('alt' in jsonParsed[0])
                    ) {
                        jsonFormat = 1;
                    } else {
                        throw new Error('Whoops!');
                    }
                } catch (e) {
                    alert('invalid csv input');
                }
                if (jsonParsed && jsonFormat) {
                    forcastInput.val(jsonRaw);
                    allowupload = 1;
                    $('#csv2jsonSubmit').html('<strong>hochladen</strong>')
                }

            }
        } else {
            Meteor.call('uploadForecast', jsonParsed)
            allowupload = 0;
            jsonParsed = 0;
            $('#csv2jsonSubmit').html('<strong>Nach JSON konvertieren</strong>');
            $('#forecastInput').val('')

        }


    }
})