'use strict';
////////////mongo/////////////////////////
const MongoClient = require('mongodb');
const url = 'mongodb+srv://dbSaloum:dbSaloumpsw@gettingstarted-qdagb.mongodb.net/test';
const dbName = 'backend';
////////////////express//////////////////////////
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);


app.set('view engine', 'pug')
app.use('/js', express.static(__dirname + '/src/js'))
app.use('/css', express.static(__dirname + '/src/css'))
app.use('/img', express.static(__dirname + '/src/img'))

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html')
});
app.get('/carre', function (req, res) {
    res.sendFile(__dirname + '/exemple5.html')
});
app.get('/jeu', function (req, res) {
    res.render('formulaire.pug')
});
///////////socket.io///////////
io.on('connection', function (socket) {
    console.log('connection a socket io');
    socket.on('inscription', function (message) {
        console.log(' message.pseudo');
        MongoClient.connect(url, {
            useNewUrlParser: true
        }, function (err, client) {
            const db = client.db(dbName);
            const collection = db.collection('inscrit');
            //////////////////////////           
            collection.find({
                    pseudo: message.pseudo,
                    psw: message.psw
                })
                .toArray(function (err, data) {
                    console.log(data.length + 'data');
                    console.log(message.pseudo + ' 1');
                    if (data.length > 0) {
                        console.log(data[0].pseudo + ' deja pris ' + data.length + ' fois');
                        socket.emit('badUser', 'psw erroné ou use r deja pris !')
                    } else {
                        collection.insertOne(message);
                        console.log('insertion ok');
                    }
                    client.close();
                });
        });
    });
    //////////////////////    
    socket.on('formConnect', function (message) {
        console.log(' message.pseudo');
        MongoClient.connect(url, {
            useNewUrlParser: true
        }, function (err, client) {
            const db = client.db(dbName);
            const collection = db.collection('inscrit');
            //////////////////////////           
            collection.find({
                    pseudo: message.pseudo
                })
                .toArray(function (err, data) {
                    console.log(data.length + 'data');
                    console.log(message.pseudo + ' 1');
                    if (data.length > 0) {
                        console.log(data[0].pseudo + ' deja pris ' + data.length + ' fois');
                    } else {
                        collection.insertOne(message);
                        console.log('insertion ok');
                    }
                    client.close();
                });
        });
    });
    ////////////////////////:

    /////////////////////////////
    socket.on('disconnect', function () {
        console.log('user is déconnected');
    })
});


http.listen(80, function () {
    console.log('écoute http 80')
});