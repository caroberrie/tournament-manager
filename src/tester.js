const Database = require('./database')


async function populateDB() {
    const db = await new Database();
    await db.addUser("Caroline", "dwadwaubu", "123")

}
populateDB();