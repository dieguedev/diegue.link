import { githubClient } from '@/lib/github/github-client';

export async function getStargazers() {
  const { data } = await githubClient.request('GET /repos/{owner}/{repo}', {
    owner: 'dieguedev',
    repo: 'diegue.link',
  });
  return data.stargazers_count;
}
