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

export function countPositiveReactions(data: any) {
  const comments = data.repository.discussions.edges[0].node.comments.edges;
  const positiveReactions: string[] = ["+1", "LAUGH", "HEART", "HOORAY", "ROCKET"];

  let maxTotalReactions = 0;
  let positiveReactionsTotal = 0;
  let commentWithMaxReactions = "";
  let commentIdWithMaxReactions = "";

  for (const comment of comments) {
    const reactions = comment.node.reactionGroups;
    /* eslint-disable @typescript-eslint/no-unused-vars */
    let totalPositiveReactions = 0;
    let totalReactions = 0;
    /* eslint-disable @typescript-eslint/no-unused-vars */

    for (const reaction of reactions) {
      totalReactions += reaction.reactors.totalCount;
      if (positiveReactions.includes(reaction.content)) {
        totalPositiveReactions += reaction.reactors.totalCount;
      }
    }

    if (totalReactions > maxTotalReactions) {
      positiveReactionsTotal = totalPositiveReactions;
      maxTotalReactions = totalReactions;
      commentWithMaxReactions = comment.node.body;
      commentIdWithMaxReactions = comment.node.id;
    }
  }

  return {
    commentId: commentIdWithMaxReactions,
    commentText: commentWithMaxReactions,
    totalReactions: maxTotalReactions,
    totalPositiveReactions: positiveReactionsTotal,
  };
}

export async function markDiscussionCommentAnswer() {
  const token = await getInput("GH_TOKEN");
  const reactionThreshold = await getInput("reaction_threshold");
  const commentThreshold = await getInput("comment_threshold");
  const eventPayload = await require(String(process.env.GITHUB_EVENT_PATH));
  const repoName = await eventPayload.repository.name;
  const repoOwner = await eventPayload.repository.owner.login;
  let commentNodeId = "";

  if (!eventPayload.discussion.category.is_answerable) {
    await setFailed("Discussion category is not answerable.");
    return;
  }

  if (eventPayload.discussion.answer_chosen_at) {
    await setFailed("Discussion is already answered.");
    return;
  }

  if (token === "{{ INVALID_TOKEN }}") {
    await setFailed("GitHub token missing or invalid, please enter a GITHUB_TOKEN");
    return;
  }

  if (Number(eventPayload.discussion.comments) <= Number(commentThreshold)) {
    await setFailed("Discussion does not have enough comments for an answer to be chosen.");
    return;
  }

  if (eventPayload.locked) {
    await setFailed("Discussion is locked, answers can no longer be selected.");
    return;
  }

  try {
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
              comments(first: 10) {
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
    console.log(reactionThreshold);
    const result = await countPositiveReactions(checkComments);
    if (result && Number(result.totalPositiveReactions) <= Number(reactionThreshold)) {
      await setFailed("Comment reaction threshold has not been met to be considered an answer.");
      return;
    }
    console.log(result);
    commentNodeId = result.commentId;
    await setOutput("commentText", result.commentText);
    await setOutput("reactionThreshold", Number(reactionThreshold));
    await setOutput("totalReactions", result.totalReactions);
    await setOutput("totalPositiveReactions", result.totalPositiveReactions);
    await setOutput("commentId", result.commentId);
  } catch (err) {
    console.log(err);
  }

  try {
    const response: Res = await graphql({
      query: `mutation {
      markDiscussionCommentAsAnswer(
        input: { id: "${commentNodeId}", clientMutationId: "1234" }
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
    await setOutput("discussionId", response.markDiscussionCommentAsAnswer.discussion);
    await setOutput("clientMutationId", response.markDiscussionCommentAsAnswer.clientMutationId);
  } catch (error: any) {
    await setFailed(error.message);
  }
}

if (!process.env.JEST_WORKER_ID) {
  markDiscussionCommentAnswer();
}
