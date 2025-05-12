require("dotenv").config();

const express = require("express");
const jwt = require("jsonwebtoken");
const { ApolloServer } = require("apollo-server-express");
const { JWT_SECRET } = require("./src/config");
const typeDefs = require("./src/schema/typeDefs");
const resolvers = require("./src/resolvers");

async function startServer() {
  const app = express();

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => {
      const authHeader = req.headers.authorization || "";
      if (authHeader) {
        try {
          const token = authHeader.replace("Bearer ", "");

          const decoded = jwt.verify(token, JWT_SECRET);
          return { user: decoded };
        } catch (error) {
          console.warn("Invalid or expired token");
        }
      }
      return {};
    },
  });

  await server.start();
  server.applyMiddleware({ app, path: "/graphql" });

  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () =>
    console.log(`Server ready at http://localhost:${PORT}${server.graphqlPath}`)
  );
}

startServer();
