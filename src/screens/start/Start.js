/**
 * BeetSoft Co., Ltd
 * Splash Screen
 *
 */

import NetInfo from '@react-native-community/netinfo';
import NetworkStatus from '../../commons/NetworkStatus';
import React from 'react';
import {
  StyleSheet,
  View,
  TouchableHighlight,
  AsyncStorage,
  Alert,
  Platform,
  NativeModules,
} from 'react-native';
import Constants, {
  BASE_URL,
  API_GET_DATA_USER_WITH_ID,
  ratio,
} from '../../constants/Constants';
import Navigation from '../navigation/Navigation';
import {getUserInfo, insertUser} from '../../databases/StorageServices';
import SoundService from '../../soundService/SoundService';
import FastImage from '@d11/react-native-fast-image';
import moment from 'moment';
const {ToastModule, TaskManager} = NativeModules;

export default class Start extends React.Component {
  state = {
    userInfo: [],
    showButton: false,
    bgVolume: '',
    seVolume: '',
    fbDay: '000000000',
    isConnected: true,
    dateInstall: '',
  };

  componentDidMount() {
    this.getFbDay();
    this.getDataUser();
    this.getDateInstallApp();

    NetInfo.addEventListener(connectionInfo => {
      this.setState({
        isConnected: connectionInfo.isConnected,
      });
      if (connectionInfo.isConnected) {
        this.fetchDataUser();
      }
    });
  }

  async getDateInstallApp() {
    try {
      const key1 = await AsyncStorage.getItem('dateInstall');

      if (key1 !== null) {
        // We have data!!
        this.setState({dateInstall: key1}, () => {
          console.log('dateInstall => ', this.state.dateInstall);
        });
      }
    } catch (error) {
      console.log('Error retrieving data' + error);
    }
  }

  async saveDateInstall(date) {
    try {
      await AsyncStorage.setItem('dateInstall', date);
    } catch (error) {
      console.log('Error saving data' + error);
    }
  }

  fetchDataUser() {
    setTimeout(() => {
      if (this.state.userInfo.length !== 0) {
        // getData user từ api sau đó lưu vào DB, chuyển đến màn hình Home
        fetch(BASE_URL + API_GET_DATA_USER_WITH_ID, {
          method: 'POST',
          headers: new Headers({
            'Content-Type': 'application/x-www-form-urlencoded',
          }),
          body: 'ID='.concat(this.state.userInfo[0].ID),
        })
          .then(response => {
            return response.json();
          })
          .then(responseJson => {
            if (responseJson.length !== 0) {
              if (this.state.userInfo[0].ID !== responseJson[0].ID) {
                const newUser = {
                  ID: responseJson[0].ID,
                  UserId: responseJson[0].UserId,
                  PassWord: responseJson[0].PassWord,
                  Name: responseJson[0].Name,
                  Mrs: responseJson[0].Mrs,
                  Sex: responseJson[0].Sex,
                  Year: responseJson[0].Year,
                  DelFg: responseJson[0].DelFg,
                };
                insertUser(newUser)
                  .then(() => {
                    Navigation.gotoHome();
                  })
                  .catch(error => {
                    alert(error);
                  });
              } else {
                Navigation.gotoHome();
              }
            } else {
              console.log('Get data error!');
              alert('Get data error!');
            }
          })
          .catch(error => {
            console.log('Error =>>> ' + error);
          });
        //chưa có user info => thêm nút bắt đầu ở màn splash
        // luồng màn splash có nút => màn tutorial ->  màn policy -> màn nhập user info
        // this.setState({showButton: true});
        // Navigation.navigateToRegisterInfo();
      } else if (Platform.OS === 'ios') {
        TaskManager.getAllTask({}, (error, task) => {
          if (error) {
            // console.log(`err: ${JSON.stringify(error)}`);
          } else {
            if (task.name === '') {
              //chưa có user info => thêm nút bắt đầu ở màn splash
              // luồng màn splash có nút => màn tutorial ->  màn policy -> màn nhập user info
              this.setState({showButton: true});
              // Navigation.navigateToRegisterInfo();
            }
            // getData user từ api sau đó lưu vào DB, chuyển đến màn hình Home
            else {
              fetch(BASE_URL + API_GET_DATA_USER_WITH_ID, {
                method: 'POST',
                headers: new Headers({
                  'Content-Type': 'application/x-www-form-urlencoded',
                }),
                body: 'ID='.concat(task.name),
              })
                .then(response => {
                  return response.json();
                })
                .then(responseJson => {
                  if (responseJson.length !== 0) {
                    // if (this.state.userInfo[0].ID !== responseJson[0].ID) {
                    const newUser = {
                      ID: responseJson[0].ID,
                      UserId: responseJson[0].UserId,
                      PassWord: responseJson[0].PassWord,
                      Name: responseJson[0].Name,
                      Mrs: responseJson[0].Mrs,
                      Sex: responseJson[0].Sex,
                      Year: responseJson[0].Year,
                      DelFg: responseJson[0].DelFg,
                    };
                    insertUser(newUser)
                      .then(() => {
                        Navigation.gotoHome();
                      })
                      .catch(error => {
                        console.log(error);
                      });
                    // } else {
                    Navigation.gotoHome();
                    // }
                  } else {
                    console.log('Get data error!');
                  }
                })
                .catch(error => {
                  console.log('Error =>>> ' + error);
                });
            }
            // alert(`sc: ${JSON.stringify(task.name)}`)
          }
        });
      } else {
        //chưa có user info => thêm nút bắt đầu ở màn splash
        // luồng màn splash có nút => màn tutorial ->  màn policy -> màn nhập user info
        this.setState({showButton: true});
        // Navigation.navigateToRegisterInfo();
      }
    }, 1000);
  }

