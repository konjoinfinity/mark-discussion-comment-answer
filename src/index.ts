import { getInput, setFailed, setOutput } from "@actions/core";
import { graphql } from "@octokit/graphql";

interface Res {
  markDiscussionCommentAsAnswer: {
    clientMutationId: string;
    discussion: {
      id: string;
    };
  };
}

export async function markDiscussionCommentAnswer() {
  const token = getInput("GH_TOKEN");
  console.log(`TOKEN = ${token}`);
  const eventPayload = require(String(process.env.GITHUB_EVENT_PATH));
  console.log(eventPayload.discussion);
  console.log(eventPayload);
  const commentId = eventPayload.comment.node_id;
  console.log(commentId);
  const repoName = eventPayload.repository.name;
  console.log(repoName);
  const repoOwner = eventPayload.repository.owner.login;
  console.log(repoOwner);

  if (!eventPayload.discussion.category.is_answerable) {
    console.log("Not answerable");
    setFailed("Discussion category is not answerable.");
    return;
  }

  if (eventPayload.discussion.answer_chosen_at) {
    console.log("Already answered");
    setFailed("Discussion is already answered.");
    return;
  }

  if (token === "{{ INVALID_TOKEN }}") {
    console.log("Invalid Github Token");
    setFailed("GitHub token missing or invalid, please enter a GITHUB_TOKEN");
    return;
  }

  try {
    console.log(token);
    const checkComments: any = await graphql({
      query: `query {
      repository(owner: "${repoOwner}", name: "${repoName}" ) {
        discussions(first: 1, answered: false) {
          edges {
            node {
              isAnswered
              id
              title
              body
              locked
              number
              publishedAt
              repository {
                name
              }
              comments(first: 5) {
                edges {
                  node {
                    id
                    upvoteCount
                    body
                    createdAt
                    reactionGroups {
                      reactors {
                        totalCount
                      }
                      content
                      createdAt
                      viewerHasReacted
                    }
                  }
                }
              }
            }
          }
        }
      }
    }`,
      headers: {
        authorization: `token ${token}`,
      },
    });
    console.log(checkComments);
    console.log("==========================================");
    console.log(checkComments.repository.discussions.edges);
    console.log("==========================================");
  } catch (err) {
    console.log(err);
  }

  try {
    const response: Res = await graphql({
      query: `mutation {
      markDiscussionCommentAsAnswer(
        input: { id: "${commentId}", clientMutationId: "1234" }
      ) {
        clientMutationId
        discussion {
          id
        }
      }
    }`,
      headers: {
        authorization: `token ${token}`,
      },
    });
    console.log(response);
    await setOutput("discussionId", response?.markDiscussionCommentAsAnswer?.discussion);
    await setOutput("clientMutationId", response?.markDiscussionCommentAsAnswer?.clientMutationId);
  } catch (error: any) {
    await setFailed(error.message);
  }
}

if (!process.env.JEST_WORKER_ID) {
  markDiscussionCommentAnswer();
}
