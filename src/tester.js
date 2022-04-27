const Database = require('./database')


async function populateDB() {
    const db = await new Database();

  //  console.log( await db.getUsersinTourn("test"));
   // var tournaments = await db.allTourn();
    console.log(moment("2022-10-22").isBefore("2022-10-23"));
    
}
populateDB();