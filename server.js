const express = require('express')
const expressGraphQL = require('express-graphql').graphqlHTTP
const db = require('./database.js')

const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLInt,
    GraphQLNonNull,
    GraphQLBoolean,
} = require('graphql')

const app = express()

const BookType = new GraphQLObjectType({
    name: 'Book',
    description: 'This represents a book written by an author',
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLInt) },
        name: { type: GraphQLNonNull(GraphQLString) },
        authorId: { type: GraphQLNonNull(GraphQLInt) },
        author: {
            type: AuthorType,
            resolve: (book) => {
                return new Promise((resolve, reject) => {
                    db.get("SELECT * FROM author WHERE id = ?;", [book.author_id], (err, row) => {
                        if(err) {
                            reject(null)
                        }

                        resolve(row)
                    })
                })
            }
        }
    })
})

const AuthorType = new GraphQLObjectType({
    name: 'Author',
    description: 'This represents an author of a book',
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLInt) },
        name: { type: GraphQLNonNull(GraphQLString) },
        books: { 
            type: GraphQLList(BookType),
            resolve: (author) => {
                return new Promise((resolve, reject) => {
                    db.all("SELECT * FROM book WHERE author_id = ?;", [author.id], (err, rows) => {
                        if(err) {
                            reject([])
                        }

                        resolve(rows)
                    })
                })
            }
        }
    })
})

const DeleteType = new GraphQLObjectType({
    name: 'DeleteType',
    description: 'This represents a delete',
    fields: () => ({
        ok: { type: GraphQLBoolean }
    })
})

const RootQueryType = new GraphQLObjectType({
    name: 'Query',
    description: 'Root Query',
    fields: () => ({
        books: {
            type: new GraphQLList(BookType),
            description: 'List of Books',
            resolve: () => {
                return new Promise((resolve, reject) => {
                    db.all("SELECT * FROM book;", (err, rows) => {
                        if(err) {
                            reject([])
                        }

                        resolve(rows)
                    })
                })
            }
        },
        book: {
            type: BookType,
            description: 'Single Book',
            args: {
                id: { type: GraphQLInt }
            },
            resolve: (parent, args) => {
                return new Promise((resolve, reject) => {
                    let sql = "SELECT * FROM book WHERE id = ?"
                    let params = [args.id]
                    db.get(sql, params, (err, row) => {
                        if(err) {
                            reject(null)
                        }

                        resolve(row)
                    })
                })
            }
        },
        authors: {
            type: new GraphQLList(AuthorType),
            description: 'List of authors',
            resolve: () => {
                return new Promise((resolve, reject) => {
                    db.all("SELECT * FROM author;", (err, rows) => {
                        if (err) {
                            reject([]);
                        }
                        resolve(rows);
                    });
                });
            }
        },
        author: {
            type: AuthorType,
            description: 'Single Author',
            args: {
                id: { type: GraphQLInt }
            },
            resolve: (parent, args) => {
                return new Promise((resolve, reject) => {
                    let sql = "SELECT * FROM author WHERE id = ?"
                    let params = [args.id]
                    db.get(sql, params, (err, row) => {
                        if(err) {
                            reject(null)
                        }

                        resolve(row)
                    })
                })
            }
        },
    })
})

const RootMutationType = new GraphQLObjectType({
    name: 'Mutuation',
    description: 'Root Mutuation',
    fields: () => ({
        addBook: {
            type: BookType,
            description: 'Add a book',
            args: {
                name: { type: GraphQLNonNull(GraphQLString) },
                authorId: { type: GraphQLNonNull(GraphQLInt) }
            },
            resolve: (parent, args) => {
                return new Promise((resolve, reject) => {
                    const book = {
                        name: args.name,
                        authorId: args.authorId
                    }
    
                    db.run("INSERT INTO book (name, author_id) VALUES (?,?)", [book.name, book.authorId], function(err) {
                        book.id = this.lastID
                        resolve(book)
                    })
                })
            }
        },
        addAuthor: {
            type: AuthorType,
            description: 'Add an author',
            args: {
                name: { type: GraphQLNonNull(GraphQLString) }
            },
            resolve: (parent, args) => {
                return new Promise((resolve, reject) => {
                    const author = {
                        name: args.name
                    }

                    db.run("INSERT INTO author (name) VALUES (?)", [author.name], function(err) {
                        author.id = this.lastID
                        resolve(author)
                    })
                })
            }
        },
        deleteBook: {
            type: DeleteType,
            description: 'Delete a book',
            args: {
                id: { type: GraphQLNonNull(GraphQLInt) }
            },
            resolve: (parent, args) => {
                return new Promise((resolve, reject) => {
                    db.run("DELETE FROM book WHERE id = ?", [args.id], function(err) {
                        if(err === null) {
                            resolve({'ok': true})
                        } 

                        resolve({'ok': false})
                    })
                })
            }
        },
        deleteAuthor: {
            type: DeleteType,
            description: 'Delete an author',
            args: {
                id: { type: GraphQLNonNull(GraphQLInt) }
            },
            resolve: (parent, args) => {
                return new Promise((resolve, reject) => {
                    db.run("DELETE FROM author WHERE id = ?", [args.id], function(err) {
                        if(err === null) {
                            resolve({'ok': true})
                        } 

                        resolve({'ok': false})
                    })
                })
            }
        }
    })
})

const schema = new GraphQLSchema({
    query: RootQueryType,
    mutation: RootMutationType
})


app.use('/graphql', expressGraphQL({
    schema: schema,
    graphiql: true
}))

app.listen(3000, () => {
    console.log('Server is running')
})