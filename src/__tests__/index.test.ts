import { generateRandomCharacters } from "../index";
import * as core from "@actions/core";
import { mocked } from "jest-mock";

// Mock the external dependencies
jest.mock("@octokit/graphql");
jest.mock("@actions/core");

const mockedGetInput = mocked(core.getInput);
const mockedSetOutput = mocked(core.setOutput);

beforeEach(() => {
  // Clear mock calls and reset any mocked values before each test
  jest.clearAllMocks();

  // Mock getInput, setFailed, and setOutput from @actions/core
  jest.mock("@actions/core", () => ({
    getInput: mockedGetInput,
    setOutput: mockedSetOutput,
  }));
});

test("function returns random chars", async () => {
  // Mock the input values
  const numOfChars = "100";
  mockedGetInput.mockReturnValueOnce(numOfChars);
  mockedGetInput.mockReturnValueOnce("0x0020");
  mockedGetInput.mockReturnValueOnce("0x007e");

  // Run the `run` function
  await generateRandomCharacters();

  // Assertions
  expect(mockedGetInput).toHaveBeenCalledTimes(3);
  expect(mockedGetInput).toHaveBeenCalledWith("numOfChars");
  expect(mockedGetInput).toHaveBeenCalledWith("startRange");
  expect(mockedGetInput).toHaveBeenCalledWith("endRange");
  expect(mockedSetOutput).toHaveBeenCalledTimes(1);
  expect(mockedSetOutput).toHaveBeenCalledWith("output", expect.any(String));
  const lengthRegex = new RegExp(`^.{${numOfChars}}$`);
  expect(mockedSetOutput).toHaveBeenCalledWith("output", expect.stringMatching(lengthRegex));
});

test("should handle numOfChars = 0", async () => {
  mockedGetInput.mockReturnValueOnce("0");
  await generateRandomCharacters();
  expect(mockedSetOutput).toHaveBeenCalledWith("output", "");
});

it("should handle a negative numOfChars", async () => {
  mockedGetInput.mockReturnValueOnce("-10");
  // Expect an error to be thrown, or handle it appropriately in your code.
  await expect(generateRandomCharacters()).rejects.toThrowError("numOfChars must be a positive integer");
});

it("should handle invalid hexadecimal values", async () => {
  mockedGetInput.mockReturnValueOnce("100");
  mockedGetInput.mockReturnValueOnce("invalidStart");
  mockedGetInput.mockReturnValueOnce("invalidEnd");
  // Expect an error to be thrown
  await expect(generateRandomCharacters()).rejects.toThrowError("Invalid code point NaN");
});

it("should handle startRange > endRange", async () => {
  mockedGetInput.mockReturnValueOnce("100");
  mockedGetInput.mockReturnValueOnce("0x007e"); // End range is smaller
  mockedGetInput.mockReturnValueOnce("0x0020"); // Start range is greater
  // Expect an error to be thrown
  await expect(generateRandomCharacters()).rejects.toThrowError("startRange must be less than or equal to endRange");
});
