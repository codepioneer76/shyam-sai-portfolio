'use client';
import { useEffect } from 'react';
import { Entrance } from '@/sections/Entrance';
import { SkillSet } from '@/sections/SkillSet';
import { ProjectsBuilt } from '@/sections/ProjectsBuilt';
import { Research } from '@/sections/Research';
import { Certifications } from '@/sections/Certifications';
import { HowIBuild } from '@/sections/HowIBuild';
import { FinalRoom } from '@/sections/FinalRoom';
import { Doorway } from '@/castle/Doorway';
import { Index } from '@/components/Index';
import { EstateMap } from '@/components/EstateMap';
import { AskPanel } from '@/components/AskPanel';
import { Controls } from '@/components/Controls';
import { Loader } from '@/components/Loader';
import { useSmoothScroll } from '@/animations/useSmoothScroll';
import { actions } from '@/state/store';
import { chapters } from '@/data/chapters';


/**
 * The castle, room by room. Seven rooms on one continuous walk, each joined to
 * the next by a doorway the visitor passes through rather than a section break.
 */
export function ArchiveClient(): JSX.Element {
  useSmoothScroll();

  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')) return;
      if (e.key === 'Escape') actions.setOverlay('none');
      if (e.key === 'm' || e.key === 'M') actions.toggleOverlay('map');
      if (e.key === 'k' || e.key === 'K') actions.toggleOverlay('ask');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <main className="grain vignette relative pb-14 lg:pb-0">
      <Entrance />
      <Doorway next={chapters[1].title} numeral={chapters[1].numeral} />
      <SkillSet />
      <Doorway next={chapters[2].title} numeral={chapters[2].numeral} />
      <ProjectsBuilt />
      <Doorway next={chapters[3].title} numeral={chapters[3].numeral} />
      <Research />
      <Doorway next={chapters[4].title} numeral={chapters[4].numeral} />
      <Certifications />
      <Doorway next={chapters[5].title} numeral={chapters[5].numeral} />
      <HowIBuild />
      <Doorway next={chapters[6].title} numeral={chapters[6].numeral} />
      <FinalRoom />

      <Index />
      <Controls />
      <EstateMap />
      <AskPanel />
      <Loader />
    </main>
  );
}
