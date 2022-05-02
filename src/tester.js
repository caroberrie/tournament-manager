const Database = require('./database')
const moment = require('moment')

async function populateDB() {
    const db = await new Database();

    console.log(await db.getUsersinTourn("New Tourn"))

    db.updateRecord("user5",5,5);
   
//
    
  }
 //   console.log(members[1].listtoplay[0]);
    

populateDB();