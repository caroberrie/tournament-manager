var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');
const fs = require('fs');
const Database = require('./src/database.js');
const e = require('express');

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
    response.render('home.ejs');
});

app.get('/account', function(request,response){
    response.render('account.ejs');
});



//register no
app.get('/register', function(request, response) {
    response.render('registration.ejs', {
        error: null
    });
});

////////////////////////////////
//posts
////////////////////////////////

app.post('/auth', function(request, response) {
    //need login code
    //async login code please
    var user = request.body.username;
    var pass = request.body.password;
    async function login() {
        const db = await new Database();
        if (await db.login(user.toString().toLowerCase(), pass)) { response.redirect('/home'); } else {
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
            if (await db.checkUser(user)) {
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
                    error: "Password or username is incorrect"
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



//wep bage setup stuff
//not https
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.set('views', path.join(__dirname, '/src/views'));
app.set('view engine', 'ejs');
app.use("/", router);
app.listen(3000, () => console.log(" go to http://localhost:3000"));
app.use(express.static("public"));