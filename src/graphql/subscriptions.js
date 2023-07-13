/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const newQuestion = /* GraphQL */ `
  subscription NewQuestion {
    newQuestion {
      id
      user {
        id
        username
        email
        createdAt
        updatedAt
        __typename
      }
      content
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const newAnswer = /* GraphQL */ `
  subscription NewAnswer($questionId: ID!) {
    newAnswer(questionId: $questionId) {
      id
      question {
        id
        user {
          id
          username
          email
          createdAt
          updatedAt
          __typename
        }
        content
        createdAt
        updatedAt
        __typename
      }
      content
      createdAt
      updatedAt
      __typename
    }
  }
`;
