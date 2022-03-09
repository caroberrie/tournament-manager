const Database = require('./database')


async function populateDB() {
    const db = await new Database();
    await db.addUser("math", "math2")
    console.log(await db.login("math", "math2"));

}
populateDB();