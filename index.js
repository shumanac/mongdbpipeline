var net = require('net');
//var mqtt=require('mqtt');  
var mongodb = require('mongodb');
var mongodbClient = mongodb.MongoClient;
var mongoose = require('mongoose');
var mongodbURI = 'mongodb://heroku_jmlw649q:rf59u0v806q6t1l5ltsl2l4tl2@ds041831.mongolab.com:41831/heroku_jmlw649q';

mongoose.connect(mongodbURI);


var Schema = mongoose.Schema;



var LocationSchema = new Schema({
    sourcedevice: String,
    imei: String,
    commandtype: String,
    latitude: String,
    longitude: String,
    datetime: Date,
    status: String,
    number_of_satelites: String,
    gsm_signal_status: String,
    speed: String,
    direction: String,
    horizaontal_accuracy: String,
    altitude: String,
    mileage: String,
    run_time: String,
    base_station_info: String,
    io_port_status: String,
    analog_input: String,
    increment_index: Number
});
var locations = mongoose.model('locations', LocationSchema);


function savedatabymongooes(data) {


    var arr = data.split(',');
    var imei = arr[1];
    var commandtype = arr[2];
    var latitude = arr[4];
    var longitude = arr[5];
    var datetime = new Date();
    //console.log(datetime);
    var status = arr[7];
    var number_of_satelites = arr[8];
    var gsm_signal_status = arr[9];
    var speed = arr[10];
    var direction = arr[11];
    var horizaontal_accuracy = arr[12];
    var altitude = arr[13];
    var mileage = arr[14];
    var run_time = arr[15];
    var base_station_info = arr[16];
    var io_port_status = arr[17];
    var analog_input = arr[18];
    var unixTimestamp = Date.now();
    //console.log('unixTimestamp' + unixTimestamp);



    var loc = new locations({
        sourcedevice: 'tcpping',
        imei: imei,
        commandtype: commandtype,
        latitude: latitude,
        longitude: longitude,
        datetime: new Date(datetime),
        status: status,
        number_of_satelites: number_of_satelites,
        gsm_signal_status: gsm_signal_status,
        speed: speed,
        direction: direction,
        horizaontal_accuracy: horizaontal_accuracy,
        altitude: altitude,
        mileage: mileage,
        run_time: run_time,
        base_station_info: base_station_info,
        io_port_status: io_port_status,
        analog_input: analog_input,
        increment_index: unixTimestamp
    });

    loc.save(function (err) {
        if (err) {
            //throw err;
            console.log(err);
        } else {
            //console.log('success');
        }


    });

}







var count = 0,
    users = {};
var server = net.createServer(function (conn) {
    conn.setEncoding('utf8');
    var nickname;
    conn.write(
        ' Welcome to AGD IT SLNS Vehicle Tracking System'
    );

    count++;


    function broadcast(msg, exceptMyself) {
        for (var i in users) {
            if (!exceptMyself || i != nickname) {
                users[i].write(msg);

            }
        }
    }


    conn.on('data', function (data) {
        data = data.replace('\r\n', '');
        //console.log(data);
        if (data.substring(0, 2) == "$$") {
            savedatabymongooes(data);
        }
        // insertEvent(data);

        //console.log(data.toString('utf8'));
        if (!nickname) {

            if (users[data]) {
                conn.write('\033[93m> nickname already in use. try again:\033[39m ');
                return;
            } else {
                nickname = data;
                users[nickname] = conn;
                // for (var i in users) {
                //users[i].write('\033[90m > ' + nickname + ' joined the room\033[39m\n');
                broadcast('\033' + nickname + ' ');
                //} 
            }
        } else {
            // otherwise you consider it a chat message
            // for (var i in users) {
            // if (i != nickname) {
            //      users[i].write('\033' + nickname + ':\033[39m ' + data + '\n');/
            //} }
            broadcast('\033' + data + '\n', true);


        }








    });

    conn.on('error', function (e) {
        console.log('Is the server running at ' + '8080' + '?');
        conn.setTimeout(4000, function () {
            conn.on('data', function (data) {
                data = data.replace('\r\n', '');
                if (data.substring(0, 2) == "$$")
                //insertEvent(data);
                    savedatabymongooes(data);
                if (!nickname) {
                    if (users[data]) {
                        conn.write('\033[93m> nickname already in use. try again:\033[39m ');
                        return;
                    } else {
                        nickname = data;
                        users[nickname] = conn;
                        broadcast('\033' + nickname + ' ');
                    }
                } else {
                    broadcast('\033' + data + '\n', true);
                }
            });
        });
        console.log('Timeout for 5 seconds before trying port:' + '8080' + ' again');
    });

    conn.on('close', function () {

        count--;

        delete users[nickname];
        broadcast('\033' + nickname + '\n');
    });
    console.log('\033[90m new connection!\033[39m');
});


var newserver = net.createServer(function (conn) {
    conn.setEncoding('HEX');

    conn.on('data', function (data) {
        //console.log(data.length);
        var newdata = data.replace(/ /g, '');
        //console.log(newdata);
        if (data.length === 62) {
            var devicetag = data.toString().slice(0, 2);
            //console.log(splits);
            if (devicetag === '7e') {

                var messageid = data.slice(2, 6);
                //console.log(terminalAthentication);
                if (messageid === '0102') {
                    var deviceid = newdata.slice(10, 22);
                    var serialID = newdata.slice(23, 27);
                    var Authenticationkey = newdata.slice(28, 58);
                    var calibration = newdata.slice(58, 60);
                    var endtag = newdata.slice(60, 62);

                    var messagelength = '0005';
                    var result = '00';
                    var responsemessageid = '0102';

                    //console.log(endtag);

                    conn.write(devicetag + messageid + messagelength + deviceid + serialID + serialID);

                }
            }

        }

    });

    conn.on('error', function (e) {

    });

    conn.on('close', function () {


    });


    console.log('6264  new connection');
});


newserver.listen(6264, function () {
    console.log('\033[96m   server listening on *:6264\033[39m');
});
server.listen(8080, function () {
    console.log('\033[96m   server listening on *:8080\033[39m');
});