  async getFbDay() {
    try {
      const fbDay = await AsyncStorage.getItem('fbDay');
      if (fbDay != null) {
        this.setState({
          fbDay: fbDay,
        });
      } else {
        try {
          await AsyncStorage.setItem('fbDay', this.state.fbDay);
        } catch (error) {
          console.log('save data error => ' + error);
        }
      }
    } catch (error) {
      console.log('Error retrieving data' + error);
    }
  }

  async getDataUser() {
    getUserInfo()
      .then(userInfo => {
        this.setState({
          userInfo: userInfo,
        });
      })
      .catch(error => {
        console.error(error);
      });
  }

  UNSAFE_componentWillMount() {}

  navigationSplash() {
    if (this.state.showButton === true) {
      return (
        <TouchableHighlight
          style={styles.button}
          onPress={async () => {
            await SoundService.loadSoundSel('sel.mp3');
            Navigation.gotoIntroduceInfo();
            this.saveDateInstallApp();
          }}>
          <FastImage
            style={styles.background}
            source={require('../../resources/images/C-1_01.png')}
            resizeMode={FastImage.resizeMode.cover}
          />
        </TouchableHighlight>
      );
    }
  }

  saveDateInstallApp() {
    if (this.state.dateInstall === '' || this.state.dateInstall === null) {
      var jobDate = new Date();
      if (jobDate.getMonth() <= 0) {
        jobDate.setMonth(-1);
      } else {
        jobDate.setDate(-1);
      }
      this.saveDateInstall(
        moment(jobDate)
          .format('YYYYMM')
          .concat('00000000'),
      );
    }
  }

  render() {
    return (
      <View style={styles.screen}>
        <FastImage
          resizeMode={FastImage.resizeMode.stretch}
          source={
            ratio
              ? require('../../resources/images/18x9/splash_18x9.png')
              : require('../../resources/images/16x9/splash_16x9.png')
          }
          style={styles.background}>
          {!this.state.isConnected ? <NetworkStatus /> : null}
          {this.navigationSplash()}
          {/* {Navigation.gotoHome()} */}
        </FastImage>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  logo: {
    flex: 1,
    resizeMode: 'contain',
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
