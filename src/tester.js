const Database = require('./database')
const moment = require('moment')

async function populateDB() {
    const db = await new Database();

  //  console.log( await db.getUsersinTourn("test"));
   // var tournaments = await db.allTourn();
    console.log(moment("2022-04-28"))//.isAfter(moment()));
    
}
populateDB();