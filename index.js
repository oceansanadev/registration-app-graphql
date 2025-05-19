require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@apollo/server/express4");
const { makeExecutableSchema } = require("@graphql-tools/schema");
const { applyMiddleware } = require("graphql-middleware");

const Resolvers = require("./src/graphql/Resolvers");
const TypeDefs = require("./src/graphql/TypeDefs");
const { permissions } = require("./src/graphql/permissions");
const { verifyToken } = require("./src/helper/token");
const UserModel = require("./src/models/User");

const schema = makeExecutableSchema({
  typeDefs: TypeDefs.GetTypeDef(),
  resolvers: Resolvers.Getresolvers(),
});

const schemaWithMiddleware = applyMiddleware(schema, permissions);

const context = async ({ req, res }) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  const user = verifyToken(token);
  if (!user) {
    return { user: null, permissions: [] };
  }
  const permissions = await UserModel.getUserPermissions(user.userId);
  return { user, permissions };
};

async function startServer() {
  const app = express();

  const server = new ApolloServer({
    schema: schemaWithMiddleware,
    context,
    introspection: true,
  });

  await server.start();

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
