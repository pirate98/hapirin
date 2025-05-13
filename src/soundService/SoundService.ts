import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Sound from 'react-native-sound';

export default class SoundService {
  static loadSoundBg = async (audio: string): Promise<Sound> => {
    const bgVolume = await AsyncStorage.getItem('backgroundMusic');

    return new Promise((resolve, reject) => {
      const sound = new Sound(
        audio,
        Platform.OS === 'ios' ? Sound.MAIN_BUNDLE : Sound.MAIN_BUNDLE,
        error => {
          if (error) {
            console.log('Failed to load the background sound', error);
            reject(error);
          } else {
            sound.setVolume(bgVolume ? parseFloat(bgVolume) / 100 : 0.5);
            sound.setNumberOfLoops(-1);
            console.log('Loaded background sound successfully');
            resolve(sound);
          }
        }
      );
    });
  };

  static loadSoundSel = async (audio: string): Promise<void> => {
    const seVolume = await AsyncStorage.getItem('soundEffect');

    return new Promise((resolve, reject) => {
      const audioBtn = new Sound(
        audio,
        Platform.OS === 'ios' ? Sound.MAIN_BUNDLE : Sound.MAIN_BUNDLE,
        error => {
          if (error) {
            console.log('Failed to load selection sound', error);
            reject(error);
          } else {
            audioBtn.setVolume(seVolume ? parseFloat(seVolume) / 100 : 0.5);
            audioBtn.play(success => {
              if (success) {
                console.log('Selection sound played successfully');
              } else {
                console.log('Playback failed for selection sound');
              }
              audioBtn.release();
              resolve();
            });
          }
        }
      );
    });
  };

  static loadSoundCombo = async (audio: string): Promise<Sound> => {
    const seVolume = await AsyncStorage.getItem('soundEffect');

    return new Promise((resolve, reject) => {
      const soundCombo = new Sound(
        audio,
        Platform.OS === 'ios' ? Sound.MAIN_BUNDLE : Sound.MAIN_BUNDLE,
        error => {
          if (error) {
            console.log('Failed to load combo sound', error);
            reject(error);
          } else {
            soundCombo.setVolume(seVolume ? parseFloat(seVolume) / 100 : 0.5);
            resolve(soundCombo);
          }
        }
      );
    });
  };
}
