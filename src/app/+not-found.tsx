import { Redirect } from 'expo-router';

/** 想定外のパス（静的ホスティング先の index.html など）はタイトルへ戻す */
export default function NotFound() {
  return <Redirect href="/history" />;
}
