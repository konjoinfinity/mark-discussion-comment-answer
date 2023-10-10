import { getInput, setFailed, setOutput } from "@actions/core";
let { graphql } = require("@octokit/graphql");

interface Res {
  clientMutationId: string;
  discussion: {
    id: string;
  };
}

export async function markDiscussionCommentAnswer() {
  const token = await getInput("GITHUB_TOKEN");
  console.log(token);
  token === "INVALID_TOKEN" && (await setFailed("GitHub token missing or invalid, please enter a GITHUB_TOKEN"));
  const eventPayload = await require(String(process.env.GITHUB_EVENT_PATH));
  console.log(eventPayload);
  const commentId = eventPayload.comment.node_id;
  console.log(commentId);
  graphql = await graphql.defaults({
    headers: {
      authorization: `token ${token}`
    },
  });
  console.log(graphql.headers);
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
    console.log(response);
    await setOutput("discussionId", response?.discussion);
    await setOutput("clientMutationId", response?.clientMutationId);
  } catch (error: any) {
    await setFailed(error.message);
  }
}

if (!process.env.JEST_WORKER_ID) {
  markDiscussionCommentAnswer();
}
