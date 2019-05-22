'use strict';
//////////////////////////////////
var ipAdresse =
    '192.168.1.21'
// '51.83.71.226' 
// 'localhost'
;

////////////mongo/////////////////////////
const MongoClient = require('mongodb');
// const url = 'mongodb+srv://dbSaloum:dbSaloumpsw@gettingstarted-qdagb.mongodb.net/test';
const url = 'mongodb://localhost:27017';
const dbName = 'backend';

////////////////express////////////////////////// 
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

//////session 
const session = require('express-session');
app.use(session({
    secret: '123456789SECRET',
    saveUninitialized: false,
    resave: false
}));

/////variable///////////
var histoPartie;
var users = {};
var connectionsLimite = 2;
var nbJoueur = false;
var point = false;
////////////////////
app.set('view engine', 'pug')
app.use('/js', express.static(__dirname + '/src/js'));
app.use('/css', express.static(__dirname + '/src/css'));
app.use('/img', express.static(__dirname + '/src/img'));
app.get('/', function (req, res, next) {
    res.sendFile(__dirname + '/index.html');
});

//////////la page resultats
app.get('/pug', function (req, res) {
    MongoClient.connect(url, {
        useNewUrlParser: true
    }, function (err, client) {
        const db = client.db(dbName);
        const collection = db.collection('resultat');

        collection.find().toArray(function (err, data) {
            histoPartie = data;
            client.close();
            res.render('lesScores', {
                title: 'Titre de la page',
                message: histoPartie
            });
        });
    });

});


///////////socket.io ///////////
/////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////


io.on('connection', function (socket) {

    // limite a 2 clients
    if (io.engine.clientsCount > connectionsLimite) {
        socket.emit('complet', {
            message: 'attendez , partie en cours '
        });
        return
    };
    var me = false;

    console.log('new user ');
    for (var i in users) {
        socket.emit('new', users[i]);
    };
    socket.on('inscription', function (message) {

        MongoClient.connect(url, {
            useNewUrlParser: true
        }, function (err, client) {
            const db = client.db(dbName);
            const collection = db.collection('inscrit');

            collection.find({
                    pseudo: message.pseudo,
                })
                .toArray(function (err, data) {

                    if (data.length > 0) {
                        socket.emit('dejaPris', )

                    } else {
                        collection.insertOne(message);
                        me = message;
                        me.id = message.pseudo;
                        me.score = 0;
                        me.nbJoueur = nbJoueur;

                        ///connection ok
                        if (io.engine.clientsCount < 2) {
                            socket.emit('attente', {
                                message: 'attente de joueur '
                            });
                            users[me.id] = me;
                            io.emit('new', me);
                            return
                        } else {
                            if (io.engine.clientsCount === 2) {
                                if (nbJoueur) {
                                    io.emit('new',
                                        me
                                    );
                                    socket.emit('logged');
                                    users[me.id] = me;
                                } else {
                                    io.emit('new',
                                        me
                                    );
                                    socket.emit('attente', {
                                        me
                                    });
                                    users[me.id] = me;
                                    nbJoueur = true;
                                }
                            }
                        };

                    }
                    client.close();
                });
        });
    });

    /////////////connection///////:   
    socket.on('formConnect', function (message) {
        MongoClient.connect(url, {
            useNewUrlParser: true
        }, function (err, client) {
            const db = client.db(dbName);
            const collection = db.collection('inscrit');

            collection.find({
                    pseudo: message.pseudo
                })
                .toArray(function (err, data) {
                    if (data.length > 0) {
                        if (data[0].psw === message.psw) {
                            me = message;
                            me.id = message.pseudo;
                            me.score = 0;
                            me.nbJoueur = nbJoueur;

                            ///connection ok
                            if (io.engine.clientsCount < 2) {
                                socket.emit('attente', {
                                    message: 'attente de joueur '
                                });
                                users[me.id] = me;
                                io.emit('new', me);
                                return
                            } else {

                                if (io.engine.clientsCount === 2) {
                                    if (nbJoueur) {
                                        io.emit('new',
                                            me
                                        );

                                        socket.emit('logged');
                                        users[me.id] = me;

                                    } else {

                                        io.emit('new',
                                            me
                                        );

                                        socket.emit('attente', {
                                            me
                                        });

                                        users[me.id] = me;
                                        nbJoueur = true;
                                    }
                                }
                            };

                        } else {

                            // 'mdp nok'
                            socket.emit('incorrect', {
                                message: 'mot de passe incorrect.'
                            })
                        }
                    } else {
                        // console.log('mdp nok')
                        socket.emit('incorrect', {
                            message: 'pseudo ou mot de passe incorrect.'
                        })
                    }

                    client.close();
                });
        });
    });

    ////////////envoi position////////////////// 
    socket.on('unMouvement', function (message) {

        me.score += 1;

        //////fin de partie /////////
        if (me.score === 1) {
            io.emit('score', {
                info: me,
            });

            io.emit('perdu', {
                vainqueur: me,
                participants: users
            });

            // demandeResultats au vainqueur
            socket.emit('demandeResultats');

        } else {

            io.emit('score', {
                info: me,
            });

            io.emit('positionPourTousLeMonde', {
                x: message.x,
                y: message.y,
            });
        };
    });

    // recuperation du resultat final data.resultatFinal
    socket.on('resultatFinal', function (data) {

        MongoClient.connect(url, {
            useNewUrlParser: true
        }, function (err, client) {
            const db = client.db(dbName);
            const collection = db.collection('resultat');

            collection.insertOne({
                historique: data.resultatFinal
            });
        });
    });
    /////////////////////////////
    socket.on('disconnect', function () {
        if (!me) {
            return false;
        };
        if (nbJoueur) {
            io.emit('deconnectionUser', me);
            nbJoueur = false;

        }
        delete users[me.id];
        socket.disconnect();

    })
});


http.listen(80, function () {
    console.log('écoute http 80')
});