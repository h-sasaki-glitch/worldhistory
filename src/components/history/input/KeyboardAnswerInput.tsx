import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { isCrosswordChar, normalizeAnswer } from '@/history/crossword/normalizeJapanese';
import type { AnswerCheck } from '@/history/input/answerInput';

import { C, F } from '../theme';
import { feedbackText } from './feedback';

type Props = {
  termKey: string;
  length: number;
  onSubmit: (raw: string) => AnswerCheck;
  /** 入力中の文字を盤面のマスに表示するために通知する */
  onPendingChange: (cells: (string | null)[]) => void;
};

function toPending(text: string, length: number): (string | null)[] {
  const chars = Array.from(normalizeAnswer(text));
  return Array.from({ length }, (_, i) => (chars[i] && isCrosswordChar(chars[i]) ? chars[i] : null));
}

/** 日本語キーボード入力（ひらがな・カタカナどちらでも可） */
export function KeyboardAnswerInput({ termKey, length, onSubmit, onPendingChange }: Props) {
  const [text, setText] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const shake = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setText('');
    setMessage(null);
  }, [termKey]);

  useEffect(() => {
    onPendingChange(toPending(text, length));
  }, [text, length, onPendingChange]);

  const submit = () => {
    if (!text.trim()) return;
    const r = onSubmit(text);
    const msg = feedbackText(r);
    setMessage(msg);
    if (msg) {
      Animated.sequence(
        [6, -6, 4, -4, 0].map((v) => Animated.timing(shake, { toValue: v, duration: 50, useNativeDriver: true })),
      ).start();
    } else {
      setText('');
    }
  };

  return (
    <View>
      <Animated.View style={[styles.row, { transform: [{ translateX: shake }] }]}>
        <TextInput
          value={text}
          onChangeText={(t) => {
            setText(t);
            if (message) setMessage(null);
          }}
          onSubmitEditing={submit}
          placeholder={`読みを記す（${length}文字）`}
          placeholderTextColor={C.textFaint}
          style={styles.input}
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="done"
          blurOnSubmit={false}
          accessibilityLabel="答えを入力"
        />
        <Pressable onPress={submit} style={styles.btn} accessibilityRole="button">
          <Text style={styles.btnText}>記す</Text>
        </Pressable>
      </Animated.View>
      {message && <Text style={styles.msg}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8 },
  input: {
    flex: 1,
    minWidth: 0,
    height: 40,
    borderWidth: 1,
    borderColor: C.panelEdge,
    backgroundColor: '#0f0c0a',
    color: C.sand,
    paddingHorizontal: 12,
    fontFamily: F.ja,
    fontSize: 16,
  },
  btn: {
    height: 40,
    paddingHorizontal: 16,
    justifyContent: 'center',
    backgroundColor: '#3b2e1e',
    borderWidth: 1,
    borderColor: C.gold,
  },
  btnText: { color: C.sand, fontFamily: F.ja, fontSize: 15, letterSpacing: 2 },
  msg: { color: C.danger, fontFamily: F.ja, fontSize: 13, marginTop: 6 },
});
