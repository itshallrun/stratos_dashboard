

Template.setGoogleApiKey.events({
    'submit form': function(event){
        event.preventDefault();
        var keyInput = event.target.apiKeyInput.value;
        Meteor.call('setApiKey',keyInput);
        event.target.apiKeyInput.value = "";
    }
});

Template.setGoogleApiKey.helpers({

    apiKey: function () {
        
        return ApiKey.findOne();
    }
})

Template.upload.events({
    'click button[name=upload]': function (ev) {
        ev.preventDefault();
        var self = this;

        UploadFS.selectFiles(function (file) {
            // Prepare the file to insert in database, note that we don't provide an URL,
            // it will be set automatically by the uploader when file transfer is complete.

            var logo = {
                name: 'logo.png',
                size: file.size,
                type: file.type,
                            };
            // Create a new Uploader for this file
            var uploader = new UploadFS.Uploader({
                // This is where the uploader will save the file
                store: LogoStore,
                // Optimize speed transfer by increasing/decreasing chunk size automatically
                adaptive: true,
                // Define the upload capacity (if upload speed is 1MB/s, then it will try to maintain upload at 80%, so 800KB/s)
                // (used only if adaptive = true)
                capacity: 0.8, // 80%
                // The size of each chunk sent to the server
                chunkSize: 8 * 1024, // 8k
                // The max chunk size (used only if adaptive = true)
                maxChunkSize: 128 * 1024, // 128k
                // This tells how many tries to do if an error occurs during upload
                maxTries: 5,
                // The File/Blob object containing the data
                data: file,
                // The document to save in the collection
                file: logo,
                // The error callback
                onError: function (err) {
                    console.error(err);
                },
                onAbort: function (file) {
                    console.log(file.name + ' upload has been aborted');
                },
                onComplete: function (file) {
                    console.log(file.name + ' has been uploaded');
                    Meteor.call('logoRemoveExceptUploaded', file._id);
                },
                onCreate: function (file) {
                    console.log(file.name + ' has been created with ID ' + file._id);
                },
                onProgress: function (file, progress) {
                    console.log(file.name + ' ' + (progress*100) + '% uploaded');
                },
                onStart: function (file) {
                    console.log(file.name + ' started');
                },
                onStop: function (file) {
                    console.log(file.name + ' stopped');
                }
            });

            // Starts the upload
            uploader.start();

            // // Stops the upload
            // uploader.stop();
            //
            // // Abort the upload
            // uploader.abort();
        });
    }
});

Template.admin.helpers({
    // logoUrl: function(){
    //     if(Logo.findOne()){
    //         return Logo.findOne().url;
    //     }
    // },
    logoUrl: '/logo_2016.png',
})
