require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@apollo/server/express4");
const { makeExecutableSchema } = require("graphql-tools");
const { applyMiddleware } = require("graphql-middleware");

const Resolvers = require("./src/graphql/Resolvers");
const TypeDefs = require("./src/graphql/TypeDefs");
const { permissions } = require("./src/graphql/permissions");
const { verifyTokenAndGetUser } = require("./src/helper/token");

const schema = makeExecutableSchema({
  typeDefs: TypeDefs.GetTypeDef(),
  resolvers: Resolvers.Getresolvers(),
});

const schemaWithMiddleware = applyMiddleware(schema, permissions);

const context = async ({ req, res }) => {
  const authHeader = req.headers.authorization || "";
  let user = null;

  if (authHeader) {
    const token = authHeader.replace("Bearer ", "");
    user = await verifyTokenAndGetUser(token);
  }
  return { user };
};

async function startServer() {
  const app = express();

  const server = new ApolloServer({
    schema: schemaWithMiddleware,
    // typeDefs: TypeDefs.GetTypeDef(),
    // resolvers: Resolvers.Getresolvers(),
    context,
    introspection: true,
  });

  await server.start();

  // Express middleware stack
  app.use(cors());
  app.use(express.json());
  app.use(
    "/graphql",
    expressMiddleware(server, {
      context,
    })
  );

  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () =>
    console.log(`Server ready at http://localhost:${PORT}/graphql`)
  );
}

startServer();
