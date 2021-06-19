const { ApolloServer } = require('apollo-server');
const gql = require('graphql-tag');
const mongoose = require('mongoose');

const { MONGODB } = require('./config');
const typeDefs = require('./graphql/typeDefs');
const resolvers = require('./graphql/resolvers');

const Post = require('./models/Post');
const User = require('./models/User');

const server = new ApolloServer({
    typeDefs: typeDefs,
    resolvers: resolvers
});

mongoose.connect(MONGODB, { useNewUrlParser: true }, { useUnifiedTopology: true })
    .then(() => {
    return server.listen({port: 5000});
}).then((res) => {
    console.log(`Server running at ${res.url}`)
});

