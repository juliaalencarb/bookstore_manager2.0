const sqlite3 = require("sqlite3").verbose();
const md5 = require("md5");

const DBSOURCE = "db.sqlite"

let db = new sqlite3.Database(DBSOURCE, (err) => {
    if (err) {
        console.error(err.message)
        throw err
    }
    else {
        console.log("Connected to the SQLite database.")
        db.run(`CREATE TABLE books (
            id INTEGER PRIMARY KEY,
            title text,
            author text,
            quantity INTEGER
        )`,
        (err) => {
            if (err) {
                console.log("Table already exists.")
            }
            else {
                console.log("Table created.")
                const insert = "INSERT INTO books (id, title, author, quantity) VALUES (?,?,?,?)"
                db.run(insert,
                    [3001, "A Tale of Two Cities", "Charles Dickens", 30])
                db.run(insert,
                    [3002, "Harry Potter and the Philosopher's Stone", "J. K. Rowling", 40])
            }
        })
    }
});

module.exports = db
