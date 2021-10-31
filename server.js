const express = require('express')
const expressGraphQL = require('express-graphql').graphqlHTTP
const Prisma = require('prisma/prisma-client');
const prisma = new Prisma.PrismaClient();

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
                return prisma.author.findUnique({
                    where: {
                        id: book.author_id
                    }
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
                return prisma.book.findMany({
                    where: {
                        author_id: author.id
                    }
                })
            }
        }
    })
})

const PageInfo = new GraphQLObjectType({
    name: 'PageInfo',
    fields: () => ({
        hasNextPage: { type: GraphQLBoolean },
        startCursor: { type: GraphQLString },
        endCursor: { type: GraphQLString }
    })
})

const BookEdge = new GraphQLObjectType({
    name: 'BookEdge',
    fields: () => ({
        node: { type: BookType },
        cursor: { type: GraphQLString },
    })
})

const BookConnection = new GraphQLObjectType({
    name: 'BookConnection',
    fields: () => ({
        edges: { type: new GraphQLList(BookEdge) },
        pageInfo: { type: PageInfo }
    })
});

const AuthorEdge = new GraphQLObjectType({
    name: 'AuthorEdge',
    fields: () => ({
        node: { type: AuthorType },
        cursor: { type: GraphQLString },
    })
})

const AuthorConnection = new GraphQLObjectType({
    name: 'AuthorConnection',
    fields: () => ({
        edges: { type: new GraphQLList(AuthorEdge) },
        pageInfo: { type: PageInfo }
    })
});

const RootQueryType = new GraphQLObjectType({
    name: 'Query',
    description: 'Root Query',
    fields: () => ({
        books: {
            type: BookConnection,
            description: 'List of Books',
            args: {
                first: { type: GraphQLInt, defaultValue: 10 },
                after: { type: GraphQLString, defaultValue: "Y3Vyc29yXzA=" }
            },
            resolve: (parent, args) => {
                return new Promise((resolve, reject) => {
                    const lastId = parseInt(Buffer.from(args.after, 'base64').toString('utf-8').split("_")[1])
                    
                    prisma.book.findMany({
                        where: {
                            id: {
                                gt: lastId
                            }
                        },
                        take: args.first
                    }).then((books) => {
                        if(books.length === 0) {
                            resolve({
                                edges: [],
                                pageInfo: {}
                            })
                        }

                        prisma.book.count({
                            where: {
                                id: {
                                    gt: lastId
                                }
                            }
                        }).then((nodesLeft) => {
                            const result = { 
                                edges: books.map(book => {
                                    return {
                                        cursor: Buffer.from("cursor_" + book.id).toString('base64'),
                                        node: book
                                    }
                                }),
                                pageInfo: {
                                    hasNextPage: nodesLeft > args.first,
                                    startCursor: args.after,
                                    endCursor: nodesLeft > args.first ? Buffer.from("cursor_" + books[books.length - 1].id).toString('base64') : null
                                }
                            }
                            
                            resolve(result)
                        })
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
                return prisma.book.findUnique({
                    where: {
                        id: args.id
                    }
                })
            }
        },
        authors: {
            type: AuthorConnection,
            description: 'List of authors',
            args: {
                first: { type: GraphQLInt, defaultValue: 10 },
                after: { type: GraphQLString, defaultValue: "Y3Vyc29yXzA=" }
            },
            resolve: (parent, args) => {
                return new Promise((resolve, reject) => {
                    const lastId = parseInt(Buffer.from(args.after, 'base64').toString('utf-8').split("_")[1])
                    
                    prisma.author.findMany({
                        where: {
                            id: {
                                gt: lastId
                            }
                        },
                        take: args.first
                    }).then((authors) => {
                        if(authors.length === 0) {
                            resolve({
                                edges: [],
                                pageInfo: {}
                            })
                        }

                        prisma.author.count({
                            where: {
                                id: {
                                    gt: lastId
                                }
                            }
                        }).then((nodesLeft) => {
                            const result = { 
                                edges: authors.map(author => {
                                    return {
                                        cursor: Buffer.from("cursor_" + author.id).toString('base64'),
                                        node: author
                                    }
                                }),
                                pageInfo: {
                                    hasNextPage: nodesLeft > args.first,
                                    startCursor: args.after,
                                    endCursor: Buffer.from("cursor_" + authors[authors.length - 1].id).toString('base64')
                                }
                            }
                            
                            resolve(result)
                        })
                    })
                })
            }
        },
        author: {
            type: AuthorType,
            description: 'Single Author',
            args: {
                id: { type: GraphQLInt }
            },
            resolve: (parent, args) => {
                return prisma.author.findUnique({
                    where: {
                        id: args.id
                    }
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
                const book = prisma.book.create({ data: { name: args.name, author_id: args.authorId } })
                return book
            }
        },
        addAuthor: {
            type: AuthorType,
            description: 'Add an author',
            args: {
                name: { type: GraphQLNonNull(GraphQLString) }
            },
            resolve: (parent, args) => {
                const author = prisma.author.create({ data: { name: args.name } })
                return author
            }
        },
        deleteBook: {
            type: BookType,
            description: 'Delete a book',
            args: {
                id: { type: GraphQLNonNull(GraphQLInt) }
            },
            resolve: (parent, args) => {
                const book = prisma.book.delete({ where: { id: args.id } })

                return book
            }
        },
        deleteAuthor: {
            type: AuthorType,
            description: 'Delete an author',
            args: {
                id: { type: GraphQLNonNull(GraphQLInt) }
            },
            resolve: (parent, args) => {
                const author = prisma.author.delete({ where: { id: args.id } })

                return author
            }
        },
        updateBook: {
            type: BookType,
            description: 'Update a book',
            args: {
                id: { type: GraphQLNonNull(GraphQLInt) },
                name: { type: GraphQLNonNull(GraphQLString) },
                authorId: { type: GraphQLNonNull(GraphQLInt) }
            },
            resolve: (parent, args) => {
                const updateBook = prisma.book.update({
                    where: {
                      id: args.id,
                    },
                    data: {
                      name: args.name,
                      author_id: args.authorId
                    },
                })

                return updateBook
            }
        },
        updateAuthor: {
            type: AuthorType,
            description: 'Update an author',
            args: {
                id: { type: GraphQLNonNull(GraphQLInt) },
                name: { type: GraphQLNonNull(GraphQLString) }
            },
            resolve: (parent, args) => {
                const updateAuthor = prisma.author.update({
                    where: {
                      id: args.id,
                    },
                    data: {
                      name: args.name
                    },
                })

                return updateAuthor
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