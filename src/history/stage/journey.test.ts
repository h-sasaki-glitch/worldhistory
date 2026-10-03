import { describe, expect, it } from 'vitest';

import { STAGES, TERMS_BY_ID } from '@/history/data';

import { currentStop, journey } from './journey';
import { buildStageBoards } from './stageBoards';
import { applySolve, createStageProgress } from './stageState';
import type { StageProgress } from './types';

const [meso, egypt, indus, china] = STAGES;
const fresh = (s: typeof meso) => createStageProgress(s, buildStageBoards(s, TERMS_BY_ID).signature);

describe('Journey', () => {
  it('はじめは MESOPOTAMIA だけに旅立てる', () => {
    const stops = journey(STAGES, { mesopotamia: fresh(meso), egypt: fresh(egypt), indus: fresh(indus), china: fresh(china) });
    expect(stops.map((s) => s.status)).toEqual(['NEXT DESTINATION', 'LOCKED', 'LOCKED', 'LOCKED']);
    expect(currentStop(stops).stage.id).toBe('mesopotamia');
  });

  it('途中の時代は ARRIVED', () => {
    const p = applySolve(fresh(meso), buildStageBoards(meso, TERMS_BY_ID).boards, 'babylon', 1);
    const stops = journey(STAGES, { mesopotamia: p, egypt: fresh(egypt), indus: fresh(indus), china: fresh(china) });
    expect(stops[0].status).toBe('ARRIVED');
    expect(currentStop(stops).stage.id).toBe('mesopotamia');
  });

  it('MESOPOTAMIA を終えると EGYPT が次の目的地になる', () => {
    const done: StageProgress = { ...fresh(meso), completed: true };
    const stops = journey(STAGES, { mesopotamia: done, egypt: fresh(egypt), indus: fresh(indus), china: fresh(china) });
    expect(stops.map((s) => s.status)).toEqual(['COMPLETE', 'NEXT DESTINATION', 'LOCKED', 'LOCKED']);
    expect(currentStop(stops).stage.id).toBe('egypt');
  });

  it('時代は順番に開いていく（EGYPT を終えると INDUS、INDUS を終えると CHINA）', () => {
    const stops = journey(STAGES, {
      mesopotamia: { ...fresh(meso), completed: true },
      egypt: { ...fresh(egypt), completed: true },
      indus: fresh(indus),
      china: fresh(china),
    });
    expect(stops.map((s) => s.status)).toEqual(['COMPLETE', 'COMPLETE', 'NEXT DESTINATION', 'LOCKED']);
    expect(currentStop(stops).stage.id).toBe('indus');
  });

  it('すべて終えたら最後の時代を案内する', () => {
    const stops = journey(STAGES, {
      mesopotamia: { ...fresh(meso), completed: true },
      egypt: { ...fresh(egypt), completed: true },
      indus: { ...fresh(indus), completed: true },
      china: { ...fresh(china), completed: true },
    });
    expect(currentStop(stops).stage.id).toBe('china');
  });
});
