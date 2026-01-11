import { Header } from './_components/header';
import { Stats } from './_components/stats';
import { Navbar } from '@/components/navigation/navbar';
import { Footer } from '@/components/navigation/footer';

async function getNpmDownloads() {
  try {
    const packages = [
      '@misque/quran',
      '@misque/prayer-times',
      '@misque/qibla',
      '@misque/hijri',
      '@misque/core',
    ];

    const downloads = await Promise.all(
      packages.map(async (pkg) => {
        const response = await fetch(
          `https://api.npmjs.org/downloads/point/last-month/${pkg}`,
          { next: { revalidate: 3600 } }
        );
        if (!response.ok) return 0;
        const data = await response.json();
        return data.downloads || 0;
      })
    );

    return downloads.reduce((acc, curr) => acc + curr, 0);
  } catch {
    return null;
  }
}

async function getGitHubStars() {
  try {
    const response = await fetch(
      'https://api.github.com/repos/asadkomi/misque',
      { next: { revalidate: 3600 } }
    );
    if (!response.ok) return null;
    const data = await response.json();
    return data.stargazers_count || null;
  } catch {
    return null;
  }
}

export default async function CommunityPage() {
  const [npmDownloads, githubStars] = await Promise.all([
    getNpmDownloads(),
    getGitHubStars(),
  ]);

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-16 px-4 md:px-8 lg:px-16">
        <div className="max-w-5xl mx-auto">
          <Header />
          <Stats npmDownloads={npmDownloads} githubStars={githubStars} />
        </div>
      </main>
      <Footer />
    </>
  );
}

export const metadata = {
  title: 'Community | Misque',
  description:
    'Join the Misque community to get help, share ideas, and stay up to date with the latest news.',
};
