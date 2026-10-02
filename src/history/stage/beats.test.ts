import { describe, expect, it } from 'vitest';

import { pushUserBeat, type QueueItem } from './beats';

describe('Beat queue', () => {
  const discovery: QueueItem = { kind: 'discovery' };

  it('飛ばしてよい台詞の表示中は、発見を即座に表示する', () => {
    const q = pushUserBeat([{ kind: 'line', skippable: true }, { kind: 'title' }], discovery);
    expect(q.map((b) => b.kind)).toEqual(['discovery', 'title']);
  });

  it('物語上の台詞は飛ばさず、後ろに並べる', () => {
    const q = pushUserBeat([{ kind: 'line' }, { kind: 'set' }], discovery);
    expect(q.map((b) => b.kind)).toEqual(['line', 'set', 'discovery']);
  });

  it('空のキューにはそのまま積む', () => {
    expect(pushUserBeat([], discovery)).toEqual([discovery]);
  });
});
