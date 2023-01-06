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
  Keyboard
} from 'react-native';
import Voice from '@react-native-voice/voice';
import Tts from 'react-native-tts';

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';


import { Storage } from "@aws-amplify/storage"


const App = () => {
  // Storage.put("test2.txt", "File content", {
  //   progressCallback(progress) {
  //     console.log(`Uploaded: ${progress.loaded}/${progress.total}`);
  //   },
  // });

  const [result, setResult] = useState('')
  const [isLoading, setLoading] = useState(false)

  Tts.setDefaultLanguage('ko-KR');
  Tts.addEventListener('tts-start', event => console.log('start', event));
  Tts.addEventListener('tts-finish', event => console.log('finish', event));
  Tts.addEventListener('tts-cancel', event => console.log('cancel', event));

  useEffect(() => {
    Voice.onSpeechStart = onSpeechStartHandler;
    Voice.onSpeechEnd = onSpeechEndHandler;
    Voice.onSpeechResults = onSpeechResultsHandler;

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
      Storage.put("test2.txt", result, {
        progressCallback(progress) {
          console.log(`Uploaded: ${progress.loaded}/${progress.total}`);
        },
      });
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

  const upload = (event) => {
    Storage.put('test1.txt', result)
        .then(event => console.log('result from successful upload: ', event))
        .catch(error => console.log('error uploading to s3:', error));
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
    wait(1000).then(() => setRefreshing(false));
  }, []);

  return (
    <View style={styles.container}>
      <SafeAreaView>
        <Text style={styles.headingText}>Okiosk</Text>
       
        <View style={styles.textInputStyle}>

        <TouchableOpacity
            style={{
              alignSelf: 'center',
            }}
           onPress2={_onPressSpeech}
          >

          </TouchableOpacity>
        {isLoading ? <ActivityIndicator size="large" color="red" />

          :

          <TouchableOpacity
            style={{
              alignSelf: 'center',
            }}
           onPress={startRecording}
          >

            <Image
             source={{ uri: 'https://www.pngfind.com/pngs/m/61-615737_microphone-free-vector-icon-designed-by-freepik-icon.png' }}
             style={{ width: 50, height: 50 }}
            />
          </TouchableOpacity>
          
          }
          <TouchableOpacity
            style={{
              alignSelf: 'center',
            }}
            onPress={upload}
          >

            <Image
             source={{ uri: 'https://www.pngfind.com/pngs/m/61-615737_microphone-free-vector-icon-designed-by-freepik-icon.png' }}
             style={{ width: 50, height: 50 }}
            />
          </TouchableOpacity>
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
});

export default App;