import { describe, expect, it } from 'vitest';

import { STAGES, TERMS_BY_ID } from '@/history/data';

import { currentStop, journey } from './journey';
import { buildStageBoards } from './stageBoards';
import { applySolve, createStageProgress } from './stageState';
import type { StageDefinition, StageProgress } from './types';

const fresh = (s: StageDefinition) => createStageProgress(s, buildStageBoards(s, TERMS_BY_ID).signature);

/** 先頭から completedCount 個の時代を終えた状態 */
function progressWith(completedCount: number): Record<string, StageProgress> {
  return Object.fromEntries(STAGES.map((s, i) => [s.id, { ...fresh(s), completed: i < completedCount }]));
}

describe('Journey', () => {
  it('はじめは最初の時代（MESOPOTAMIA）だけに旅立てる', () => {
    const stops = journey(STAGES, progressWith(0));
    expect(stops[0].status).toBe('NEXT DESTINATION');
    expect(stops.slice(1).every((s) => s.status === 'LOCKED')).toBe(true);
    expect(currentStop(stops).stage.id).toBe('mesopotamia');
  });

  it('途中の時代は ARRIVED', () => {
    const meso = STAGES[0];
    const p = applySolve(fresh(meso), buildStageBoards(meso, TERMS_BY_ID).boards, 'babylon', 1);
    const stops = journey(STAGES, { ...progressWith(0), [meso.id]: p });
    expect(stops[0].status).toBe('ARRIVED');
    expect(currentStop(stops).stage.id).toBe('mesopotamia');
  });

  it('時代は一つずつ順番に開いていく', () => {
    for (let done = 1; done < STAGES.length; done++) {
      const stops = journey(STAGES, progressWith(done));
      expect(stops.map((s) => s.status)).toEqual(
        STAGES.map((_, i) => (i < done ? 'COMPLETE' : i === done ? 'NEXT DESTINATION' : 'LOCKED')),
      );
      expect(currentStop(stops).stage.id).toBe(STAGES[done].id);
    }
  });

  it('すべて終えたら最後の時代を案内する', () => {
    const stops = journey(STAGES, progressWith(STAGES.length));
    expect(currentStop(stops).stage.id).toBe(STAGES[STAGES.length - 1].id);
  });

  it('各時代の nextStage は、次に並ぶ時代を指す', () => {
    STAGES.slice(0, -1).forEach((s, i) => expect(s.nextStage?.id, s.id).toBe(STAGES[i + 1].id));
  });
});
