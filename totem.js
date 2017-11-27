// Roberto Giungato (C) 2017
// sistema per gestione Totem 
// controllo Led, attivazione da RFID


var rc522 = require("rc522");
var mysql = require('mysql');
var Gpio = require('onoff').Gpio,
        led0 = new Gpio(26, 'out'),
        led1 = new Gpio(19, 'out'),
        led2 = new Gpio(13, 'out');
var config = require('./config.js');

var sn = 0;
var totemNumber = 'l1';

connection = mysql.createConnection({
  host     : config.host,
  user     : config.user,
  password : config.password,
  database : config.database
});

connection.connect(function(err) {
  if (err) {
    console.error('error connecting: ' + err.stack);
    return;
  }
  console.log('connected as id ' + connection.threadId);
});


console.log('Ready!!!');

rc522(function(rfidSerialNumber){
        sn = rfidSerialNumber;
        console.log(sn);
        saveLedStatus(sn,totemNumber);
        applyLedStatus(sn);
});

process.on('SIGINT', function () {
  led0.unexport();
  led1.unexport();
  led2.unexport();
});

function saveLedStatus(token, led) {
        connection.query('UPDATE totem SET l1 = 1 WHERE token = ?', [token]);
}


function fetchLedStatus(token, callback) {
        connection.query('SELECT l1,l2,l3 FROM totem WHERE token = ?', token, function(err, rows) {
                if (err) {
                        callback(err,null, null, null);
                } else {
                        if (rows.length > 0) {
                                callback(null, rows[0].l1, rows[0].l2, rows[0].l3);
                        };
                };
        });
};

function applyLedStatus(token) {
        fetchLedStatus(token, function(err, l0, l1, l2) {
                if (err) {
                        console.log(err);
                } else {
                        led0.writeSync(l0);
                        led1.writeSync(l1);
                        led2.writeSync(l2);
                }
        });
};                        
