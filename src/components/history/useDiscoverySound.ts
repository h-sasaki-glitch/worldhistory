import { useAudioPlayer } from 'expo-audio';
import { useCallback } from 'react';

const DISCOVER_SOUND = require('../../../assets/sounds/discover.wav');

/** 正解・発見時の短い効果音 */
export function useDiscoverySound(): () => void {
  const player = useAudioPlayer(DISCOVER_SOUND);
  return useCallback(() => {
    try {
      player.volume = 0.55;
      player.seekTo(0);
      player.play();
    } catch {
      // 音が鳴らなくても進行に影響させない
    }
  }, [player]);
}
