//const mysql=require("mysql");
/*var mysqlConnection=mysql.createConnection({
    host:"us-cdbr-east-05.cleardb.net",
    user:"b0a181e6ecfc2f",
    password:"40ccff5c",
    database:"heroku_039c8207704a2f0"
});
*/
//var mysqlConnection=mysql.createConnection("mysql://b0a181e6ecfc2f:40ccff5c@us-cdbr-east-05.cleardb.net/heroku_039c8207704a2f0?reconnect=true"
//);

//mysqlConnection.connect();

require('dotenv').config()




module.exports={
    CLEARDB_DATABASE_URL:process.env.CLEARDB_DATABASE_URL
};
