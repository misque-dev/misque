import { Navbar } from '@/components/navigation/navbar';
import { Footer } from '@/components/navigation/footer';
import { DefaultChangelog } from './_components/default-changelog';

async function getReleases() {
  try {
    const response = await fetch(
      'https://api.github.com/repos/asadkomi/misque/releases',
      {
        headers: {
          Accept: 'application/vnd.github.v3+json',
        },
        next: { revalidate: 3600 },
      }
    );

    if (!response.ok) {
      return [];
    }

    const releases = await response.json();
    return releases;
  } catch {
    return [];
  }
}

export default async function ChangelogsPage() {
  const releases = await getReleases();

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-16 px-4 md:px-8 lg:px-16">
        <div className="max-w-5xl mx-auto">
          <DefaultChangelog releases={releases} />
        </div>
      </main>
      <Footer />
    </>
  );
}

export const metadata = {
  title: 'Changelogs | Misque',
  description:
    'All the changes made to Misque. Stay up to date with the latest features, improvements, and bug fixes.',
};
