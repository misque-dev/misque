import { HomePage } from '@/modules/home';

async function getGitHubStars() {
  try {
    const response = await fetch(
      'https://api.github.com/repos/asadkomi/misque',
      { next: { revalidate: 3600 } }
    );
    if (!response.ok) return null;
    const json = await response.json();
    return parseInt(json.stargazers_count).toLocaleString();
  } catch {
    return null;
  }
}

export default async function Page() {
  const stars = await getGitHubStars();

  return <HomePage stars={stars} />;
}
