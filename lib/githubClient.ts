import { Octokit } from 'octokit';

class GithubClient {
  private static instance: Octokit;

  static getInstance() {
    if (!this.instance) {
      this.instance = new Octokit({
        auth: process.env.GITHUB_TOKEN,
      });
    }
    return this.instance;
  }
}

export const githubClient = GithubClient.getInstance();