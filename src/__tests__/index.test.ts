import { markDiscussionCommentAnswer } from "../index";
import { graphql } from "@octokit/graphql";
import * as core from "@actions/core";
import { mocked } from "jest-mock";

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

  const mockedResponse = {
    clientMutationId: "1234",
    discussion: {
      id: "discussionId",
    },
  };
  await mockedGraphQL.mockResolvedValueOnce(mockedResponse);

  await markDiscussionCommentAnswer();

  await expect(mockedGetInput).toHaveBeenCalledTimes(2);
  await expect(mockedSetFailed).toHaveBeenCalledWith("GitHub token missing or invalid, please enter a GITHUB_TOKEN");
});

test("run function successfully runs", async () => {
  await mockedGetInput.mockReturnValueOnce("{{ secrets.GITHUB_TOKEN }}");
  await mockedGetInput.mockReturnValueOnce("DC_kwDOKEe7W84AbmPS");

  const mockedResponse = {
    clientMutationId: "1234",
    discussion: {
      id: "discussionId",
    },
  };
  await mockedGraphQL.mockResolvedValueOnce(mockedResponse);

  await markDiscussionCommentAnswer();

  await expect(mockedGetInput).toHaveBeenCalledTimes(2);
});

test("Test if discussion is already answered", async () => {
  await mockedGetInput.mockReturnValueOnce("{{ github.token }}");
  process.env.GITHUB_EVENT_PATH = "src/__tests__/alreadyAnswered.json";

  await markDiscussionCommentAnswer();

  await expect(mockedGetInput).toHaveBeenCalledTimes(2);
  await expect(mockedSetFailed).toHaveBeenCalledWith("Discussion is already answered.");
});

test("Test if discussion is unanswerable", async () => {
  await mockedGetInput.mockReturnValueOnce("{{ github.token }}");
  process.env.GITHUB_EVENT_PATH = "src/__tests__/unanswerable.json";

  await markDiscussionCommentAnswer();

  await expect(mockedGetInput).toHaveBeenCalledTimes(2);
  await expect(mockedSetFailed).toHaveBeenCalledWith("Discussion category is not answerable.");
});
