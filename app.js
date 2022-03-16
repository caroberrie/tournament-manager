var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');
const fs = require('fs');
const Database = require('./src/database.js');
const e = require('express');
const { request } = require('http');
const { response } = require('express');
const { stringify } = require('querystring');

const router = express.Router();

var app = express();
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

////////////////////////////////
//gets
////////////////////////////////

app.get('/', function(request, response) {
    response.render('login.ejs', {
        error: null
    });
});


app.get('/home', function(request, response) {


    if (request.session.loggedin) {
        response.render("home.ejs", {
            status: "Welcome " + request.session.username
        });

    } else {
        response.send("you need to be signed in to see this page");
    }
});


app.get('/account', function(request, response) {
    if (request.session.loggedin) {
        const db = new Database();
        async function account() {
            try {

                var obj = await db.getUser(request.session.username);




                response.render('account.ejs', {
                    win: obj[1].win,
                    loss: obj[1].loss,
                    user: obj[1].user,
                    ongoingTournament: obj[1].ongoingTournament
                });
            } catch (e) {
                response.render(errorpage);
            }
        }
        account();

    } else {
        response.send("you need to be signed in to see this page");
    }
});

//register no
app.get('/register', function(request, response) {
    response.render('registration.ejs', {
        error: null
    });

});


app.get('/tournamentregister', function(request, response) {
    if (request.session.loggedin) {
        response.render('tournamentregister.ejs', {
            error: null
        });
    } else {
        response.send("you need to be signed in to see this page");

    }
});


app.get("/allTournaments", function(request, response) {
    if (request.session.loggedin) {
        var id = request.query.id;

        console.log(id);
        async function allT() {
            const db = new Database();
            var tournaments = await db.allTourn();
            //for (tournaments.time > Date.now()){ 
            //now do tournament.time to make new obj containing proper ones to display 
            //};
            //add time verfication from tournaments
            if (id == null) {
                response.render("allTournaments.ejs", {
                    error: null,
                    tournaments: tournaments
                });
                response.end();
            }

            if (id != null) {
                //need to check if user is already registered if so display an error at top of page and reload
                if (await db.checkUserInTournament(request.session.username, id) == 0) {
                    await db.addusertotournament(request.session.username, id);
                    await db.addTournToUser(id, request.session.username);
                    response.render("home.ejs", {
                        status: "Thank you for registering to " + id
                    });
                } else {
                    response.render("allTournaments.ejs", {
                        error: "You are already registered to that tournament!",
                        tournaments: tournaments
                    });

                }
                //response.render('home.ejs')
                response.end();
                return;
            }
        }
        if (request.session.loggedin) {
            allT();
        } else
            response.send('Please login to view this page!');
        //start of code to show all avaliable tournaments
        //we need database code to back this up 
        //need ejs to display out to user.

    } else {
        response.send('Please login to view this page!');
    }
});



// get for account page about 
app.get("/account/About", function(request, response) {
    if (request.session.loggedin) {
        response.render("about.ejs", {

        });
    } else {
        response.send('Please login to view this page!');
    }
});

app.get("/account/yourTournaments", function(request, response) {
    if (request.session.loggedin) {
        response.render("yourTournaments.ejs", {

        });
    } else {
        response.send('Please login to view this page!');
    }
});
app.get("/account/registeredTournament", function(request, response) {
    async function goh(){
    if (request.session.loggedin) {
        const db = new Database();
        var val = await db.getUser(request.session.username);
        //console.log(val[1].registeredToo[0]);
        //once the hit the href we need to go that id tournament and grabs that tournaments info such as registered user and get scores things of that nature 
        //on this page tho we should probably display relavent info such as registrered to and what not that makes the most sense
        //such as start time comment things of that nature
        //needs date validation like everything does lol

        response.render("registeredTournament.ejs", {
            tournaments: val[1].registeredToo,
            error: null

        });
    } else {
        response.send('Please login to view this page!');
    }
    }
    goh();
});

app.get("/signout", function(request, response) {
    request.session.loggedin = false;
    response.render("login.ejs", {
        error: null
    })
});
////////////////////////////////
//posts
////////////////////////////////


app.post('/auth', function(request, response) {
    //need login code
    //async login code please
    var user = request.body.username;
    var pass = request.body.password;

    request.session.username = user;

    async function login() {
        const db = await new Database();
        if (await db.login(user.toString().toLowerCase(), pass)) {
            request.session.loggedin = true;
            response.redirect('/home');

        } else {
            response.render('login.ejs', {
                error: "Password or username is incorrect"
            });
        }
    }
    login();
});

app.post('/register', function(request, response) {
    response.redirect('/register');
});

app.post('/login', function(request, response) {


    response.render('login.ejs', {
        error: null
    });
});


//code for registration
app.post('/registerUser', function(request, response) {
    try {
        var user = request.body.usernameRegistration;
        var passOne = request.body.passwordFirst;
        var passTwo = request.body.passwordSecond;
        console.log(user, passOne, passTwo);

        async function registration() {
            const db = await new Database();


            //if duplicate username
            //need to make names lower becuase user names are not case sensitive in db
            if (await db.checkUser(user.toLowerCase())) {
                response.render('registration.ejs', {
                    error: "Username Exists"
                });
            } else if (passOne != passTwo) {
                //if passwords dont match 
                response.render('registration.ejs', {
                    error: "Passwords do not match"
                });
            } else {
                //send user to login page upon succesful registration
                await db.addUser(user.toString().toLowerCase(), passOne, null);

                response.render('login.ejs', {
                    error: null
                });
            }
        }
        //database calls need to be done async
        registration();
    } catch (e) {
        response.status(404).render('/errorpage.ejs')

        console.log("something went wrong")

    } finally {
        //response.end();
    }
});

//post for tournament registration
app.post('/registerTournament', function(request, response) {
    try {

        //need verificaiton to see if tournment exists before we go to to register a new one
        //append creation time and date onto name
        //need to check if user has active already
        async function registration() {
            //all from user input post request
            var tName = request.body.tournamentName;
            var type = request.body.type;
            var format = request.body.format;
            var style = request.body.style;
            var location = request.body.location;
            var end = request.body.end;
            var start = request.body.start;

            //need to grab username in a different wat
            var username = request.session.username;

            const db = await new Database();

            db.tournamentadd(tName, type, format, style, location, username, start, end);
        }
        //database calls need to be done async
        registration();
    } catch (e) {
        response.status(404).render('/errorpage.ejs')

        console.log("something went wrong")

    } finally {
        //response.end();
        response.render("home.ejs", {
            status: "Thank you for registering the tournament!"
        });
    }
});



//wep bage setup stuff
//not https
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.set('views', path.join(__dirname, '/src/views'));
app.set('view engine', 'ejs');
app.use("/", router);
app.listen(3000, () => console.log(" go to http://localhost:3000"));
app.use(express.static("public"));