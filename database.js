const sqlite3 = require('sqlite3').verbose()

const DBSOURCE = "db.sqlite"

let db = new sqlite3.Database(DBSOURCE, (err) => {
    if (err) {
        // Cannot open database
        console.error(err.message)
        throw err
    } else {
        console.log('Connected to the SQLite database.')
        db.run(`CREATE TABLE author (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name text NOT NULL
            )`,
            (err) => {
                if (err) {
                    // Table already created
                } else {
                    // Table just created, creating some rows
                    let insert = 'INSERT INTO author (id, name) VALUES (?, ?)'
                    db.run(insert, [1, "J. K. Rowling"])
                    db.run(insert, [2, "J. R. R. Tolkien"])
                    db.run(insert, [3, "Brent Weeks"])
                }
            });

        db.run(`CREATE TABLE book (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name text NOT NULL,
            author_id INT NOT NULL
        )`,
        (err) => {
            if (err) {
                // Table alredy created
            } else {
                let insert = 'INSERT INTO book (name, author_id) VALUES (?, ?)'

                db.run(insert, ["Harry Potter and the Chamber of Secrets", 1])
                db.run(insert, ["Harry Potter and the Prisoner of Azkaban", 1])
                db.run(insert, ["Harry Potter and the Goblet of Fire", 1])
                db.run(insert, ["The Fellowship of the Ring", 2])
                db.run(insert, ["The Two Towers", 2])
                db.run(insert, ["The Return of the King", 2])
                db.run(insert, ["The Way of Shadows", 3])
                db.run(insert, ["Beyond the Shadows", 3])
            }
        })
    }
});


module.exports = db