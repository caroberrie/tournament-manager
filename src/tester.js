const Database = require('./database')
const moment = require('moment')

async function populateDB() {
    const db = await new Database();
    var tournaments = await db.allTourn();
    console.log(moment("2022-10-22").isBefore("2022-10-23"));
    
}
populateDB();