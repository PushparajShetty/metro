import mysql from 'mysql'
const  conn=mysql.createConnection({

    host:"localhost",
    user:"root",
    password:"12345",
    database:"my_sql"
})

conn.connect(function(err){

    if (err){
        console.log(err)

    }else{
        console.log("connected to sql")
    }
})
export default conn;