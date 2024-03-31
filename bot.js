const { Octokit } = require("@octokit/rest");
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

    const pullRequestTitle = pullRequest.data.title;
    const pullRequestNumber = assignNumber(pull_number);
    const pullRequestDocument = pullRequest.data.body; // Assuming the body contains the document

    // Concatenate the question with the pull request document
    const prompt = `Does the grammar of this document look correct? Is it related to Bitcoin? Do you see any issues or scope of improvement?\n\n${pullRequestDocument}`;

    // Call ChatGPT API to analyze the pull request document
    const chatGPTResponse = await axios.post('https://api.openai.com/v1/completions', {
      model: 'text-davinci-003', // Adjust the model as needed
      prompt: prompt,
      max_tokens: 150, // Adjust as needed
      temperature: 0.7, // Adjust as needed
      stop: ['###'] // Adjust as needed
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` // Make sure to set this token in your environment or GitHub repository secrets
      }
    });

    const chatGPTResponseText = chatGPTResponse.data.choices[0].text.trim();

    return {
      number: pullRequestNumber,
      chatGPTResponse: chatGPTResponseText
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

    // Analyze the pull request document using ChatGPT
    const analysisResult = await analyzePullRequest(owner, repo, number);

    console.log(`Assigned number: ${analysisResult.number}`);
    console.log(`ChatGPT Response: ${analysisResult.chatGPTResponse}`);
  } catch (error) {
    console.error('Error handling pull request event:', error);
  }
}

handlePullRequestEvent();
