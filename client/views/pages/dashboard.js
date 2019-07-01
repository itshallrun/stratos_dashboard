Template.sensorBox.helpers({
    timestamp: function () {
        if (LastValues.findOne()) {
            return LastValues.findOne().timestamp;
        }
    }
})

Template.sensors.helpers({
    lastValueSat: function () {
        return LastValues.find({$or: [{name: 'alt'}, {name: 'lat'}, {name: 'lon'}, {name: 'sat'}, {name: 'fix'}, {name: 'climb'}, {name: 'maxHeight'}]}).fetch();
    },
    lastValueSen: function () {
        return LastValues.find({$or: [{name: 'temp_in'}, {name: 'temp_out'}, {name: 'temp_bat'}, {name: 'pressure'}, {name: 'act_strom'}]}).fetch();
    },
    btn: function () {
        var outcome = 0;
        if ([3, 4, 6, 9, 10, 12].includes(this.id)) {
            outcome = 1
        }
        return outcome;

    },
    valueFormatted: function () {
        let value;
        if (this.id == 1 || this.id == 2) {
            value = this.value.toFixed(5);
        } else {
            value = this.value;
        }
        return value;
    }
})

Template.sensors.events({
    'click': function (e) {

        if (e.target.closest(".sensor-btn")) {

            if (e.target.closest(".sensor-btn").classList.contains('sensor-btn')) {
                let chart = $("#sensorChart").highcharts();
                chart.get(this.name).setVisible();
            }
        }

    }
})


Meteor.call('getApiKey', function (err, result) {
    if (err)
        console.log(err);
    GoogleMaps.load({key: result});
});


Template.map.onCreated(function () {

    GoogleMaps.ready('map', function (map) {
        var legend = document.getElementById('legend');
        map.instance.controls[google.maps.ControlPosition.LEFT_BOTTOM].push
        (legend);
        $('#legend').show()

        // google.maps.event.addListener(map.instance, 'click', function(event) {
        //     ValuesAtTimestamp.insert({ lat: event.latLng.lat(), lng: event.latLng.lng() });
        // });
        var routeMarker = {};
        ValuesAtTimestamp.find().observe({
            added: function (document) {
                var marker = new google.maps.Marker({
                    icon: new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|78b9f3"),
                    draggable: false,
                    animation: google.maps.Animation.DROP,
                    position: new google.maps.LatLng(document.lat, document.lon),
                    map: map.instance,
                    id: document._id,
                    title: 'Alt: ' + document.alt + ' timestamp: ' + document.timestamp
                });

                // google.maps.event.addListener(marker, 'dragend', function (event) {
                //     ValuesAtTimestamp.update(marker.id, {$set: {lat: event.latLng.lat(), lng: event.latLng.lng()}});
                // });

                routeMarker[document._id] = marker;
            },
            changed: function (newDocument, oldDocument) {
                routeMarker[newDocument._id].setPosition({lat: newDocument.lat, lng: newDocument.lng});
            },
            removed: function (oldDocument) {
                routeMarker[oldDocument._id].setMap(null);
                google.maps.event.clearInstanceListeners(routeMarker[oldDocument._id]);


                delete routeMarker[oldDocument._id];
            }
        });

        Forecast.find().observe({
            added: function (document) {
                var marker = new google.maps.Marker({
                    icon: new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|34ba46"),
                    draggable: false,
                    animation: google.maps.Animation.DROP,
                    position: new google.maps.LatLng(document.lat, document.lon),
                    map: map.instance,
                    id: document._id,
                    title: 'Alt: ' + document.alt + ' timestamp: ' + document.timestamp
                });

                // google.maps.event.addListener(marker, 'dragend', function (event) {
                //     ValuesAtTimestamp.update(marker.id, {$set: {lat: event.latLng.lat(), lng: event.latLng.lng()}});
                // });

                routeMarker[document._id] = marker;
            },
            changed: function (newDocument, oldDocument) {
                routeMarker[newDocument._id].setPosition({lat: newDocument.lat, lng: newDocument.lng});
            },
            removed: function (oldDocument) {
                routeMarker[oldDocument._id].setMap(null);
                google.maps.event.clearInstanceListeners(routeMarker[oldDocument._id]);


                delete routeMarker[oldDocument._id];
            }
        });
    });

});

Template.map.helpers({
    mapOptions: function () {
        if (GoogleMaps.loaded()) {
            return {
                center: new google.maps.LatLng(49.22692519944049, 6.9927978515625),
                zoom: 8,
                scrollwheel: false
            };
        }
    }
});


var Highcharts = require('highcharts/highstock');
Highcharts.setOptions({
    global: {
        useUTC: false
    }
})


function setChartData(field) {

    return ValuesAtTimestamp.find(
        {},
        {
            fields: {
                alt: 1,
                sat: 1,
                temp_in: 1,
                temp_out: 1,
                temp_bat: 1,
                pressure: 1,
                act_strom: 1,
                timestamp: 1
            }
        }
    ).fetch().map((row) => {
        {
            return [Meteor.myFunctions.dateToTimestamp(row.timestamp), row[field] * 1]
        }
    });
}

Template.dashboard.helpers({
    sensorChart: function () {

        // Gather data:
        var altData = setChartData('alt');
        var satData = setChartData('sat');
        var temp_inData = setChartData('temp_in');
        var temp_outData = setChartData('temp_out');
        var temp_batData = setChartData('temp_bat');
        var act_stromData = setChartData('act_strom');
        var pressureData = setChartData('pressure');
        // Use Meteor.defer() to create chart after DOM is ready:
        Meteor.defer(function () {

            // Create standard Highcharts chart with options:
            Highcharts.chart('sensorChart', {
                title: {
                    text: 'Sensorendiagramm'
                },
                chart: {
                    zoomType: 'x',
                    type: 'area'
                },
                xAxis: {
                    type: 'datetime'
                },
                yAxis: [{
                    title: {
                        text: ''
                    }
                }, {
                    title: {
                        text: ''
                    }, opposite: true
                }],
                tooltip: {
                    shared: true
                },
                series: [{
                    id: 'alt',
                    name: 'Höhe',
                    data: altData,
                    yAxis: 0,
                    tooltip: {
                        valueSuffix: ' m'
                    }
                }, {
                    id: 'sat',
                    name: 'Sat',
                    data: satData,
                    yAxis: 1,
                    type: 'column'
                }, {
                    id: 'temp_in',
                    name: 'Temp. innen',
                    data: temp_inData,
                    type: 'spline',
                    dashStyle: 'shortdot',
                    yAxis: 1,
                    tooltip: {
                        valueSuffix: ' °C'
                    }

                }, {
                    id: 'temp_out',
                    name: 'Temp. außen',
                    data: temp_outData,
                    type: 'spline',
                    dashStyle: 'shortdot',
                    yAxis: 1,
                    tooltip: {
                        valueSuffix: ' °C'
                    }

                }, {
                    id: 'temp_bat',
                    name: 'Temp. Akku',
                    data: temp_batData,
                    type: 'spline',
                    dashStyle: 'shortdot',
                    yAxis: 1,
                    tooltip: {
                        valueSuffix: ' °C'
                    }

                }, {
                    id: 'act_strom',
                    name: 'akt. Spannung',
                    data: act_stromData,
                    type: 'spline',
                    yAxis: 0,
                    tooltip: {
                        valueSuffix: ' mV'
                    }

                }, {
                    id: 'pressure',
                    name: 'Luftdruck',
                    data: pressureData,
                    yAxis: 0,
                    tooltip: {
                        valueSuffix: ' hPa'
                    }

                }]

            });
        });
    }
})


