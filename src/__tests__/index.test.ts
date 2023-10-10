import { markDiscussionCommentAnswer } from "../index";
import { graphql } from "@octokit/graphql";
import * as core from "@actions/core";
import { mocked } from "jest-mock";

// Mock the external dependencies
jest.mock("@octokit/graphql");
jest.mock("@actions/core");

const mockedGetInput = mocked(core.getInput);
const mockedSetFailed = mocked(core.setFailed);
const mockedSetOutput = mocked(core.setOutput);
const mockedGraphQL = mocked(graphql);

beforeEach(() => {
  // Clear mock calls and reset any mocked values before each test
  jest.clearAllMocks();

  // Mock getInput, setFailed, and setOutput from @actions/core
  jest.mock("@actions/core", () => ({
    getInput: mockedGetInput,
    setFailed: mockedSetFailed,
    setOutput: mockedSetOutput,
  }));
  // Mock the GITHUB_EVENT_PATH
  process.env.GITHUB_EVENT_PATH = "src/event.json";
});

afterAll(() => {
  // Restore the original process.env object after testing
  process.env.GITHUB_EVENT_PATH = "src/event.json";
});

test("run function successfully runs", async () => {
  // Mock the input values
  mockedGetInput.mockReturnValueOnce("{{ secrets.GITHUB_TOKEN }}");
  mockedGetInput.mockReturnValueOnce("DC_kwDOKEe7W84AbmPS");

  // Mock the GraphQL response
  const mockedResponse = {
    clientMutationId: "1234",
    discussion: {
      id: "discussionId",
    },
  };
  mockedGraphQL.mockResolvedValueOnce(mockedResponse);

  // Run the `run` function
  await markDiscussionCommentAnswer();

  // Assertions
  expect(mockedGetInput).toHaveBeenCalledTimes(1);
  // expect(mockedSetOutput).toEqual(mockedResponse)
});
