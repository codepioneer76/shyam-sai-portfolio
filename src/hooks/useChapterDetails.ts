'use client';
import { useEffect } from 'react';
import type { Detail } from '@/data/types';
import { registerChapterDetails } from '@/state/actions';

/** A zone owns the list the [ and ] keys cycle through while it is on screen. */
export function useChapterDetails(details: Detail[], active: boolean): void {
  useEffect(() => {
    if (active) registerChapterDetails(details);
  }, [details, active]);
}
