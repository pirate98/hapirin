import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  TouchableHighlight,
  Alert,
  Platform,
  NativeModules,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import FastImage from '@d11/react-native-fast-image';
import moment from 'moment';

import Constants, { BASE_URL, API_GET_DATA_USER_WITH_ID, ratio } from '../../constants/Constants';
import NetworkStatus from '../../commons/NetworkStatus';
import { getUserInfo, insertUser } from '../../databases/StorageServices';
import SoundService from '../../soundService/SoundService';
import { useNavigation } from '@react-navigation/native';


const { ToastModule, TaskManager } = NativeModules;

const Start: React.FC = () => {
  const navigation = useNavigation();
  const [userInfo, setUserInfo] = useState<any>([]);
  const [showButton, setShowButton] = useState(false);
  const [fbDay, setFbDay] = useState('000000000');
  const [isConnected, setIsConnected] = useState(true);
  const [dateInstall, setDateInstall] = useState<string>('');

  useEffect(() => {
    getFbDay();
    getDataUser();
    getDateInstallApp();

    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected ?? false);
      if (state.isConnected) {
        fetchDataUser();
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const getDateInstallApp = async () => {
    try {
      const storedDate = await AsyncStorage.getItem('dateInstall');
      if (storedDate) {
        setDateInstall(storedDate);
        console.log('dateInstall => ', storedDate);
      }
    } catch (error) {
      console.log('Error retrieving dateInstall:', error);
    }
  };

  const saveDateInstall = async (date: string) => {
    try {
      await AsyncStorage.setItem('dateInstall', date);
    } catch (error) {
      console.log('Error saving dateInstall:', error);
    }
  };

  const saveDateInstallApp = () => {
    if (!dateInstall) {
      const jobDate = new Date();
      if (jobDate.getMonth() <= 0) {
        jobDate.setMonth(-1);
      } else {
        jobDate.setDate(-1);
      }
      const formattedDate = moment(jobDate).format('YYYYMM').concat('00000000');
      saveDateInstall(formattedDate);
    }
  };

  const fetchDataUser = () => {
    setTimeout(async () => {
      if (userInfo.length !== 0) {
        try {
          const res = await fetch(BASE_URL + API_GET_DATA_USER_WITH_ID, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: 'ID=' + (userInfo[0] as any).ID,
          });
          const data = await res.json();
          if (data.length) {
            if ((userInfo[0] as any).ID !== data[0].ID) {
              await insertUser(data[0]);
              navigation.navigate(Constants.SCREEN_HOME.KEY as never)
            } else {
              navigation.navigate(Constants.SCREEN_HOME.KEY as never)
            }
          } else {
            Alert.alert('Get data error!');
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else if (Platform.OS === 'ios') {
        TaskManager.getAllTask({}, async (error: any, task: any) => {
          if (!error && task.name) {
            try {
              const res = await fetch(BASE_URL + API_GET_DATA_USER_WITH_ID, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: 'ID=' + task.name,
              });
              const data = await res.json();
              if (data.length) {
                await insertUser(data[0]);
                navigation.navigate(Constants.SCREEN_HOME.KEY as never)
              } else {
                console.log('Get data error!');
              }
            } catch (e) {
              console.error('Error fetching user by task name:', e);
            }
          } else {
            setShowButton(true);
          }
        });
      } else {
        setShowButton(true);
      }
    }, 1000);
  };

  const getFbDay = async () => {
    try {
      const storedFbDay = await AsyncStorage.getItem('fbDay');
      if (storedFbDay) {
        setFbDay(storedFbDay);
      } else {
        await AsyncStorage.setItem('fbDay', fbDay);
      }
    } catch (error) {
      console.log('Error handling fbDay:', error);
    }
  };

  const getDataUser = async () => {
    try {
      const data = await getUserInfo();
      setUserInfo(data);
    } catch (error) {
      console.error('Error getting userInfo:', error);
    }
  };

  const renderNavigationButton = () => {
    if (showButton) {
      return (
        <TouchableHighlight
          style={styles.button}
          onPress={async () => {
            await SoundService.loadSoundSel('sel.mp3');
            navigation.navigate(Constants.SCREEN_INTRODUCE.KEY as never)
            saveDateInstallApp();
          }}
        >
          <FastImage
            style={styles.background}
            source={require('../../resources/images/C-1_01.png')}
            resizeMode={FastImage.resizeMode.cover}
          />
        </TouchableHighlight>
      );
    }
    return null;
  };

  return (
    <View style={styles.screen}>
      <FastImage
        resizeMode={FastImage.resizeMode.stretch}
        source={
          ratio
            ? require('../../resources/images/18x9/splash_18x9.png')
            : require('../../resources/images/16x9/splash_16x9.png')
        }
        style={styles.background}
      >
        {!isConnected && <NetworkStatus />}
        {renderNavigationButton()}
      </FastImage>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  background: {
    width: '100%',
    height: '100%',
  },
  button: {
    alignSelf: 'center',
    position: 'absolute',
    bottom: '7%',
    width: '100%',
    height: '9%',
    marginHorizontal: '20%',
  },
});

export default Start;
