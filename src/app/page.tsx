import type { Metadata } from 'next';
import { ArchiveClient } from './ArchiveClient';
import { profile } from '@/data/profile';

export const metadata: Metadata = { alternates: { canonical: '/' } };

export default function Page(): JSX.Element {
  return (
    <>
      <h1 className="sr-only">
        {profile.fullName} — {profile.classification}
      </h1>
      <p className="sr-only">
        {profile.positioning} {profile.degree} at {profile.institution}, {profile.years}. A plain, fully readable
        version of everything in this archive is at /dossier.
      </p>
      <noscript>
        <div style={{ padding: 32 }}>
          <h2>{profile.fullName}</h2>
          <p>{profile.classification}</p>
          <p>
            This experience needs JavaScript. The complete record is at <a href="/dossier">/dossier</a>.
          </p>
        </div>
      </noscript>
      <ArchiveClient />
    </>
  );
}
