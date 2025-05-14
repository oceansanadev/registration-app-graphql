const { gql } = require("graphql-tag");

const User = gql`
  type User {
    id: ID!
    fullName: String!
    username: String!
    email: String!
    gender: String
    country: String
    state: String
    languagePreference: [String!]!
    occupation: String
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Query {
    me: User
  }

  type Mutation {
    register(
      fullName: String!
      username: String!
      email: String!
      password: String!
      gender: String
      country: String
      state: String
      languagePreference: [String!]!
      occupation: String
    ): AuthPayload!

    login(email: String!, password: String!): AuthPayload!
  }
`;

module.exports = User;
