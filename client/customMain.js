ApiKey = new Mongo.Collection('apiKey');
LastValues = new Mongo.Collection('lastValues');
ValuesAtTimestamp = new Mongo.Collection('valuesAtTimestamp');
Forecast = new Mongo.Collection('forecast');

ActiveFlight = new Mongo.Collection('activeFlight');
Meteor.subscribe('activeFlight');

Meteor.subscribe('lastValues');
Meteor.subscribe('valuesAtTimestamp');
Meteor.subscribe('forecast');
Meteor.subscribe('apiKey');







