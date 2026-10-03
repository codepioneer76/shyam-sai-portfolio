export type Status = 'applied' | 'study' | 'pending';

/** Everything selectable in the world resolves to one of these for the readout panel. */
export interface Detail {
  id: string;
  name: string;
  kicker: string;
  status?: Status;
  body: string;
  facts?: { label: string; value: string }[];
  /** Case files this item is actually used in. Empty is honest, not a gap to fill. */
  deployedIn?: string[];
}
