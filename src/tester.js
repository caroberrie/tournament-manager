const Database = require('./database')
const moment = require('moment')

async function populateDB() {
    const db = await new Database();
    console.log(moment().format('LTS'));
    
}
populateDB();