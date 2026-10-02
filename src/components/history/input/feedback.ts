import type { AnswerCheck } from '@/history/input/answerInput';

/** 不正解時の短い反応。責めない・説明しない。 */
export function feedbackText(check: AnswerCheck): string | null {
  switch (check.kind) {
    case 'correct':
      return null;
    case 'wrong':
      return '……違う言葉のようだ。';
    case 'length':
      return `${check.expected}文字の言葉だ。`;
    case 'invalid':
      return 'ひらがなかカタカナで記そう。';
  }
}
