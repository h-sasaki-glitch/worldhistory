import { describe, expect, it } from 'vitest';

import { TERMS_BY_ID } from '@/history/data';

import { addDiscovery, createArchive, summarizeStage } from './archiveStore';
import { connectionsOf, linkKey, relatedIds } from './linkResolver';
import type { ArchiveState } from './types';

const add = (a: ArchiveState, termId: string, now = 1, source: 'CROSSWORD' | 'BACKGROUND' | 'EVENT' = 'CROSSWORD') =>
  addDiscovery(a, { termId, stageId: 'mesopotamia', source }, TERMS_BY_ID, now);

describe('Archive', () => {
  it('発見語を登録する', () => {
    const r = add(createArchive(), 'hammurabi');
    expect(r.added).toBe(true);
    expect(r.archive.entries.hammurabi.termId).toBe('hammurabi');
    expect(r.archive.entries.hammurabi.source).toBe('CROSSWORD');
  });

  it('重複登録しない', () => {
    const first = add(createArchive(), 'hammurabi', 1).archive;
    const second = add(first, 'hammurabi', 2);
    expect(second.added).toBe(false);
    expect(second.archive).toBe(first);
    expect(second.archive.entries.hammurabi.discoveredAt).toBe(1);
  });

  it('関連語の両方を発見すると LINK が解放される', () => {
    let a = createArchive();
    let r = add(a, 'hammurabi');
    expect(r.newLinks).toEqual([]);
    a = r.archive;
    r = add(a, 'babylon');
    expect(r.newLinks).toEqual([linkKey('babylon', 'hammurabi')]);
    a = r.archive;
    // 無関係な語では LINK は増えない
    r = add(a, 'euphrates');
    expect(r.newLinks).toContain(linkKey('babylon', 'euphrates'));
    expect(r.newLinks).not.toContain(linkKey('euphrates', 'hammurabi'));
  });

  it('LINK は双方向（片側にしか relatedTermIds が無くても解放）', () => {
    // tigris → mesopotamia は tigris 側にあり、mesopotamia 側にもある。
    // shamash は hammurabi_code を参照し、hammurabi 側も shamash を参照する。
    expect(relatedIds('clay_tablet', TERMS_BY_ID)).toContain('cuneiform');
    expect(relatedIds('cuneiform', TERMS_BY_ID)).toContain('clay_tablet');
  });

  it('ハンムラビのカード: バビロン・メソポタミア発見で 2 / 4 LINKS FOUND', () => {
    let a = createArchive();
    for (const id of ['hammurabi', 'babylon', 'mesopotamia']) a = add(a, id).archive;
    const c = connectionsOf('hammurabi', a, TERMS_BY_ID);
    expect(c.total).toBe(4);
    expect(c.found).toBe(2);
    expect(c.connections.slice(0, 2).map((x) => x.termId).sort()).toEqual(['babylon', 'mesopotamia']);
    expect(c.connections.filter((x) => !x.found).map((x) => x.termId).sort()).toEqual(['hammurabi_code', 'shamash']);
  });

  it('ステージ集計: 発見数・カテゴリー・新しい LINK 数', () => {
    let a = createArchive();
    for (const id of ['hammurabi', 'babylon', 'cuneiform', 'sumer', 'tigris']) a = add(a, id).archive;
    const s = summarizeStage(a, 'mesopotamia', TERMS_BY_ID);
    expect(s.discovered).toBe(5);
    expect(s.groups).toEqual([
      { label: 'PEOPLE', count: 1 },
      { label: 'PLACES', count: 2 },
      { label: 'WRITING', count: 1 },
      { label: 'CULTURE', count: 1 },
    ]);
    expect(s.newLinks).toBe(Object.keys(a.links).length);
  });
});
