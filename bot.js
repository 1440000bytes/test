const { Octokit } = require("@octokit/rest");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Create an Octokit instance
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN // Make sure to set this token in your GitHub repository secrets
});

    // Concatenate the question with the commit content
    const prompt = `Does the grammar of this commit content look correct? Is it related to Bitcoin? Do you see any issues or scope of improvement?`;

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

    // Analyze the pull request document using Google Generative AI
    const analysisResult = await analyzePullRequest(owner, repo, number);

    console.log(`Google Generative AI Response: ${analysisResult.response}`);
  } catch (error) {
    console.error('Error handling pull request event:', error);
  }
}

handlePullRequestEvent();
