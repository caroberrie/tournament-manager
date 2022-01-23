const config = require('./dev');
const pwManage = require('./passwordmanager')
const MongoClient = require('mongodb').MongoClient;
const fs = require('fs');
//includes above

//need to create trigger in mongoDB for this collection 
//push the user to the DB with unprotected password and user 
//migrate that later possibly require email to setup with an email push like a nomral website
//look at google SMTP as a possible option for email verificaiton

//add user 

class Database {
    constructor() {}

    async addUser(username, password) {
        const client = await MongoClient.connect(config.DB_URI, { useNewUrlParser: true })
            .catch(err => { console.log(err); });

        if (!client) {
            return;
        }

        try {

            const db = client.db("Capstone");

            let collection = db.collection('users');


            const pw = await new pwManage();

            var passHex = await pw.passSet(password);

            let query = {
                username: username,
                password: passHex,
                registeredToo: null,

            }

            let res = await collection.insertOne(query);


        } catch (err) {

            console.log(err);
        } finally {

            client.close();

        }


    }

    //checks to see if user exists for login registering a user
    async checkUser(username) {
        const client = await MongoClient.connect(config.DB_URI, { useNewUrlParser: true })
            .catch(err => { console.log(err); });

        if (!client) {
            return;
        }

        try {

            const db = client.db("Capstone");

            let collection = db.collection('users');

            let query = {
                username: username,
            }

            let res = await collection.countDocuments(query);

            console.log("user checked")

            client.close();
            return res;

        } catch (err) {

            console.log(err);
        } finally {

            client.close();

        }
    }

    //login code need to go passwordmanage to test and salt password
    async login(user, password) {
        const client = await MongoClient.connect(config.DB_URI, { useNewUrlParser: true })
            .catch(err => { console.log(err); });

        var passBool

        if (!client) {
            return;
        }

        try {

            const pw = await new pwManage();

            const db = client.db("Capstone");

            let collection = db.collection('users');

            let query = { username: user }

            let res = await collection.findOne(query);

            passBool = await pw.validPassword(password, res.password)

        } catch (err) {
            passBool = false;
        } finally {
            client.close();
            return passBool;
        }
    }

    async tournamentadd(name, type, format, style, location, owner, start, end) {
        const client = await MongoClient.connect(config.DB_URI, { useNewUrlParser: true })
            .catch(err => { console.log(err); });



        if (!client) {
            return;
        }

        try {

            const db = client.db("Capstone");

            let collection = db.collection('tournaments');
            
            db.createCollection(name);


            let query = { 
                name: name,
                type: type,
            format: format,
            style: style,
            location: location,
            owner: owner,
            start: start,
            end: end }

            let res = await collection.insertOne(query);

     
        } finally {
            client.close();
          
        }
    }

  
    
    async addusertotournament(username, tournament){
        const client = await MongoClient.connect(config.DB_URI, { useNewUrlParser: true })
            .catch(err => { console.log(err); });



        if (!client) {
            return;
        }

        try {

            const db = client.db("Capstone");

            let collection = db.collection(tournament);

            //lets set defualt values to what we will need 
            // need an array of users they wll play
            //win / loss / draw 
            //who they play next 
            //list of who to play
            let query = {
                username: username,
                wins: null,
                loss: null,
                draw: null,
                playnext: null,
                listtoplay: null,
            }

            let res = await collection.insertOne(username);

            

     
        } finally {
            client.close();
          
        }
    }
    }

module.exports = Database;