# Mark Discussion Comment Answer ✅

Mark a discussion comment as the answer

[![Tests](https://img.shields.io/badge/tests-passing-gree.svg?logo=typescript&colorA=24292e&logoColor=white)](https://github.com/konjoinfinity/mark-discussion-comment-answer/blob/main/src/__tests__/index.test.ts)  ![GitHub Workflow Status (with event)](https://img.shields.io/github/actions/workflow/status/konjoinfinity/mark-discussion-comment-answer/.github%2Fworkflows%2Fnode.js.yml?colorA=24292e&logo=github) ![GitHub Release Date - Published_At](https://img.shields.io/github/release-date/konjoinfinity/mark-discussion-comment-answer?colorA=24292e&logo=github) [![coverage badge](https://img.shields.io/endpoint?url=https://gist.githubusercontent.com/wesleyscholl/fce8ce592425f8cc73ea124451808ce3/raw/450280b16d4e7a800f402f2233b224a2a37c7086/github-action-base-ts__heads_main.json?&colorA=24292e&label=test%20coverage)](https://gist.github.com/wesleyscholl/10f0b77400703c4a65f38434106adf2d)  [![GitHub Marketplace](https://img.shields.io/badge/marketplace-Mark%20Discussion%20Comment%20Answer-blue.svg?colorA=24292e&colorB=7F00FF&style=flat&longCache=true&logo=githubactions&logoColor=white)](https://github.com/marketplace/actions/mark-discussion-comment-answer) ![GitHub package.json dynamic](https://img.shields.io/github/package-json/name/konjoinfinity/mark-discussion-comment-answer?colorA=24292e&colorB=7F00FF&logo=github) ![Dynamic YAML Badge](https://img.shields.io/badge/dynamic/yaml?url=https://raw.githubusercontent.com/konjoinfinity/mark-discussion-comment-answer/main/action.yml&query=%24.description&colorA=24292e&colorB=7F00FF&logo=yaml&label=description) [![Code Style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?logo=prettier&colorA=24292e&logoColor=white&colorB=7F00FF)](https://github.com/prettier/prettier) [![Code Linter: ESLint](https://img.shields.io/badge/code_linter-eslint-ff69b4.svg?logo=eslint&colorA=24292e&logoColor=white&colorB=7F00FF)](https://github.com/prettier/prettier) ![GitHub top language](https://img.shields.io/github/languages/top/konjoinfinity/mark-discussion-comment-answer?colorA=24292e&colorB=7F00FF&logo=typescript&logoColor=white) ![GitHub contributors](https://img.shields.io/github/contributors/konjoinfinity/mark-discussion-comment-answer?colorA=24292e&colorB=7F00FF&logo=github&logoColor=white)  ![GitHub Discussions](https://img.shields.io/github/discussions/konjoinfinity/mark-discussion-comment-answer?colorA=24292e&colorB=7F00FF&logo=github&logoColor=white) ![GitHub Release (with filter)](https://img.shields.io/github/v/release/konjoinfinity/mark-discussion-comment-answer?colorA=24292e&colorB=7F00FF&logo=github)  ![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/konjoinfinity/mark-discussion-comment-answer?colorA=24292e&colorB=7F00FF&logo=github) ![GitHub repo size](https://img.shields.io/github/repo-size/konjoinfinity/mark-discussion-comment-answer?colorA=24292e&colorB=7F00FF&logo=github) ![GitHub package.json dynamic](https://img.shields.io/github/package-json/author/konjoinfinity/mark-discussion-comment-answer?colorA=24292e&colorB=7F00FF&logo=github) [![MIT](https://img.shields.io/badge/license-MIT-blue?colorA=24292e&colorB=7F00FF&logo=github)](https://raw.githubusercontent.com/konjoinfinity/mark-discussion-comment-answer/main/LICENSE)




## About

This GitHub action marks discussion comments as the answer.


## Usage

In your workflow, to use this github action add a step like this to your workflow:


```yaml
      - name: Run Mark Discussion Comment Answer
        id: markanswer
        uses: konjoinfinity/mark-discussion-comment-answer@v1.0.x
        with:
          GH_TOKEN: "${{ secrets.DISCUSS_TOKEN }}"    
```     

##### Example Output
```bash
DC_kwDOKczwv84AbnqH
{
  markDiscussionCommentAsAnswer: {
    clientMutationId: '1234',
    discussion: { id: 'D_kwDOKczwv84AV0aF' }
  }
}
discussionId = {id:D_kwDOKczwv84AV0aF}
```

## Requirements

No extra configuration required to run this GitHub Action. 






## Inputs

| Name | Type | Description | Requried? | Default |
| --- | --- | --- | --- | --- |
| `GH_TOKEN` | String | A GitHub PAT is required, but the default is sufficient for public repos. For private repos, ensure you create a PAT that has discussion: write and repo: write, then store it as an action secret for usage within the workflow. See more details about tokens here - [PAT](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token).  | **No** | `"${{ secrets.GITHUB_TOKEN }}"` | 
| `reaction_threshold` | Number  | Number of positive comment reactions required to mark as an answer. (Ex. `3`, `10`) | **No** | `0` |




## Outputs

| Name | Description | How To Access |
| --- | --- | --- |
| `discussionId` | Discussion ID where the marked as answered comment resides. | `${{ steps.<your-step>.outputs.discussionId}}` |





#### Accessing Outputs 
```yml
- name: Show Output
  run: |
    echo ${{ steps.<your-step>.outputs.discussionId }}
```




## Example

Link to [workflow](https://raw.githubusercontent.com/wesleyscholl/auto/main/.github/workflows/new.yaml)

```yaml
name: Mark Discussion Comment Answer

on:
  discussion_comment:
    types: [created]

jobs:
  mark-comment-answer:
    name: Mark a discussion comment as the answer
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repo
        uses: actions/checkout@v3
        
      - name: Run Mark Discussion Comment Answer
        id: markanswer
        uses: konjoinfinity/mark-discussion-comment-answer@v1.0.9
        with:
          GH_TOKEN: "${{ secrets.DISCUSS_TOKEN }}" # PAT required for private repos
          
      - name: Show Mark Answer Output
        run: |
          echo "discussionId = ${{ steps.markanswer.outputs.discussionId }}"
```

##### Example Output
```js
{
  markDiscussionCommentAsAnswer: {
    clientMutationId: '1234',
    discussion: { id: 'D_kwDOKczwv84AV0aF' }
  }
}
```

## Credits

- [Using the GraphQL API for Discussions](https://docs.github.com/en/graphql/guides/using-the-graphql-api-for-discussions)
- [GitHub GraphQL Explorer](https://docs.github.com/en/graphql/overview/explorer)

#### Inspired by:
- [Create and Publish a GitHub Action in Typescript - Leonardo Montini](https://leonardomontini.dev/typescript-github-action/)
- [Discussion Autoresponder - GitHub Action](https://github.com/marketplace/actions/discussion-auto-responder)
