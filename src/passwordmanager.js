//manager for passwords for database
// crypto module

const bcrypt = require("bcrypt");

//password stuff
//work via magic of cryptography
//swapping to be bcrypt node default crypto kind of a mess


saltRounds = 10;

class pwManage {
    constructor() {}
    async passSet(password) {

        var hex;
        await bcrypt.hash(password, saltRounds).then(function(hash) {
            hex = hash;

        });
        return hex;
    };

    //password validation.
    async validPassword(password, hash) {
        var val;
        await bcrypt.compare(password, hash).then(function(result) {
            val = result;

        });
        return val;
    };


}
module.exports = pwManage;