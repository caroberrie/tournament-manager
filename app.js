var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');
const fs = require('fs');

const router = express.Router();

var app = express();
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

app.get('/', function(request, response) {
    response.render('login.ejs');
});


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.set('views', path.join(__dirname, '/src/views'));
app.set('view engine', 'ejs');
app.use("/", router);
app.listen(3000, () => console.log(" go to http://localhost:3000"));
app.use(express.static("public"));