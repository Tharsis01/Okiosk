import React, { useEffect, useState, Component } from 'react';
import { 
  Platform,
  Button,
  FlatList,
  View, 
  Image, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  ActivityIndicator, 
  Slider,
  TextInput,
  Keyboard,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView
} from 'react-native';
import Voice from '@react-native-voice/voice';
import Tts from 'react-native-tts';
import SplashScreen from 'react-native-splash-screen';

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

import QRCode from 'react-native-qrcode-svg';

import Modal from "react-native-modal";

const wait = (timeout) => {
  return new Promise(resolve => setTimeout(resolve, timeout));
}

const App = () => {
  useEffect(() => {
    //SplashScreen.show();
    setTimeout(() => {
        SplashScreen.hide();
    }, 500);
    _onPressSpeech();
  }, [])
  const [result, setResult] = useState('')
  const [isLoading, setLoading] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [qrvalue, setQrvalue] = useState('');
  const [refreshing, setRefreshing] = React.useState(false);
  const _onPressSpeech = () => {
    Tts.stop();
    Tts.speak('안녕하세요', {
      androidParams: {
        KEY_PARAM_PAN: -1,
        KEY_PARAM_VOLUME: 0.5,
        KEY_PARAM_STREAM: 'STREAM_MUSIC',
      },
    });
  }

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  Tts.setDefaultLanguage('ko-KR');
  Tts.addEventListener('tts-start', event => console.log('start', event));
  Tts.addEventListener('tts-finish', event => console.log('finish', event));
  Tts.addEventListener('tts-cancel', event => console.log('cancel', event));

  useEffect(() => {
    //SplashScreen.hide(); //스플래쉬
    Voice.onSpeechStart = onSpeechStartHandler;
    Voice.onSpeechEnd = onSpeechEndHandler;
    Voice.onSpeechResults = onSpeechResultsHandler;
    //_onPressSpeech();
    
    return () => {
      
      Voice.destroy().then(Voice.removeAllListeners);
    }
  }, [])

  const onSpeechStartHandler = (e) => {
    console.log("start handler==>>>", e)
  }
  const onSpeechEndHandler = (e) => {
    setLoading(false)
    console.log("stop handler", e)
  }
  const onSpeechResultsHandler = (e) => {
    let text = e.value[0]
    setResult(text)
    setIsLoaded(true)
    try {
    fetch('http://10.0.2.2:5000/order', {    // 이부분 바꾸기(현재 로컬)
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      order: text
    }),

  })
  .then(response => response.json())
  .then(response => {
    if (response.OK == 'false') {
          // throw Error("could not fetch the data that resource");
          Tts.speak('다시 한번 말씀해주세요', {
            androidParams: {
              KEY_PARAM_PAN: -1,
              KEY_PARAM_VOLUME: 0.5,
              KEY_PARAM_STREAM: 'STREAM_MUSIC',
            },
          });
          setTimeout(() => {
            setModalVisible(isModalVisible);
            onRefresh()
            startRecording()
        }, 1500);
      }
    setQrvalue(response.answer)
  })} catch (error) {
    console.log("error raised", error)
  };
    setModalVisible(true)
    console.log("speech result handler", e)
  }

  const startRecording = async () => {
    setLoading(true)
    try {
      await Voice.start('ko-KR')
    } catch (error) {
      console.log("error raised", error)
    }
  }

  const stopRecording = async () => {
    try {
      await Voice.stop()
    } catch (error) {
      console.log("error raised", error)
    }
  }
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    wait(2000).then(() => setRefreshing(false));
  }, []);

  return (
    <View style={styles.container}>
      <SafeAreaView>
        <Text style={styles.headingText}>Okiosk</Text>
       
        <View style={styles.textInputStyle}>

        {isLoading ? <ActivityIndicator size="large" color="red" />

          :

          <TouchableOpacity
            style={{
              alignSelf: 'center',
            }}
            onPress={startRecording}            
          >

            <Image
             source={require('./mic_button.png')}
             style={{ width: 50, height: 50 }}
            />
          </TouchableOpacity>
          }

          <Modal isVisible={isModalVisible}
          onBackdropPress={toggleModal}
          onRefresh={onRefresh}
          >
            <View style= {styles.qrbackground}
              >
            <View style={{
              width: 300,
              height: 300,
              color: 'white',
              
              }}>

            <QRCode 
              value={qrvalue ? qrvalue : 'NA'}
              size={300}
              color="black"
              backgroundColor="white"
              justifyContent= "center"
              alignItems = "center"
            />
            </View>
            </View>
          </Modal>
        </View>
        <Text style={styles.resultText}>{result}{'\n'}</Text>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    padding: 10,
  },
  titleStyle: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  textStyle: {
    textAlign: 'center',
    margin: 10,
  },
  buttonStyle: {
    backgroundColor: '#51D8C7',
    borderWidth: 0,
    color: '#FFFFFF',
    borderColor: '#51D8C7',
    alignItems: 'center',
    borderRadius: 5,
    marginTop: 30,
    padding: 10,
  },
  buttonTextStyle: {
    color: '#FFFFFF',
    paddingVertical: 10,
    fontSize: 16,
  },
  headingText: {
    alignSelf: 'center',
    marginVertical: 26,
    fontWeight: 'bold',
    fontSize: 20
  },
  resultText: {
    alignSelf: 'center',
    marginVertical: 26,
    fontWeight: 'bold',
    fontSize: 12
  },
  qrbackground: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "white",
    borderColor: "black",
    marginTop: 160,
    marginBottom: 160,
    borderRadius: 50
  },
});

export default App;