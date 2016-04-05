var net = require('net');
var randomFloat = require('random-float');
var async = require('async');

var mongodb = require('mongodb');
var mongodbClient = mongodb.MongoClient;
var mongoose = require('mongoose');
var mongodbURI = 'mongodb://localhost/temploc';
var aggregateOut = require('mongo-aggregate-out');

var longitudeextra = 0.0;
var latitudeextra = 0.0;
var randomangle = 0;
var arr;
mongoose.connect(mongodbURI);


var Schema = mongoose.Schema;

var loc;

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

var ArchiveSchema = new Schema({


    imei: String,
    total_imei: String,
    firstDoc: {
        _id: String,
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
    }

});



var locations = mongoose.model('locations', LocationSchema);
var archiveloc = mongoose.model('archiveloc', ArchiveSchema);


function savedatabymongooes(data) {

    var tepmo = randomFloat(-1, 1);
    var tepma = randomFloat(-1, 1);
    var speeeedd = randomFloat(100);
    //  var imei = randomFloat(100);

    longitudeextra = longitudeextra + tepmo;
    latitudeextra = latitudeextra + tepma;
    randomangle = randomangle + 20;

    var arr = data.split(',');

    var commandtype = arr[2];
    var latitude = arr[4];
    var bewlatitude = parseInt(latitude);
    bewlatitude = longitudeextra;
    var nlat = bewlatitude.toString();

    var longitude = arr[5];
    var numlongi = parseInt(longitude);
    numlongi = latitudeextra;
    var nlong = numlongi.toString();
    var imei = arr[1];
    var datetime = new Date();
    //  console.log(imei);
    var status = arr[7];
    var number_of_satelites = arr[8];
    var gsm_signal_status = arr[9];
    var speed = speeeedd.toString();
    var direction = arr[11];
    var numdirection = parseInt(direction);
    numdirection = numdirection + randomangle;
    var ndirection = numdirection.toString();



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
        latitude: nlat,
        longitude: nlong,
        datetime: new Date(datetime),
        status: status,
        number_of_satelites: number_of_satelites,
        gsm_signal_status: gsm_signal_status,
        speed: speed,
        direction: ndirection,
        horizaontal_accuracy: horizaontal_accuracy,
        altitude: altitude,
        mileage: mileage,
        run_time: run_time,
        base_station_info: base_station_info,
        io_port_status: io_port_status,
        analog_input: analog_input,
        increment_index: unixTimestamp
    });

    async.waterfall([function (callback) {

        loc.save(function (err, imei) {
            if (err) {
                //throw err;
                console.log(err);
            } else {
                loc.imei = imei;
                //console.log('success' + loc.imei);
                var pipeline = [

                    {
                        $group: {

                            _id: '$imei',
                            total_imei: {
                                $sum: 1,


                            },

                            "firstDoc": {
                                "$first": "$$ROOT",

                            },



                        }
                            },



                    {
                        $match: {

                            total_imei: {
                                $gt: 2
                            }
                        }
                            }



                ];




                locations.aggregate(pipeline)
                    .exec(function (err, pipeline) {
                        // callback(pipeline[0]);
                        // handle error
                        // if (err) throw Error;


                        pipeline.forEach(function (d) {
                            var temploc = new archiveloc({

                                total_imei: d.total_imei,
                                firstDoc: d.firstDoc


                            });

                            console.log(d.firstDoc.sourcedevice);
                            temploc.save(function (err) {

                                if (err) {

                                    console.log(err);

                                } else {

                                    console.log("success");
                                }

                            });
                            console.log(d.total_imei);


                            locations.findByIdAndRemove(d.firstDoc._id, function (err, doc) {
                                if (err) {
                                    throw err;
                                } else {
                                    console.log('delete');
                                }

                            })



                        })

                    })

                /*    
                    .map(function (val) {
                    return
                    console.log(d[0].firstDoc);

*/

                /*
                                    var localoca = new archiveloc({
                                        imei: d[0]._id,
                                        total_imei: d[0].total_imei,
                                        firstDoc: [{
                                            imei: String
                                                    }]

                                    });
                                    locations.findByIdAndRemove(d[0].firstDoc._id, function (err, doc) {
                                        if (err) {
                                            throw err;
                                        } else {
                                            console.log('delete');
                                        }

                                    })
                                    var arr = d[0].firstDoc; // array of objects;
                                    var res = [];
                                    //  archiveloc.forEach(function (item) {
                                    archiveloc.update(function (err) {
                                        res.push(err);
                                        if (res.length === arr.length) {
                                            console.log("done");
                                            // Done
                                        }
                                    });*/
                // });
                //})



                // callback(imei);
            }


        });









        /*
                var aggredata = locations.aggregate([


                    {
                        $sort: {
                            createdAt: -1
                        }
                            },

                    {
                        $group: {

                            _id: '$imei',
                            total_imei: {
                                $sum: 1,


                            },

                            "firstDoc": {
                                "$first": "$$ROOT",

                            },
                       


                        }
                            },



                    {
                        $match: {

                            total_imei: {
                                $gt: 2
                            }
                        }
                            },



                ]).exec(function (e, d) {
                    //console.log(d);
                    console.log('remove korbo' + d[0]._id);
                    console.log('remove korbo 2' + d[0].firstDoc._id);
                    /*     var id = d._id;
                         delete id;*/



        /*

                    var localoca = new archiveloc({
                        imei: d[0]._id,
                        total_imei: d[0].total_imei,
                        firstDoc: [{
                            imei: String
            }]

                    });

                    localoca.save(function (err, thor) {
                        if (err) {
                            return console.error(err);
                        } else {
                            console.log(thor._id);


                            locations.findByIdAndRemove(d[0].firstDoc._id, function (err, doc) {
                                if (err) {
                                    throw err;
                                } else {
                                    console.log('delete');
                                }

                            })




                        }
                    });







                }); * /
        */





    }]);







};


var count = 0,
    users = {};
var server = net.createServer(function (conn) {
    conn.setEncoding('utf8');
    // var nickname;
    conn.write(
        ' '
    );

    count++;
    console.log('\033[90m new connection!\033[39m');
});

setInterval(function () {
    autogenerateLoc();
}, 5000);
var numoo = true;

function autogenerateLoc() {


    if (numoo) {
        var locdataa = '$$L154,86669902366722,AAA,35,23.523768,90.222436,160107041217,A,11,12,0,23,0.8,6,10418109,12854934,470|1|61E0|43C4,0000,0000|0000|0000|02D3|010A,00000001,*C6';
        savedatabymongooes(locdataa);
        numoo = false;
    } else {
        var locdataa = '$$L154,866699023667144,AAA,35,23.523768,90.222436,160107041217,A,11,12,0,23,0.8,6,10418109,12854934,470|1|61E0|43C4,0000,0000|0000|0000|02D3|010A,00000001,*C6';
        savedatabymongooes(locdataa);
        numoo = true;
    }




    /* console.log(locdataa);*/

}



server.listen(3333, function () {
    console.log('\033[96m   server listening on *:3333\033[39m');

});