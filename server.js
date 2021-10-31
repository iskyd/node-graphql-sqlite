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

const RootQueryType = new GraphQLObjectType({
    name: 'Query',
    description: 'Root Query',
    fields: () => ({
        books: {
            type: new GraphQLList(BookType),
            description: 'List of Books',
            resolve: () => {
                return prisma.book.findMany()
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
            type: new GraphQLList(AuthorType),
            description: 'List of authors',
            resolve: () => {
                return prisma.author.findMany()
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