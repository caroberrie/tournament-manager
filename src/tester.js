const Database = require('./database')


async function populateDB() {
    const db = await new Database();
    await db.addusertotournament("wwww", "Hi");

}
populateDB();