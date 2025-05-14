require("dotenv").config();
const express = require("express");
const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@apollo/server/express4");
const cors = require("cors");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");

const typeDefs = require("./src/schema/typeDefs");
const resolvers = require("./src/resolvers");
const { JWT_SECRET } = require("./src/config");

async function startServer() {
  const app = express();

  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  await server.start();

  // Express middleware stack
  app.use(cors());
  app.use(bodyParser.json());

  app.use(
    "/graphql",
    expressMiddleware(server, {
      context: async ({ req }) => {
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
    })
  );

  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () =>
    console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`)
  );
}

startServer();
