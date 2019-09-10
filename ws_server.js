var http = require('http');
var path = require('path');
var https = require('https');
var express = require('express'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    request = require('request');
var nedb = require('nedb');
var expressNedbRest = require('express-nedb-rest');
var email = require('nodemailer');
var ssh = require('node-ssh');

//    multer = require('multer'),
//    restful = require('node-restful'),
var app = express();

var router = express.Router();

var restApi = expressNedbRest();

//var config = require('read-config')(path.join(__dirname, '/config.json'));

var powershell = require('node-powershell');

var server;


//var tk = require("db2sock-itoolkit");


//var pool;

class ws_server {



    constructor() {


        /*
ps.addCommand('Import-Module ".\\pwrshell\\MyHttpListener\\HttpListener.psd1" -Force')
    .then(function() {
        return ps.invoke();
    })
    .then(function(output) {
        console.log(output);
        // ps.dispose();
        ps.addCommand('.\\pwrshell\\starthttp_8888.ps1')
            .then(function() {
                return ps.invoke();
            })
            .then(function(output) {
                console.log(output);
                ps.dispose();
            })
            .catch(function(err) {
                console.log(err);
                ps.dispose();
            });


    })
    .catch(function(err) {
        console.log(err);
        ps.dispose();
    });
*/
        //var core = new tk.Core('http://10.21.0.200/db2json.db2');

        // Create a command call, and add it to the core
        //var cmd = core.command('DSPSYSSTS');
        //core.add(cmd);

        // Run the core's current call list, and get the results
        //var result = core.run(function(result) {
        //     console.log('Results:');
        //    console.log(result);
        //});



        app.set('superSecret', 'eclipses');

        //app.use(morgan('dev'));
        app.use(bodyParser.urlencoded({
            'extended': 'true'
        }));
        app.use(bodyParser.json());
        app.use(bodyParser.json({
            'type': 'application/vnd.api+json'
        }));
        app.use(bodyParser.json({
            'limit': '50mb'
        }));
        app.use(bodyParser.text({
            'limit': '50mb'
        }));
        app.use(bodyParser.raw({
            'limit': '50mb'
        }));
        app.use(bodyParser.urlencoded({
            'limit': '50mb',
            'extended': 'true'
        }));
        app.use(bodyParser.text({
            'type': 'application/text-enriched',
            'limit': '50mb'
        }));
        app.use(methodOverride());





        app.all('/*', function(req, res, next) {
            // CORS headers
            res.header("Access-Control-Allow-Origin", "*"); // restrict it to the required domain
            res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
            // Set custom headers for CORS
            res.header('Access-Control-Allow-Headers', 'Content-type,Accept');
            // If someone calls with method OPTIONS, let's display the allowed methods on our API
            if (req.method == 'OPTIONS') {
                res.status(200);
                res.write("Allow: GET,PUT,POST,DELETE,OPTIONS");
                res.end();
            } else {
                next();
            }
        });








        //app.use('/web/', express.static(__dirname + '/www/'));

        app.use('/api/v1', router);


        // create  NEDB datastore
        var consoledb = new nedb({
            filename: "console.db",
            autoload: true
        });

        // create rest api router and connect it to datastore

        restApi.addDatastore('console', consoledb);

        app.use('/api/v1/db', restApi);

        /*app.post("/gaiashop/upload", multer({ dest: "./gaiashop/uploads/" }).single('file'), function(req, res) {
            res.send(req.files);
        });
        */

        // test route to make sure everything is working (accessed at GET http://localhost:8080/api)
        router.get('/', function(req, res) {
            res.json({
                success: true,
                message: 'Herve de CHAVIGNY! welcome to your api!'
            });
        });




        /* router.get('/gaiashop/paniers_test', function(req, res) {


             res.json([{
                     "name": "Gourmandise",
                     "picname": "gourmandise",
                     "desc": "",
                     "prix": "3.99"
                 },
                 {
                     "name": "Gourmandise 2",
                     "picname": "gourmandise2",
                     "desc": "",
                     "prix": "3.99"
                 },
                 {
                     "name": "Gourmandise 3",
                     "picname": "gourmandise3",
                     "desc": "",
                     "prix": "3.99"
                 },
                 {
                     "name": "Gourmandise 4",
                     "picname": "gourmandise4",
                     "desc": "",
                     "prix": "3.99"
                 },
                 {
                     "name": "Gourmandise 5",
                     "picname": "gourmandise5",
                     "desc": "",
                     "prix": "3.99"
                 }
             ]);

         });
         */

        router.post('/mail', function(req, res, next) {
            var mailto = req.body.mailto;
            var mailfrom = req.body.mailfrom;
            var subject = req.body.subject;
            var text = req.body.text;
            var html = req.body.html;
            var smtpConfig = {
                /*host: 'smtp.gmail.com',
                port: 465,
                secure: true,
                tls: {
                    // do not fail on invalid certs
                    rejectUnauthorized: false
                },*/
                service: 'gmail',
                auth: {
                    user: 'vevedh@gmail.com',
                    pass: 'd@nZel77'
                }
            };
            var transporter = email.createTransport(smtpConfig);
            // setup email data with unicode symbols
            var mailOptions = {
                from: mailfrom, // sender address
                to: mailto, // list of receivers
                subject: subject, // Subject line
                text: text, // plain text body
                html: html // html body
            };
            transporter.sendMail(mailOptions, function(err, info) {
                if (err) {
                    console.log(err);
                    res.json({
                        error: err,
                        format: "?mailto=mailto&mailfrom=from&subject=untest&text=test&html=text"
                    });
                } else {
                    console.log('Super! Email Envoyé');
                    res.json({
                        succes: 'Email envoyé'
                    });
                }
            });
            transporter.close();
        });


        router.post('/pwrh/', function(req, res, next) {

            let ps = new powershell({
                executionPolicy: 'Bypass',
                noProfile: true
            });

            ps.addCommand(path.join(__dirname, './resources/electron/pwrsh/Convert-CredToJson.ps1'), []);
            ps.invoke()
                .then(output => {
                    console.log(output)
                        // Set the global Variable
                    remote.getGlobal('sharedObj').cred = JSON.parse(output)
                        // Read the global variable
                    console.log(remote.getGlobal('sharedObj').cred)
                })
                .catch(err => {
                    console.dir(err);
                    ps.dispose();
                });

        });


        router.get('/ad/:guid', function(req, res, next) {
            var ps = new powershell({
                executionPolicy: 'Bypass',
                debugMsg: true,
                noProfile: true
            });
            ps.addCommand('.\\pwrsh\\infuser.ps1', [{
                name: 'guid',
                value: req.params.guid
            }])
            ps.invoke().then(output => {
                console.log(req.params.guid)
                res.end(output);
            })
        });

        router.post('/adauth', function(req, res, next) {
            var username = req.body.username;
            var password = req.body.password;
            request({
                url: "http://3hservices.hhhgd.com/Amfphp/?contentType=application/json",
                method: "POST",
                header: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    'serviceName': 'vvproxy_tests',
                    'methodName': 'adldapTest',
                    'parameters': [username, password]
                })

            }, function(error, response, body) {

                res.json(body);
            });

        });

        router.post('/printers', function(req, res, next) {
            var imp = req.body.imprimante;
            var impquery = '';
            if (String(imp).length >= 10) {
                impquery = String(imp).substr(0, 9) + '*';
            } else {
                impquery = String(imp).replace('*', '') + '*';
            }
            request({
                url: "http://3hservices.hhhgd.com/Amfphp/?contentType=application/json",
                method: "POST",
                header: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    'serviceName': 'vvproxy_tests',
                    'methodName': 'lstOutqArr',
                    'parameters': [impquery]
                })

            }, function(error, response, body) {

                res.json(JSON.parse(body));
            });
        });


        router.post('/glpimail', function(req, res, next) {
            request({
                url: "http://3hservices.hhhgd.com/Amfphp/?contentType=application/json",
                method: "POST",
                header: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    'serviceName': 'vvproxy_tests',
                    'methodName': 'getMailSupport',
                    'parameters': []
                })

            }, function(error, response, body) {

                res.json(JSON.parse(body));
            });
        });


        router.post('/cajour', function(req, res, next) {
            var ensnom = req.body.enseigne;
            var annee = req.body.annee;
            var mois = req.body.mois;
            var jour = req.body.jour;
            request({
                url: "http://3hservices.hhhgd.com/Amfphp/?contentType=application/json",
                method: "POST",
                header: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    'serviceName': 'vvproxy_tests',
                    'methodName': 'ork_ca',
                    'parameters': [ensnom, annee, mois, jour]
                })

            }, function(error, response, body) {

                res.json(JSON.parse(body));
            });
        });



        router.post('/caevomois', function(req, res, next) {
            var ensnom = req.body.enseigne;
            request({
                url: "http://3hservices.hhhgd.com/Amfphp/?contentType=application/json",
                method: "POST",
                header: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    'serviceName': 'vvproxy_tests',
                    'methodName': 'ork_ca_evo_mois',
                    'parameters': [ensnom]
                })

            }, function(error, response, body) {

                res.json(JSON.parse(body));
            });
        });


        router.post('/rstedtmsgw', function(req, res, next) {
            request({
                url: "http://3hservices.hhhgd.com/Amfphp/?contentType=application/json",
                method: "POST",
                header: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    'serviceName': 'vvproxy_tests',
                    'methodName': 'autoEdtMsgw',
                    'parameters': []
                })

            }, function(error, response, body) {

                res.json(JSON.parse(body));
            });
        });


        router.post('/ipimp', function(req, res, next) {
            var imp = req.body.imprimante;
            request({
                url: "http://3hservices.hhhgd.com/Amfphp/?contentType=application/json",
                method: "POST",
                header: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    'serviceName': 'vvproxy_tests',
                    'methodName': 'getIpImp',
                    'parameters': [imp]
                })

            }, function(error, response, body) {

                res.json(JSON.parse(body));
            });
        });


        router.post('/dblquser', function(req, res, next) {
            var user = req.body.user;
            request({
                url: "http://3hservices.hhhgd.com/Amfphp/?contentType=application/json",
                method: "POST",
                header: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    'serviceName': 'vvproxy_tests',
                    'methodName': 'debloqUser',
                    'parameters': [user]
                })

            }, function(error, response, body) {

                res.json(JSON.parse(body));
            });
        });


        router.post('/dblqecomax', function(req, res, next) {
            //var user = req.body.user;
            request({
                url: "http://3hservices.hhhgd.com/Amfphp/?contentType=application/json",
                method: "POST",
                header: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    'serviceName': 'vvproxy_tests',
                    'methodName': 'debloqEcomax',
                    'parameters': []
                })

            }, function(error, response, body) {

                res.json(JSON.parse(body));
            });
        });



        router.post('/dblqdev', function(req, res, next) {
            var dev = req.body.device;
            request({
                url: "http://3hservices.hhhgd.com/Amfphp/?contentType=application/json",
                method: "POST",
                header: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    'serviceName': 'vvproxy_tests',
                    'methodName': 'debloqDevice',
                    'parameters': [dev]
                })

            }, function(error, response, body) {

                res.json(JSON.parse(body));
            });
        });


        router.post('/chkIp', function(req, res, next) {
            var ipval = req.body.ipval;
            request({
                url: "http://3hservices.hhhgd.com/Amfphp/?contentType=application/json",
                method: "POST",
                header: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    'serviceName': 'vvproxy_tests',
                    'methodName': 'chkIp',
                    'parameters': [ipval]
                })

            }, function(error, response, body) {

                res.json(JSON.parse(body));
            });
        });



        router.post('/startedt', function(req, res, next) {
            var imp = req.body.imprimante;
            request({
                url: "http://3hservices.hhhgd.com/Amfphp/?contentType=application/json",
                method: "POST",
                header: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    'serviceName': 'vvproxy_tests',
                    'methodName': 'startEditeur',
                    'parameters': [imp]
                })

            }, function(error, response, body) {

                res.json(JSON.parse(body));
            });
        });



        router.post('/stopedt', function(req, res, next) {
            var imp = req.body.imprimante;
            request({
                url: "http://3hservices.hhhgd.com/Amfphp/?contentType=application/json",
                method: "POST",
                header: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    'serviceName': 'vvproxy_tests',
                    'methodName': 'stopEditeur',
                    'parameters': [imp]
                })

            }, function(error, response, body) {

                res.json(JSON.parse(body));
            });
        });


        router.post('/infmag', function(req, res, next) {
            var num = req.body.num;
            request({
                url: "http://3hservices.hhhgd.com/Amfphp/?contentType=application/json",
                method: "POST",
                header: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    'serviceName': 'vvproxy_tests',
                    'methodName': 'query_AS400JSON',
                    'parameters': ["select * from vvbase/vvinfmag where NUMMAG='" + num + "' "]
                })

            }, function(error, response, body) {

                res.json(JSON.parse(body));
            });
        });


        router.post('/initmag', function(req, res, next) {
            var nummag = req.body.num;
            var ipcaisse = req.body.ipcaisse;
            request({
                url: "http://3hservices.hhhgd.com/Amfphp/?contentType=application/json",
                method: "POST",
                header: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    'serviceName': 'vvproxy_tests',
                    'methodName': 'query_update',
                    'parameters': ["insert into vvbase/vvinfmag (nummag,ipork) values ('" + nummag + "','" + ipcaisse + "')"]
                })

            }, function(error, response, body) {

                res.json(JSON.parse(body));
            });
        });


        router.post('/infmag', function(req, res, next) {
            var nummag = req.body.num;
            var chp = req.body.champ;
            var valdata = req.body.valdata;
            request({
                url: "http://3hservices.hhhgd.com/Amfphp/?contentType=application/json",
                method: "POST",
                header: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    'serviceName': 'vvproxy_tests',
                    'methodName': 'query_update',
                    'parameters': ["update  vvbase/vvinfmag  set " + chp + "='" + valdata + "' where nummag='" + nummag + "'"]
                })

            }, function(error, response, body) {

                res.json(JSON.parse(body));
            });
        });


        router.post('/orknbcai', function(req, res, next) {
            var ipm = req.body.ipmagasin;
            request({
                url: "http://3hservices.hhhgd.com/Amfphp/?contentType=application/json",
                method: "POST",
                header: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    'serviceName': 'vvproxy_tests',
                    'methodName': 'testnbcaisses',
                    'parameters': [ipm]
                })

            }, function(error, response, body) {

                res.json(JSON.parse(body));
            });
        });


        router.post('/orkcaisse', function(req, res, next) {
            var ipm = req.body.ipmagasin;
            var cnum = req.body.numcaisse;
            request({
                url: "http://3hservices.hhhgd.com/Amfphp/?contentType=application/json",
                method: "POST",
                header: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    'serviceName': 'vvproxy_tests',
                    'methodName': 'testorkaisse',
                    'parameters': [ipm, '1', cnum]
                })

            }, function(error, response, body) {

                res.json(JSON.parse(body));
            });
        });


        router.post('/orksrv', function(req, res, next) {
            var ipm = req.body.ipmagasin;
            var cnum = req.body.numcaisse;
            request({
                url: "http://3hservices.hhhgd.com/Amfphp/?contentType=application/json",
                method: "POST",
                header: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    'serviceName': 'vvproxy_tests',
                    'methodName': 'testorkaisse',
                    'parameters': [ipm, '2', cnum]
                })

            }, function(error, response, body) {

                res.json(JSON.parse(body));
            });
        });


        router.post('/orkatos', function(req, res, next) {
            var ipm = req.body.ipmagasin;
            var cnum = req.body.numcaisse;
            request({
                url: "http://3hservices.hhhgd.com/Amfphp/?contentType=application/json",
                method: "POST",
                header: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    'serviceName': 'vvproxy_tests',
                    'methodName': 'testorkaisse',
                    'parameters': [ipm, '3', cnum]
                })

            }, function(error, response, body) {

                res.json(JSON.parse(body));
            });
        });


        router.post('/orktpe', function(req, res, next) {
            var ipm = req.body.ipmagasin;
            var cnum = req.body.numcaisse;
            request({
                url: "http://3hservices.hhhgd.com/Amfphp/?contentType=application/json",
                method: "POST",
                header: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    'serviceName': 'vvproxy_tests',
                    'methodName': 'testorkaisse',
                    'parameters': [ipm, '4', cnum]
                })

            }, function(error, response, body) {

                res.json(JSON.parse(body));
            });
        });


        router.post('/orktpedblq', function(req, res, next) {
            var ipm = req.body.ipmagasin;
            var cnum = req.body.numcaisse;
            request({
                url: "http://3hservices.hhhgd.com/Amfphp/?contentType=application/json",
                method: "POST",
                header: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    'serviceName': 'vvproxy_tests',
                    'methodName': 'testorkaisse',
                    'parameters': [ipm, '5', cnum]
                })

            }, function(error, response, body) {

                res.json(JSON.parse(body));
            });
        });


        router.post('/magbyens', function(req, res, next) {
            var ens = req.body.enseigne;
            request({
                url: "http://3hservices.hhhgd.com/Amfphp/?contentType=application/json",
                method: "POST",
                header: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    'serviceName': 'vvproxy_tests',
                    'methodName': 'query_AS400JSON',
                    'parameters': ["select * from vvbase/vvmobmagip where ENSNOM like '" + ens + "%' "]
                })

            }, function(error, response, body) {

                res.json(JSON.parse(body));
            });
        });



        router.post('/adusr/infos', function(req, res, next) {
            var username = req.body.username;
            var user = "3HSERVICES\\thsdche";
            var pass = "d@nZel77";
            var auth = "Basic " + new Buffer(user + ":" + pass).toString("base64");
            //var auth = 'Basic ' + new Buffer("3HSERVICES\thsdche:d@nZel77").toString('base64');
            console.log("Autorization", auth);
            var hd = {
                "Authorization": auth
            };
            // authorization: 'Basic M0hTRVJWSUNFU1x0aHNkY2hlOmRAblplbDc3'
            // Basic M0hTRVJWSUNFUwloc2RjaGU6ZEBuWmVsNzc=
            // 'Authorization': 'Basic ' + new Buffer(uname + ':' + pword).toString('base64')
            var options = {
                method: 'POST',
                url: 'http://localhost:8888/',
                qs: {
                    command: 'GET-ADUSER  ' + username + ' -properties * '
                },
                headers: hd
            };

            request(options, function(error, response, body) {
                //if (error) throw new Error(error);
                res.json(JSON.parse(body));
            });
        });




        router.post('/adusr/grpmember', function(req, res, next) {
            var username = req.body.username;
            var user = "3HSERVICES\\thsdche";
            var pass = "d@nZel77";
            var auth = "Basic " + new Buffer(user + ":" + pass).toString("base64");
            //var auth = 'Basic ' + new Buffer("3HSERVICES\thsdche:d@nZel77").toString('base64');
            console.log("Autorization", auth);
            var hd = {
                "Authorization": auth
            };
            // authorization: 'Basic M0hTRVJWSUNFU1x0aHNkY2hlOmRAblplbDc3'
            // Basic M0hTRVJWSUNFUwloc2RjaGU6ZEBuWmVsNzc=
            // 'Authorization': 'Basic ' + new Buffer(uname + ':' + pword).toString('base64')
            var options = {
                method: 'POST',
                url: 'http://localhost:8888/',
                qs: {
                    command: 'GET-ADUSER  ' + username + ' -properties MemberOf| Select-Object MemberOf'
                },
                headers: hd
            };

            request(options, function(error, response, body) {
                //if (error) throw new Error(error);
                res.json(JSON.parse(body));
            });
        });

        router.post('/adshare', function(req, res, next) {
            var computername = req.body.computername;
            var user = "3HSERVICES\\thsdche";
            var pass = "d@nZel77";
            var auth = "Basic " + new Buffer(user + ":" + pass).toString("base64");
            //var auth = 'Basic ' + new Buffer("3HSERVICES\thsdche:d@nZel77").toString('base64');
            console.log("Autorization", auth);
            var hd = {
                "Authorization": auth
            };
            // authorization: 'Basic M0hTRVJWSUNFU1x0aHNkY2hlOmRAblplbDc3'
            // Basic M0hTRVJWSUNFUwloc2RjaGU6ZEBuWmVsNzc=
            // 'Authorization': 'Basic ' + new Buffer(uname + ':' + pword).toString('base64')
            var options = {
                method: 'POST',
                url: 'http://localhost:8888/',
                qs: {
                    command: 'Get-WmiObject -Class Win32_Share -ComputerName ' + computername + "|Select-Object Name, Path"
                },
                headers: hd
            };

            request(options, function(error, response, body) {
                //if (error) throw new Error(error);
                res.json(JSON.parse(body));
            });
        });



        router.post('/adusroff', function(req, res, next) {
            var nbweek = req.body.nbweek;
            var user = "3HSERVICES\\thsdche";
            var pass = "d@nZel77";
            var auth = "Basic " + new Buffer(user + ":" + pass).toString("base64");
            //var auth = 'Basic ' + new Buffer("3HSERVICES\thsdche:d@nZel77").toString('base64');
            console.log("Autorization", auth);
            var hd = {
                "Authorization": auth
            };
            // authorization: 'Basic M0hTRVJWSUNFU1x0aHNkY2hlOmRAblplbDc3'
            // Basic M0hTRVJWSUNFUwloc2RjaGU6ZEBuWmVsNzc=
            // 'Authorization': 'Basic ' + new Buffer(uname + ':' + pword).toString('base64')
            var options = {
                method: 'POST',
                url: 'http://localhost:8888/',
                qs: {
                    command: 'DSQuery user -inactive ' + nbweek
                },
                headers: hd
            };

            request(options, function(error, response, body) {
                //if (error) throw new Error(error);
                res.json(JSON.parse(body));
            });
        });


        router.post('/adcpoff', function(req, res, next) {
            var nbweek = req.body.nbweek;
            var user = "3HSERVICES\\thsdche";
            var pass = "d@nZel77";
            var auth = "Basic " + new Buffer(user + ":" + pass).toString("base64");
            //var auth = 'Basic ' + new Buffer("3HSERVICES\thsdche:d@nZel77").toString('base64');
            console.log("Autorization", auth);
            var hd = {
                "Authorization": auth
            };
            // authorization: 'Basic M0hTRVJWSUNFU1x0aHNkY2hlOmRAblplbDc3'
            // Basic M0hTRVJWSUNFUwloc2RjaGU6ZEBuWmVsNzc=
            // 'Authorization': 'Basic ' + new Buffer(uname + ':' + pword).toString('base64')
            var options = {
                method: 'POST',
                url: 'http://localhost:8888/',
                qs: {
                    command: 'DSQuery Computer -inactive ' + nbweek
                },
                headers: hd
            };

            request(options, function(error, response, body) {
                //if (error) throw new Error(error);
                res.json(JSON.parse(body));
            });
        });


        router.post('/adusrdisabled', function(req, res, next) {
            var user = "3HSERVICES\\thsdche";
            var pass = "d@nZel77";
            var auth = "Basic " + new Buffer(user + ":" + pass).toString("base64");
            //var auth = 'Basic ' + new Buffer("3HSERVICES\thsdche:d@nZel77").toString('base64');
            console.log("Autorization", auth);
            var hd = {
                "Authorization": auth
            };
            // authorization: 'Basic M0hTRVJWSUNFU1x0aHNkY2hlOmRAblplbDc3'
            // Basic M0hTRVJWSUNFUwloc2RjaGU6ZEBuWmVsNzc=
            // 'Authorization': 'Basic ' + new Buffer(uname + ':' + pword).toString('base64')
            var options = {
                method: 'POST',
                url: 'http://localhost:8888/',
                qs: {
                    command: 'Search-ADAccount -AccountDisabled -UsersOnly | Select-Object SamAccountName'
                },
                headers: hd
            };

            request(options, function(error, response, body) {
                //if (error) throw new Error(error);
                res.json(JSON.parse(body));
            });
        });


        router.post('/adusrenable', function(req, res, next) {
            var username = req.body.username;
            var user = "3HSERVICES\\thsdche";
            var pass = "d@nZel77";
            var auth = "Basic " + new Buffer(user + ":" + pass).toString("base64");
            //var auth = 'Basic ' + new Buffer("3HSERVICES\thsdche:d@nZel77").toString('base64');
            console.log("Autorization", auth);
            var hd = {
                "Authorization": auth
            };
            // authorization: 'Basic M0hTRVJWSUNFU1x0aHNkY2hlOmRAblplbDc3'
            // Basic M0hTRVJWSUNFUwloc2RjaGU6ZEBuWmVsNzc=
            // 'Authorization': 'Basic ' + new Buffer(uname + ':' + pword).toString('base64')
            var options = {
                method: 'POST',
                url: 'http://localhost:8888/',
                qs: {
                    command: 'Enable-ADAccount -Identity ' + username
                },
                headers: hd
            };

            request(options, function(error, response, body) {
                //if (error) throw new Error(error);
                res.json(JSON.parse(body));
            });
        });



        router.post('/adusrunlock', function(req, res, next) {
            var username = req.body.username;
            var user = "3HSERVICES\\thsdche";
            var pass = "d@nZel77";
            var auth = "Basic " + new Buffer(user + ":" + pass).toString("base64");
            //var auth = 'Basic ' + new Buffer("3HSERVICES\thsdche:d@nZel77").toString('base64');
            console.log("Autorization", auth);
            var hd = {
                "Authorization": auth
            };
            // authorization: 'Basic M0hTRVJWSUNFU1x0aHNkY2hlOmRAblplbDc3'
            // Basic M0hTRVJWSUNFUwloc2RjaGU6ZEBuWmVsNzc=
            // 'Authorization': 'Basic ' + new Buffer(uname + ':' + pword).toString('base64')
            var options = {
                method: 'POST',
                url: 'http://localhost:8888/',
                qs: {
                    command: 'Unlock-ADAccount -Identity ' + username
                },
                headers: hd
            };

            request(options, function(error, response, body) {
                //if (error) throw new Error(error);
                res.json(JSON.parse(body));
            });
        });



        router.post('/adusrdisable', function(req, res, next) {
            var username = req.body.username;
            var user = "3HSERVICES\\thsdche";
            var pass = "d@nZel77";
            var auth = "Basic " + new Buffer(user + ":" + pass).toString("base64");
            //var auth = 'Basic ' + new Buffer("3HSERVICES\thsdche:d@nZel77").toString('base64');
            console.log("Autorization", auth);
            var hd = {
                "Authorization": auth
            };
            // authorization: 'Basic M0hTRVJWSUNFU1x0aHNkY2hlOmRAblplbDc3'
            // Basic M0hTRVJWSUNFUwloc2RjaGU6ZEBuWmVsNzc=
            // 'Authorization': 'Basic ' + new Buffer(uname + ':' + pword).toString('base64')
            var options = {
                method: 'POST',
                url: 'http://localhost:8888/',
                qs: {
                    command: 'Disable-ADAccount -Identity ' + username
                },
                headers: hd
            };

            request(options, function(error, response, body) {
                //if (error) throw new Error(error);
                res.json(JSON.parse(body));
            });
        });


        router.get('/phonegap', function(req, res) {
            var options = {
                method: 'GET',
                url: 'https://build.phonegap.com/api/v1/me?auth_token=kKeKAxVug4C2ggQ9PzKB'
            };

            request(options, function(error, response, body) {
                //if (error) throw new Error(error);
                res.json(JSON.parse(body));
            });
        });


        router.get('/phonegap/app', function(req, res) {
            var options = {
                method: 'GET',
                url: 'https://build.phonegap.com/api/v1/apps?auth_token=kKeKAxVug4C2ggQ9PzKB'
            };

            request(options, function(error, response, body) {
                //if (error) throw new Error(error);
                res.json(JSON.parse(body));
            });
        });


        router.post('/signup', function(req, res, next) {
            console.log("enregistrement sans authentification");

            console.log("Table User:", req.method);
            var newuser = new Users({
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                username: req.body.username,
                email: req.body.email,
                password: req.body.password,
                role: req.body.role
            });

            newuser.save(function(err, data) {
                if (err) {
                    res.json({
                        success: false,
                        message: err
                    })

                } else {
                    res.json({
                        success: true,
                        message: data
                    });

                }

            })
        });

    }

    runServer(port) {
        // initWs();
        server = http.createServer(app).listen(port);
        console.log(`Serveur API Restful Herve de CHAVIGNY en ecoute sur le port ${port}!`);
    }

    stopServer() {
        server.close();
    }

}



module.exports = ws_server
