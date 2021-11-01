# Node + GraphQL + SQLite

## _DATABASE_
Create an SQLite database: ./prisma/db.sqlite
```sh
CREATE TABLE author (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name text NOT NULL
);

CREATE TABLE book (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name text NOT NULL,
    author_id INT NOT NULL
);

INSERT INTO author (id, name) VALUES 
(1, "J. K. Rowling"),
(2, "J. R. R. Tolkien"),
(3, "Brent Weeks");

INSERT INTO book (name, author_id) VALUES
("Harry Potter and the Chamber of Secrets", 1),
("Harry Potter and the Prisoner of Azkaban", 1),
("Harry Potter and the Goblet of Fire", 1),
("The Fellowship of the Ring", 2),
("The Two Towers", 2),
("The Return of the King", 2),
("The Way of Shadows", 3),
("Beyond the Shadows", 3);
```
## _INIT PRISMA_
```sh
npm install --include=dev
touch .env && echo "DATABASE_URL="file:./db.sqlite"" > .env
npx prisma generate
```

## _RUN_

```sh
npm run devStart
```

Then go to http://localhost:3000


## _TODO_

- ~~Update data~~
- ~~Delete data~~
- ~~Prisma ORM~~
- Order data
- ~~Pagination~~
- ~~Pagination in subfields~~
- Refactor in different files
- Authentication with permissions
