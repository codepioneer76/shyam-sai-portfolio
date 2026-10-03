'use client';
import dynamic from 'next/dynamic';
import { Boot } from '@/components/ui/Boot';
import { HUD } from '@/components/ui/HUD';
import { Readout } from '@/components/ui/Readout';
import { Controls } from '@/components/ui/Controls';
import { Cursor } from '@/components/ui/Cursor';
import { Checkpoint } from '@/components/ui/Checkpoint';
import { TitleCard } from '@/components/ui/TitleCard';
import { MapOverlay } from '@/map/MapOverlay';
import { Curator } from '@/components/overlays/Curator';
import { AskTerminal } from '@/components/overlays/AskTerminal';
import { DossierOverlay } from '@/case-files/DossierOverlay';

/** The 3D bundle is code-split and never included in the server payload. */
const Experience = dynamic(() => import('@/environments/Experience').then((m) => m.Experience), {
  ssr: false,
  loading: () => <div className="fixed inset-0 bg-void" aria-hidden />,
});

export function FacilityClient(): JSX.Element {
  return (
    <main>
      <Experience />
      <TitleCard />
      <HUD />
      <Readout />
      <DossierOverlay />
      <MapOverlay />
      <Curator />
      <AskTerminal />
      <Checkpoint />
      <Controls />
      <Cursor />
      <Boot />
    </main>
  );
}
