import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";

const typeDefs = `
    type User{
    id:!ID
    name:String
    email:String
    }
    type Query{
    user:[User]
    }
`

const resolver = {
    Query: {
        users: () => users,
    },

}

const server = new ApolloServer({
    typeDefs,
    resolver,
})

const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
})

console.log(`server ready at ${url}`);
