/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getNotes = /* GraphQL */ `
  query GetNotes {
    getNotes {
      id
      title
      content
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const getNoteById = /* GraphQL */ `
  query GetNoteById($id: ID!) {
    getNoteById(id: $id) {
      id
      title
      content
      createdAt
      updatedAt
      __typename
    }
  }
`;
