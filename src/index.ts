import { getInput, setFailed, setOutput } from "@actions/core";
let { graphql } = require("@octokit/graphql");

interface Res {
  clientMutationId: string;
  discussion: {
    id: string;
  };
}

export async function markDiscussionCommentAnswer() {
  const token = getInput("GITHUB_TOKEN");
  token === "INVALID_TOKEN" && setFailed("GitHub token missing or invalid, please enter a GITHUB_TOKEN");
  const commentId = getInput("COMMENT_ID");
  commentId === "INVALID_COMMENT_ID" && setFailed("Invalid or missing discussionId.");

  graphql = graphql.defaults({
    headers: {
      authorization: `token ${token}`,
    },
  });
  try {
    const query = `mutation {
      markDiscussionCommentAsAnswer(
        input: { id: "${commentId}", clientMutationId: "1234" }
      ) {
        clientMutationId
        discussion: {
          id
        }
      }
    }`;
    const response: Res = await graphql(query);
    await setOutput("discussionId", response?.discussion);
    await setOutput("clientMutationId", response?.clientMutationId);
  } catch (error: any) {
    setFailed(error.message);
  }
}

if (!process.env.JEST_WORKER_ID) {
  markDiscussionCommentAnswer();
}
