var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');
const fs = require('fs');
const Database = require('./src/database.js');

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
    response.render('login.ejs');
});


app.get('/home', function(request, response) {
    response.render('home.ejs');
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
    response.redirect('/home');
});

app.post('/register', function(request, response) {
    response.redirect('/register');
});

app.post('/login', function(request, response) {
    response.render('login.ejs');
});


//code for registration
app.post('/registerUser', function(request, response) {
    try {
        user = request.body.usernameRegistration;
        passOne = request.body.passwordFirst;
        passTwo = request.body.passwordSecond;
        console.log(user, passOne, passTwo);

        async function registration() {
            const db = await new Database();

            console.log(await db.checkUser(user))
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
                await db.addUser(user, passOne, null);
                console.log("register");
                response.render('login.ejs');
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