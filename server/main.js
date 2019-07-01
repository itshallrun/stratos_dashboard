var dataApiUrl = 'http://localhost:8080';
var serverUrl = dataApiUrl + "/stratos/api/";


function getToken() {
    // console.log('requesting token')
    try {
        var result = HTTP.call(
            "POST",
            dataApiUrl + "/token",
            {
                headers: {
                    Authorization: 'Basic YWRtaW46QURN'
                },
                params: {grant_type: 'client_credentials'}
            }
        );
        // console.log("result: "+result.data.access_token)
        return result.data.access_token;
    } catch (e) {
        // console.log('token request failed')
        console.log(e)
        return 0;

    }


}

var token = getToken();
var authorization = 'Bearer ' + token;
var default_mapsApi_key = 'AIzaSyBxq4sRNN4lmkITiXz3AGB0w1UQGV6aGJY';

const demo = true;


function loadActiveFlight() {

    if (demo) {

        return {
            id: 1,
            description: "fake flug",
            start_time: "01.01.2019 00:00:00"
        };
    }


    try {

        var result = Meteor.http.call(
            "GET",
            serverUrl + 'activeMission',
            {
                headers: {
                    'Authorization': authorization
                }
            }
        );
        return JSON.parse(result.content);

    } catch (e) {
        // console.log('token request failed')
        console.log(e)
        return 0;

    }


}

function loadSensorMeta() {

    if (demo) {


        SensorMeta.insert({
                id: 1,
                description: 1,
                name: 1,
                producer: 1,
                unit: 1,
                visible: true

            }
        )
        console.log("test")


        return
    }
    var result = Meteor.http.call(
        "GET",
        serverUrl + 'sensor',
        {
            headers: {
                'Authorization': authorization
            }
        }
    );

    for (let i of result.data) {
        try {
            SensorMeta.update({
                    id: i['id']
                },
                {
                    $set: {
                        description: i['description'],
                        name: i['name'],
                        producer: i['producer'],
                        unit: i['unit'],
                        visible: i['visible']
                    }
                }, {upsert: 1}
            )

        } catch
            (e) {
            console.log(e);
        }

    }


}

function calcClimb() {
    var climb = 0;
    if (ValuesAtTimestamp.findOne()) {
        var foundValues = ValuesAtTimestamp.find({}, {sort: {timestamp: 1}});
        var length = foundValues.count();
        var lastValue = foundValues.fetch()[length - 1].alt;
        var lastTimestamp = foundValues.fetch()[length - 1].timestamp;
        var preLastValue = foundValues.fetch()[length - 2].alt;
        var preLastTimestamp = foundValues.fetch()[length - 2].timestamp;
        lastTimestamp = Meteor.myFunctions.dateToTimestamp(lastTimestamp);
        preLastTimestamp = Meteor.myFunctions.dateToTimestamp(preLastTimestamp);
        var timespan = ((lastTimestamp - preLastTimestamp) / 1000);
        climb = Math.round(((lastValue - preLastValue) / timespan) * 100) / 100;
    }
    return climb;

}

function loadLastValues() {


    var result = Meteor.http.call("GET", serverUrl + 'lastValues',
        {
            headers: {
                'Authorization': authorization
            }
        }
    );
    for (let i of result.data) {
        try {
            LastValues.update({
                    id: i['sensor_id'],
                    name: SensorMeta.findOne({id: i['sensor_id']}).name,
                    unit: SensorMeta.findOne({id: i['sensor_id']}).unit,
                    description: SensorMeta.findOne({id: i['sensor_id']}).description

                }, {
                    $set: {
                        timestamp: i['timestamp'],
                        value: sensorArcMinutesToDegree(i['sensor_id'], i['value'])
                    }
                }, {upsert: true}
            );
        } catch (e) {
            console.log(e);
        }
    }
    try {
        let climbId = 12;
        LastValues.update({
                id: climbId,
                name: SensorMeta.findOne({id: climbId}).name,
                unit: SensorMeta.findOne({id: climbId}).unit,
                description: SensorMeta.findOne({id: climbId}).description

            }, {
                $set: {
                    timestamp: result.data[0]['timestamp'],
                    value: calcClimb()
                }
            }, {upsert: true}
        );
    } catch (e) {
        console.log(e);
    }
    try {
        let maxHeightId = 21;
        let maxHeightObj = ValuesAtTimestamp.findOne({}, {sort: {alt: -1}});
        LastValues.update({
                id: maxHeightId,
                name: 'maxHeight',
                unit: 'm',
                description: 'Max. Höhe'

            }, {
                $set: {
                    timestamp: maxHeightObj.timestamp,
                    value: maxHeightObj.alt
                }
            }, {upsert: true}
        );
    } catch (e) {
        console.log(e);
    }

}

