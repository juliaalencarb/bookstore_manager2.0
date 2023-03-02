const cors = require("cors");
const express = require("express");
const logger = require("./logger.js")
const app = express();
const db1 = require("./database.js")
const md5 = require("md5")
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: false })); // middleware that will parse req.body
app.use(bodyParser.json());
// example: name=test&email=test%40example.com&password=test123
// will be parse to js obj: {name:'test', email: 'test@example.com', password: 'test123'}
app.use(logger);
app.use(cors());
app.use(express.json());

app.get("/", (req, res, next) => {
    res.send("Books Manager")
})

app.get("/api/books", (req, res, next) => {
    const sql = "SELECT * FROM books"
    const params = []
    db1.all(sql, params, (err, rows) => {
        if (err) {
            res.status(400).json({"error":err.message});
            return;
        }
        res.json({
            "message": "sucess",
            "data": rows
        })
    })
})

app.get("/api/books/:id", (req, res, next) => {
    const sql = "SELECT * FROM books WHERE id = ?"
    const params = [req.params.id]
    db1.get(sql, params, (err, row) => {
        if (err) {
            res.status(400).json({"error":err.message});
            return;
        }
        res.json({
            "message": "success",
            "data": row
        })
    })
})

app.post("/api/book/", (req, res, next) => {
    let errors = [];
    if (!req.body.id || !req.body.title || !req.body.author || !req.body.quantity) {
        errors.push("Please provide all book details.");
    }
    if (errors.length) {
        res.status(400).json({"error":errors[0]});
        return;
    }
    const data = {
        id: req.body.id,
        title: req.body.title,
        author: req.body.author,
        quantity: req.body.quantity
    }
    const sql = "INSERT INTO books (id, title, author, quantity) VALUES (?,?,?,?)"
    const params = [data.id, data.title, data.author, data.quantity]

    db1.run(sql, params, function (err, result) { // using classic notation instead of array notation so the this object is available (it isn't when we use arrow declaration)
        if (err) {
            res.status(400).json({"error":err.message})
            return;
        }
        res.json({
            "message": "success",
            "data": data,
            "id": this.lastID
        })
    })
})

app.patch("/api/book/:id", (req, res, next) => {
    const data = {
        title: req.body.title,
        author: req.body.author,
        quantity: req.body.quantity
    }
    // COALESCE function keeps the current value if none is provided
    db1.run(
        `UPDATE books SET
        title = COALESCE(?,title),
        author = COALESCE(?,author),
        quantity = COALESCE(?,quantity)
        WHERE id = ?`,
    [data.title, data.author, data.quantity, req.params.id],
    function (err, result) {
        if (err) {
            res.status(400).json({"error": res.message})
            return;
        }
        res.json({
            message: "success",
            data: data,
            changes: this.changes // again I used the classic function declaration to have access to this.changes (number of rows changed)
        })
    });
})


app.delete("/api/book/:id", (req, res, next) => {
    db1.run(
        "DELETE FROM books WHERE id = ?",
        [req.params.id],
        function (err, result) {
            if (err) {
                res.status(400).json({"error": res.message})
                return;
            }
            res.json({"message": "deleted", changes: this.changes})
        });
})


module.exports = app;