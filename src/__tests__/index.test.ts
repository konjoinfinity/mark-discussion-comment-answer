import { countPositiveReactions, markDiscussionCommentAnswer } from "../index";
import { graphql } from "@octokit/graphql";
import * as core from "@actions/core";
import { mocked } from "jest-mock";
import commentsReactions from "./commentsReactions.json";

jest.mock("@octokit/graphql");
jest.mock("@actions/core");

const mockedGetInput = mocked(core.getInput);
const mockedSetFailed = mocked(core.setFailed);
const mockedSetOutput = mocked(core.setOutput);
const mockedGraphQL = mocked(graphql);

beforeEach(async () => {
  await jest.clearAllMocks();

  await jest.mock("@actions/core", () => ({
    getInput: mockedGetInput,
    setFailed: mockedSetFailed,
    setOutput: mockedSetOutput,
  }));
  process.env.GITHUB_EVENT_PATH = "src/__tests__/event.json";
});

afterAll(async () => {
  process.env.GITHUB_EVENT_PATH = "src/__tests__/event.json";
});

test("Test if github token is invalid", async () => {
  await mockedGetInput.mockReturnValueOnce("{{ INVALID_TOKEN }}");
  await mockedGetInput.mockReturnValueOnce("3");
  await mockedGetInput.mockReturnValueOnce("3");

  const mockedResponse = {
    clientMutationId: "1234",
    discussion: {
      id: "discussionId",
    },
  };
  await mockedGraphQL.mockResolvedValueOnce(mockedResponse);

  await markDiscussionCommentAnswer();

  await expect(mockedGetInput).toHaveBeenCalledTimes(3);
  await expect(mockedSetFailed).toHaveBeenCalledWith("GitHub token missing or invalid, please enter a GITHUB_TOKEN");
});

test("run function successfully runs", async () => {
  await mockedGetInput.mockReturnValueOnce("{{ secrets.GITHUB_TOKEN }}");
  await mockedGetInput.mockReturnValueOnce("3");
  await mockedGetInput.mockReturnValueOnce("3");
  await mockedGetInput.mockReturnValueOnce("DC_kwDOKEe7W84AbmPS");

  const mockedResponse = {
    clientMutationId: "1234",
    discussion: {
      id: "discussionId",
    },
  };
  await mockedGraphQL.mockResolvedValueOnce(mockedResponse);

  await markDiscussionCommentAnswer();

  await expect(mockedGetInput).toHaveBeenCalledTimes(3);
});

test("Test if discussion is already answered", async () => {
  await mockedGetInput.mockReturnValueOnce("{{ github.token }}");
  await mockedGetInput.mockReturnValueOnce("3");
  await mockedGetInput.mockReturnValueOnce("3");
  process.env.GITHUB_EVENT_PATH = "src/__tests__/alreadyAnswered.json";

  await markDiscussionCommentAnswer();

  await expect(mockedGetInput).toHaveBeenCalledTimes(3);
  await expect(mockedSetFailed).toHaveBeenCalledWith("Discussion is already answered.");
});

test("Test if discussion is unanswerable", async () => {
  await mockedGetInput.mockReturnValueOnce("{{ github.token }}");
  await mockedGetInput.mockReturnValueOnce("3");
  await mockedGetInput.mockReturnValueOnce("3");
  process.env.GITHUB_EVENT_PATH = "src/__tests__/unanswerable.json";

  await markDiscussionCommentAnswer();

  await expect(mockedGetInput).toHaveBeenCalledTimes(3);
  await expect(mockedSetFailed).toHaveBeenCalledWith("Discussion category is not answerable.");
});

test("Not enough comments to mark an answer", async () => {
  await mockedGetInput.mockReturnValueOnce("{{ github.token }}");
  await mockedGetInput.mockReturnValueOnce("3");
  await mockedGetInput.mockReturnValueOnce("1");
  process.env.GITHUB_EVENT_PATH = "src/__tests__/notEnoughComments.json";

  await markDiscussionCommentAnswer();

  await expect(mockedGetInput).toHaveBeenCalledTimes(3);
  await expect(mockedSetFailed).toHaveBeenCalledWith(
    "Discussion does not have enough comments for an answer to be chosen."
  );
});

test("Test if discussion is locked and answers can no longer be selected", async () => {
  process.env.GITHUB_EVENT_PATH = "src/__tests__/locked.json";
  await mockedGetInput.mockReturnValueOnce("{{ github.token }}");
  await mockedGetInput.mockReturnValueOnce("3");
  await mockedGetInput.mockReturnValueOnce("3");

  mockedGetInput.mockReturnValueOnce("DC_kwDOKEe7W84AbmPS");
  mockedGetInput.mockReturnValueOnce(String(true));

  await markDiscussionCommentAnswer();

  await expect(mockedGetInput).toHaveBeenCalledTimes(3);
  await expect(mockedSetFailed).toHaveBeenCalledWith("Discussion is locked, answers can no longer be selected.");
});

test("countPositiveReactions() counts the total number of positive reactions for a given comment", async () => {
  const result = await countPositiveReactions(commentsReactions);

  await expect(result.commentId).toBe("DC_kwDOKczwv84Abmrk");
  await expect(result.commentText).toBe("hello");
  await expect(result.totalReactions).toBe(6);
  await expect(result.totalPositiveReactions).toBe(4);
});

test("countPositiveReactions() returns 0 positive reactions for a given comment", async () => {
  const mockDataWithoutPositiveReactions = {
    repository: {
      discussions: {
        edges: [
          {
            node: {
              comments: {
                edges: [
                  {
                    node: {
                      id: "1",
                      body: "test comment",
                      reactionGroups: [
                        {
                          content: "THUMBSDOWN",
                          reactors: {
                            totalCount: 5,
                          },
                        },
                      ],
                    },
                  },
                ],
              },
            },
          },
        ],
      },
    },
  };

  const result = await countPositiveReactions(mockDataWithoutPositiveReactions);

  await expect(result.commentId).toBe("1");
  await expect(result.commentText).toBe("test comment");
  await expect(result.totalReactions).toBe(5);
  await expect(result.totalPositiveReactions).toBe(0);
});
