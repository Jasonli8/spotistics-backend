const mysql = require("mysql")

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASS
})

db.connect( err => {
    if (err) {
        console.log(err.message)
        return
    }
    console.log("Connected to database...")
})