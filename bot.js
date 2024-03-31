const { Octokit } = require("@octokit/rest");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const axios = require("axios");

// Create an Octokit instance
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN // Make sure to set this token in your GitHub repository secrets
});

// Function to assign a number to the pull request
function assignNumber(pull_number) {
  return `B${pull_number}`;
}

// Function to fetch the pull request document and check grammar and relevance to Bitcoin using ChatGPT
async function analyzePullRequest(owner, repo, pull_number) {
  try {
    // Fetch the pull request details
    const pullRequest = await octokit.pulls.get({
      owner: owner,
      repo: repo,
      pull_number: pull_number
    });

    // Fetch the commit details associated with the pull request
    const commit = await octokit.repos.getCommit({
      owner: owner,
      repo: repo,
      ref: pullRequest.data.head.sha
    });

    const pullRequestTitle = pullRequest.data.title;
    const pullRequestNumber = assignNumber(pull_number);
    const commitContent = commit.data.files.map(file => file.content).join('\n'); // Assuming you want to concatenate content of all files in the commit

    // Concatenate the question with the commit content
    const prompt = `Does the grammar of this commit content look correct? Is it related to Bitcoin? Do you see any issues or scope of improvement?\n\n${commitContent}`;

    // Access your API key as an environment variable (see "Set up your API key" above)
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

    // For text-only input, use the gemini-pro model
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Generate content based on the prompt
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = await response.text();
    console.log(responseText);

    return {
      number: pullRequestNumber,
      response: responseText
    };
  } catch (error) {
    console.error('Error analyzing pull request:', error);
    throw error;
  }
}

// Main function to handle the workflow
async function handlePullRequestEvent() {
  const { owner, repo, number } = process.env;

  try {
    // Assign a number to the pull request
    const pullRequestNumber = assignNumber(number);

    // Analyze the pull request document using Google Generative AI
    const analysisResult = await analyzePullRequest(owner, repo, number);

    console.log(`Assigned number: ${analysisResult.number}`);
    console.log(`Google Generative AI Response: ${analysisResult.response}`);
  } catch (error) {
    console.error('Error handling pull request event:', error);
  }
}

handlePullRequestEvent();
