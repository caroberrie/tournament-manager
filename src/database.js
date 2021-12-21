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

    async addUser(username, password, association) {
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
                association: association,

            }

            let res = await collection.insertOne(query);


        } catch (err) {

            console.log(err);
        } finally {

            client.close();

        }


    }
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
}
module.exports = Database;