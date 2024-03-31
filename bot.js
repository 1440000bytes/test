const { Octokit } = require("@octokit/rest");

// Create an Octokit instance
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN // Make sure to set this token in your GitHub repository secrets
});

// Function to post a comment on the pull request
async function postComment(owner, repo, pull_number, comment) {
  try {
    await octokit.issues.createComment({
      owner: owner,
      repo: repo,
      issue_number: pull_number,
      body: comment
    });
    console.log('Comment posted successfully.');
  } catch (error) {
    console.error('Error posting comment:', error);
  }
}

// Main function to handle the workflow
async function handlePullRequestEvent() {
  const { owner, repo, number } = process.env;

  // Fetch the pull request details
  const pullRequest = await octokit.pulls.get({
    owner: owner,
    repo: repo,
    pull_number: number
  });

  const pullRequestTitle = pullRequest.data.title;
  const comment = `The title of this pull request is: "${pullRequestTitle}"`;

  // Post the pull request title as a comment
  await postComment(owner, repo, number, comment);
}

handlePullRequestEvent().catch(error => {
  console.error('Error handling pull request event:', error);
});