function sensorArcMinutesToDegree(id, value) {
    var degree;
    if (id == 1) {
        degree = value.substring(0, 1) * 1 + value.slice(1) * 0.0166667;
    } else if (id == 2) {
        degree = value.substring(0, 2) * 1 + value.slice(2) * 0.0166667;
    } else {
        degree = value
    }
    return degree;
}

function loadAllValues(mission, sensor) {
    //umweg über :mission/:sensor, da /missionValues keine Daten liefert.
    var result = Meteor.http.call("GET", serverUrl + 'missionValuesSensor/' + mission + "/" + sensor,
        {
            headers: {
                'Authorization': authorization
            }
        }
    );
    for (let i of result.data) {
        try {
            AllValues.update({
                    timestamp: i['timestamp'],
                    id: i['sensor_id'],
                }, {
                    $set: {
                        value: sensorArcMinutesToDegree(i['sensor_id'], i['value'])
                    }
                }, {upsert: true}
            );
        } catch (e) {
            console.log(e);
        }
    }
}

function loadValuesAtTimestamp() {
    var route = AllValues.find({$or: [{id: 1}, {id: 2}, {id: 3}]}).fetch();
    for (var i = 0; i < route.length; i++) {
        function findSensorValueAtTimestamp(sensorId, timestamp) {
            return (AllValues.findOne({$and: [{id: sensorId}, {timestamp: timestamp}]}))
                ? AllValues.findOne({$and: [{id: sensorId}, {timestamp: timestamp}]}).value
                : 0;
        }

        var entry = route[i];
        ValuesAtTimestamp.update({
            timestamp: entry['timestamp'],

        }, {
            $set: {
                lon: findSensorValueAtTimestamp(1, entry['timestamp']),
                lat: findSensorValueAtTimestamp(2, entry['timestamp']),
                alt: findSensorValueAtTimestamp(3, entry['timestamp']) * 1,
                sat: findSensorValueAtTimestamp(4, entry['timestamp']),
                fix: findSensorValueAtTimestamp(5, entry['timestamp']),
                temp_in: findSensorValueAtTimestamp(6, entry['timestamp']),
                temp_out: findSensorValueAtTimestamp(7, entry['timestamp']),
                temp_bat: findSensorValueAtTimestamp(8, entry['timestamp']),
                pressure: findSensorValueAtTimestamp(9, entry['timestamp']),
                act_strom: findSensorValueAtTimestamp(10, entry['timestamp']),
                act_ladung: findSensorValueAtTimestamp(11, entry['timestamp']),
                climb: findSensorValueAtTimestamp(12, entry['timestamp'])
            }
        }, {upsert: true})
    }
}

function autoloadEveryInt(mission, interval) {
//reloads LastValues every ... ms
    Meteor.setInterval(function () {

        var i = 1;
        while (i <= 12) {
            loadAllValues(mission, i);
            i++;

        }

        loadLastValues();
        // console.log('last values reloaded:' + new Date())
        loadValuesAtTimestamp();
        loadSensorMeta();
    }, interval);
}

function loadForecast(mission) {
    var result = Meteor.http.call("GET", serverUrl + 'forecast/' + mission,
        {
            headers: {
                'Authorization': authorization
            }
        }
    );
    let index = 0;
    for (let i of result.data) {
        if (i['sensorid'] == 14) {

            var latObj = result.data[index + 1];
            var altObj = result.data[index + 2];
            try {
                Forecast.update({
                        timestamp: i['timestamp'],
                    }, {
                        $set: {
                            lon: i['value'],
                            lat: latObj['value'],
                            alt: altObj['value'] * 1
                        }
                    }, {upsert: true}
                );
            } catch (e) {
                console.log(e);
            }
        }

        index++;
    }
}


