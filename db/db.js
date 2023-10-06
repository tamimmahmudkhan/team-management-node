const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('db/inventory.sqlite', sqlite3.OPEN_READWRITE, (err) =>{
    if(err){
        console.log(err.message);
    }
}) 

module.exports = db