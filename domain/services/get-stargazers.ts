import { githubClient } from '@/lib/github/github-client';
import { unstable_cache } from 'next/cache';

export const getStargazers = unstable_cache(
  async () => {
    const { data } = await githubClient.request('GET /repos/{owner}/{repo}', {
      owner: 'dieguedev',
      repo: 'diegue.link',
    });
    return data.stargazers_count;
  },
  ['github-stars'],
  { revalidate: 3600 },
);