Meteor.startup(() => {


    var activeFlight = loadActiveFlight()
    var mission = activeFlight.id; //Wählt die Aktive mission aus.
    ActiveFlight = new Mongo.Collection('activeFlight');
    SensorMeta = new Mongo.Collection('sensorMeta');
    SensorMeta._ensureIndex({'id': 1}, {unique: 1});
    LastValues = new Mongo.Collection('lastValues');
    LastValues._ensureIndex({'id': 1}, {unique: 1});
    AllValues = new Mongo.Collection('allValues');
    AllValues._ensureIndex({'id': 1, 'timestamp': 1}, {unique: 1});
    ValuesAtTimestamp = new Mongo.Collection('valuesAtTimestamp');
    ValuesAtTimestamp._ensureIndex({'timestamp': 1}, {unique: 1});
    Forecast = new Mongo.Collection('forecast');
    ApiKey = new Mongo.Collection('apiKey');
    ApiKey._ensureIndex({'key': 1}, {unique: 1});
    Countdown = new Mongo.Collection('countdown');
    Timeline = new Mongo.Collection('timeline');

    ActiveFlight.remove({});
    ActiveFlight.insert({
        id: activeFlight.id,
        description: activeFlight.description,
        start_time: activeFlight.start_time,
        end_time: activeFlight.end_time
    });

    autoloadEveryInt(mission, 60000);
    loadValuesAtTimestamp();
    // loadForecast(mission) //bezieht die Vorhersage vom server
    Meteor.publish('activeFlight', function () {
        return ActiveFlight.find();
    })
    Meteor.publish('lastValues', function () {
        return LastValues.find();
    })
    Meteor.publish('valuesAtTimestamp', function () {
        return ValuesAtTimestamp.find({}, {sort: {timestamp: 1}});
    })
    Meteor.publish('forecast', function () {
        return Forecast.find();
    })
    Meteor.publish('apiKey', function () {
        return ApiKey.find();
    })
    Meteor.publish('countdown', function () {
        return Countdown.find();
    })
    Meteor.publish('timeline', function () {
        return Timeline.find();
    })
    // Meteor.publish('logo', function () {
    //     return Logo.find();
    // })
    try {
        Accounts.createUser({
            email: 'admin@a.a',
            password: "123",
            profile: {username: 'admin'},
            profile: {name: 'admin'},
        });
    } catch (e) {
        // console.log('admin exist')
    }
    try {
        if (typeof ApiKey.findOne() == 'undefined') {
            ApiKey.update({}, {
                $set: {
                    key: default_mapsApi_key
                }
            }, {upsert: true})
        }
    } catch (e) {
        ApiKey.update({}, {
            $set: {
                key: default_mapsApi_key
            }
        }, {upsert: true})
    }


})
;
Meteor.methods({
    'setApiKey': function (keyInput) {
        ApiKey.update({}, {
            $set: {
                key: keyInput,
                userID: Meteor.userId()
            }
        }, {upsert: true})
    },
    'getApiKey': function () {
        return ApiKey.findOne().key
    },
   // 'logoRemoveExceptUploaded': function (uloaded_id) {
   //     Logo.remove({_id: {$ne: uloaded_id}});
   // },
    'getCurrentTime': function () {
        return Date.parse(new Date());
    },
    'setEndtime': function (endtime) {
        Countdown.update({}, {
            $set: {
                endtime: endtime
            }
        }, {upsert: true})
    },
    'addTimelineBlock': function (name, description, date, location) {
        Timeline.insert({name: name, description: description, date: date, location: location})
    },
    'removeTimelineBlock': function (id) {
        Timeline.remove(id);
    },
    'uploadForecast': function (forecast) {
        Forecast.remove({});
        forecast.forEach(function (value) {
            try {

                if (typeof value['timestamp'] == 'undefined'
                    || typeof value['lng'] == 'undefined'
                    || typeof value['lat'] == 'undefined'
                    || typeof value['alt'] == 'undefined') {

                } else {
                    Forecast.update({
                            timestamp: value['timestamp'],
                        }, {
                            $set: {
                                lon: value['lng'],
                                lat: value['lat'],
                                alt: value['alt'] * 1
                            }
                        }, {upsert: true}
                    );
                }

            } catch (e) {
                console.log(e);
            }
        });
    },
    'reset_meta': function () {
        SensorMeta.remove({})
    },
    'reset_sensorval': function () {
        AllValues.remove({});
        ValuesAtTimestamp.remove({});
        LastValues.remove({})

    },
    'reset_forecast': function () {
        Forecast.remove({});

    },
    'reset_activeFlight': function () {
        ActiveFlight.remove({});
        var activeFlight = loadActiveFlight()
        ActiveFlight.insert({
            id: activeFlight.id,
            description: activeFlight.description,
            start_time: activeFlight.start_time,
            end_time: activeFlight.end_time
        });

    }
});


