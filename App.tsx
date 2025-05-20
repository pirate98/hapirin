/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect } from 'react';
import Route from './src/routes/Route';
import { AppState, DeviceEventEmitter } from 'react-native'

import SoundService from './src/soundService/SoundService';
import Constants from './src/constants/Constants';
import Sound from 'react-native-sound';

let audio: Sound;

function App(): React.JSX.Element {

  useEffect(() => {
    const initSound = async () => {
      audio = await SoundService.loadSoundBg('bgmnew.mp3')
            
      setTimeout(() => {
        audio.play()
      }, 100);
    }

    initSound()

    const appStateSubscription = AppState.addEventListener('change', handleAppStateChange)
    DeviceEventEmitter.addListener(
      Constants.EVENT_CHANGE_SOUND,
      callbackChangeVolume
    )

    return  () => appStateSubscription.remove()
  }, [])

  const handleAppStateChange = (currentAppState: string) => {
    if (currentAppState === 'background') {
      audio.pause()
    }
    if (currentAppState === 'active') {
      audio.play()
    }
  }

  const callbackChangeVolume = async ({ stop, restart }: { stop?: boolean, restart?: boolean }) => {
    try {
      if (restart) {
        // Stop and release the old audio if it's already loaded
        if (audio) {
          audio.stop();
          audio.release();
        }

        audio = await SoundService.loadSoundBg('bgmnew.mp3');

        setTimeout(() => {
          audio.play(success => {
            if (success) {
              console.log('Successfully started playing bgmnew.mp3');
            } else {
              console.log('Playback failed due to audio decoding errors');
            }
          });
        }, 100);
      }

      if (stop && audio) {
        audio.stop();
        audio.release();
        audio = undefined as unknown as Sound; // Optionally reset
      }
    } catch (err) {
      console.warn('Error in callbackChangeVolume:', err);
    }
  }


  return (
    <Route />
  );
}

export default App;
