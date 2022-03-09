const config = require('./dev');
const pwManage = require('./passwordmanager')
const MongoClient = require('mongodb').MongoClient;
const fs = require('fs');
const bcrypt = require("bcrypt");
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


            saltRounds = 10;
            const db = client.db("Capstone");

            let collection = db.collection('users');


            const pw = await new pwManage();
            let passHex = await pw.passSet(password);




            let query = {
                username: username,
                password: passHex,
                registeredToo: [],
                win: 0,
                loss: 0,
                ongoingTournament: false
            }

            let res = await collection.insertOne(query);


        } catch (err) {

            console.log(err);
        } finally {

            client.close();

        }




    }

    //get all of user info for any operations we may need to do later
    async getUser(username) {
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

                let res = await collection.findOne(query);

                var obj = [{}];


                //do the time verificaiton in servrr file
                obj.push({
                    user: res.username,
                    registeredToo: res.registeredToo,
                    win: res.win,
                    loss: res.loss,

                    ongoingTournament: res.ongoingTournament
                });

                console.log(obj[1].user);

            } catch (err) {

                console.log(err);
            } finally {

                client.close();
                return obj;
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



        } catch (err) {

            console.log(err);
        } finally {

            client.close();

        }
    }

    async checkUserInTournament(username, tournament) {
            const client = await MongoClient.connect(config.DB_URI, { useNewUrlParser: true })
                .catch(err => { console.log(err); });

            if (!client) {
                return;
            }

            try {

                const db = client.db("Capstone");

                let collection = db.collection(tournament);

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

            let query = {
                username: user,
            }

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
                end: end
            }

            let res = await collection.insertOne(query);


        } finally {
            client.close();

        }
    }




    async addusertotournament(username, tournament) {
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

            let res = await collection.insertOne(query);




        } finally {
            client.close();

        }
    }
    async allTourn(time) {

            const client = await MongoClient.connect(config.DB_URI, { useNewUrlParser: true })
                .catch(err => { console.log(err); });

            if (!client) {
                return;
            }

            try {
                const db = client.db("Capstone");



                let collection = db.collection('tournaments');

                var obj = [{}];

                for await (const doc of collection.find()) {
                    //do the time verificaiton in servrr file
                    obj.push({
                        name: doc.name,
                        type: doc.type,
                        format: doc.format,
                        style: doc.style,
                        location: doc.location,
                        owner: doc.owner,
                        time: doc.start
                    });
                    //buildstring = "Name: " + doc.name + " Location: " + doc.location + "\n" + buildstring;
                    // Prints documents one at a time
                }

            } catch (err) {

                console.log(err);
            } finally {

                client.close();
                //console.log(buildstring); //test to see if string is made right
                return obj;
            }
        }
        //adds a tourn to a user so the user can see what they are registered too
        //need a good seperator maybe swap to an array? if mongo allows that 
    async addTournToUser(tourn, user) {
        const client = await MongoClient.connect(config.DB_URI, { useNewUrlParser: true })
            .catch(err => { console.log(err); });

        if (!client) {
            return;
        }

        try {
            const db = client.db("Capstone");

            let collection = db.collection('users');

            let query = { username: user }

            // let res = await collection.findOne(query);

            //append to end of array in documents using push
            //allows us to use an array of all registered to currently
            //will use valid time to check if the user can see them allows to keep a lot running list of what thye have been registered to in the past

            let res = await collection.updateOne(query, { $push: { registeredToo: tourn } });

        } catch (err) {

            console.log(err);
        } finally {

            client.close();

            //console.log(buildstring); //test to see if string is made right

        }

    }
}



module.exports = Database;