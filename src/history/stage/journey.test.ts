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
  it('はじめは最も古い時代（EGYPT, BC 2570）だけに旅立てる', () => {
    const stops = journey(STAGES, progressWith(0));
    expect(stops[0].status).toBe('NEXT DESTINATION');
    expect(stops.slice(1).every((s) => s.status === 'LOCKED')).toBe(true);
    expect(currentStop(stops).stage.id).toBe('egypt');
  });

  it('途中の時代は ARRIVED', () => {
    const first = STAGES[0];
    const termId = first.crossword.firstTermId ?? first.crossword.termIds[0];
    const p = applySolve(fresh(first), buildStageBoards(first, TERMS_BY_ID).boards, termId, 1);
    const stops = journey(STAGES, { ...progressWith(0), [first.id]: p });
    expect(stops[0].status).toBe('ARRIVED');
    expect(currentStop(stops).stage.id).toBe(first.id);
  });

  it('並び順の変更前に遊んだ時代は、前の時代が未完了でも開いたままにする', () => {
    // 旧順序では MESOPOTAMIA が最初だった。そこを終えた保存データでも閉じない
    const meso = STAGES.find((s) => s.id === 'mesopotamia')!;
    const stops = journey(STAGES, { ...progressWith(0), [meso.id]: { ...fresh(meso), completed: true } });
    const m = stops.find((s) => s.stage.id === 'mesopotamia')!;
    expect(m.unlocked).toBe(true);
    expect(m.status).toBe('COMPLETE');
    // 最初の時代はいつでも開いている。その間の未着手の時代は順番どおり閉じている
    expect(stops[0].unlocked).toBe(true);
    expect(stops.find((s) => s.stage.id === 'indus')!.unlocked).toBe(false);
    // MESOPOTAMIA を終えているので、その次（CHINA）へは旅立てる
    expect(stops.find((s) => s.stage.id === 'china')!.status).toBe('NEXT DESTINATION');
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
});
