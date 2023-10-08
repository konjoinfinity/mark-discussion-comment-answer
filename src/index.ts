import { getInput, setOutput } from "@actions/core";

export async function generateRandomCharacters() {
  const numOfChars = getInput("numOfChars");
  if (Number(numOfChars) < 0) {
    throw new TypeError("numOfChars must be a positive integer");
  }
  // const startRange = 0x0020;
  const startRange = getInput("startRange");
  // const endRange = 0x007e;
  const endRange = getInput("endRange");
  if (Number(startRange) > Number(endRange)) {
    throw new TypeError("startRange must be less than or equal to endRange");
  }
  const result: string[] = [];

  for (let i = 0; i < Number(numOfChars); i++) {
    const randomCodePoint =
      Math.floor(Math.random() * (Number(endRange) - Number(startRange) + 1)) + Number(startRange);
    const randomCharacter = String.fromCodePoint(randomCodePoint);
    result.push(randomCharacter);
  }
  console.log(result.join(""));
  await setOutput("output", result.join(""));
}

generateRandomCharacters();
