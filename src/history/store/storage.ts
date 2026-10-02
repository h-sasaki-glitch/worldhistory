import AsyncStorage from '@react-native-async-storage/async-storage';

/** 永続化レイヤー。失敗してもゲームは続行できるよう、例外は握りつぶして既定値を返す。 */

export const STORAGE_KEYS = {
  archive: 'epoch:v1:archive',
  stage: (stageId: string) => `epoch:v1:stage:${stageId}`,
} as const;

export async function loadJson<T>(key: string): Promise<T | undefined> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : undefined;
  } catch {
    return undefined;
  }
}

export async function saveJson(key: string, value: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // 保存失敗は次回の保存で回復する
  }
}
