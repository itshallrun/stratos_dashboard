Meteor.myFunctions = {
    dateToTimestamp: function (date) {
        var dateString = date,
            dateTimeParts = dateString.split(' '),
            timeParts = dateTimeParts[1].split(':'),
            dateParts = dateTimeParts[0].split('-'),
            timestamp;

        timestamp = new Date(dateParts[0], parseInt(dateParts[1], 10) - 1, dateParts[2], timeParts[0], timeParts[1], timeParts[2]);
        return timestamp.getTime();
    },
    timestampToDate: function (timestamp) {
        var date = new Date(timestamp * 1);
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
        var hours = date.getHours();
        var minutes = "0" + date.getMinutes();
        var seconds = "0" + date.getSeconds();
        return dd + ' ' + n + ' ' + yyyy + ' ' + hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
    },
    CSV2JSON: function (csv) {
        function CSVToArray(strData, strDelimiter) {
            strDelimiter = (strDelimiter || ",");
            var objPattern = new RegExp((
            "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +
            "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +
            "([^\"\\" + strDelimiter + "\\r\\n]*))"), "gi");
            var arrData = [[]];
            var arrMatches = null;
            while (arrMatches = objPattern.exec(strData)) {
                var strMatchedDelimiter = arrMatches[1];
                if (strMatchedDelimiter.length && (strMatchedDelimiter != strDelimiter)) {
                    arrData.push([]);
                }
                if (arrMatches[2]) {
                    var strMatchedValue = arrMatches[2].replace(
                        new RegExp("\"\"", "g"), "\"");
                } else {
                    var strMatchedValue = arrMatches[3];
                }
                arrData[arrData.length - 1].push(strMatchedValue);
            }
            return (arrData);
        }
        var array = CSVToArray(csv);
        var objArray = [];
        for (var i = 1; i < array.length; i++) {
            objArray[i - 1] = {};
            for (var k = 0; k < array[0].length && k < array[i].length; k++) {
                var key = array[0][k];
                objArray[i - 1][key] = array[i][k]
            }
        }
        var json = JSON.stringify(objArray);
        var str = json.replace(/},/g, "},\r\n");
        return str;
    }
}

// Logo = new Mongo.Collection('logo');
// LogoStore = new UploadFS.store.Local({
//     collection: Logo,
//     name: 'logo',
//     path: '/uploads/logo',
//     mode: '0744', // directory permissions
//     writeMode: '0744', // file permissions
//     filter: new UploadFS.Filter({
//         minSize: 1,
//         maxSize: 1024 * 1000, // 1MB,
//         contentTypes: ['image/*'],
//         extensions: ['png']
//     })
// });




