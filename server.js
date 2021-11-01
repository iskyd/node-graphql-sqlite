const express = require('express')
const expressGraphQL = require('express-graphql').graphqlHTTP

const {
    GraphQLSchema,
} = require('graphql')

const {
    RootMutationType,
    RootQueryType
} = require('./types')

const app = express()

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