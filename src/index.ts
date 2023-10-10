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

interface Cat {
  data: {
    discussion: {
      id: string; 
      category: {
        isAnswerable: string;
      }
    }
  }
}

interface Answer {
  data: {
    discussion: {
      id: string;
      answerChosenAt: string;
    }
  }
}

export async function markDiscussionCommentAnswer() {
  const token = getInput("GH_TOKEN");
  console.log(token);
  token === "INVALID_TOKEN" && setFailed("GitHub token missing or invalid, please enter a GITHUB_TOKEN");
  const eventPayload = require(String(process.env.GITHUB_EVENT_PATH));
  console.log(eventPayload);
  const commentId = eventPayload.comment.node_id;
  console.log(commentId);

  // Get the discussion category
  const discussionCategory: Cat = await graphql({
    query: `query {
      discussion(id: ${eventPayload.discussion.id}) {
        category {
          isAnswerable
        }
      }
    }`,
    headers: {
      authorization: `token ${token}`,
    },
  });

  // If the discussion category is not answerable, set the output to failed
  if (!discussionCategory.data.discussion.category.isAnswerable) {
    setFailed("Discussion category is not answerable.");
    return;
  }

  // Check if the discussion is already answered
  const discussion: Answer = await graphql({
    query: `query {
      discussion(id: ${eventPayload.discussion.id}) {
        answerChosenAt
      }
    }`,
    headers: {
      authorization: `token ${token}`,
    },
  });

  // If the discussion is already answered, set the output to failed
  if (discussion.data.discussion.answerChosenAt) {
    setFailed("Discussion is already answered.");
    return;
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
