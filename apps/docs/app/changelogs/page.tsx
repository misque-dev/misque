import { DefaultChangelog } from './_components/default-changelog';
import { CHANGELOG_DATA } from './_components/changelog-data';

export default function ChangelogsPage() {
  return (
    <main className="py-16 px-4">
      <DefaultChangelog releases={CHANGELOG_DATA} />
    </main>
  );
}

export const metadata = {
  title: 'Changelogs | Misque',
  description:
    'All the changes made to Misque. Stay up to date with the latest features, improvements, and bug fixes.',
};
