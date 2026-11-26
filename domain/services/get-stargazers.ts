import { GITHUB_OWNER, GITHUB_REPO } from '@/lib/site';
import { githubClient } from '@/lib/github/github-client';
import { unstable_cache } from 'next/cache';

export const getStargazers = unstable_cache(
  async () => {
    const { data } = await githubClient.request('GET /repos/{owner}/{repo}', {
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
    });
    return data.stargazers_count;
  },
  ['github-stars'],
  { revalidate: 3600 },
);
