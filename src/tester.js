const Database = require('./database')


async function populateDB() {
    const db = await new Database();
    await db.tournamentadd("Caroline", "dwadwaubu", "123")

}
populateDB();