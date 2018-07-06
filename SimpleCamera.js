import React from 'react';
import { Text, View, TouchableOpacity, Vibration, StyleSheet } from 'react-native';
import { Constants, Camera, FileSystem, Permissions } from 'expo';
import { Ionicons } from '@expo/vector-icons';
import { cv } from 'opencv.js';

const endpoint = 'http://192.168.1.128:8080/';

export default class SimpleCamera extends React.Component {
  state = {
    hasCameraPermission: null,
    type: Camera.Constants.Type.back,
    photoId: 1,
    faceDetectionClassifications: Camera.Constants.FaceDetection.Classifications.all,
    passportOk: false 
  };

  async componentWillMount() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({ hasCameraPermission: status === 'granted' });
  }
  _handleBarCodeRead = ({ type, data }) => {
    alert(`Bar code with type ${type} and data ${data} has been scanned!`);
  }
  sendHttp = (prefix, params, cb) => {

    const data = new FormData();
    for(let k in params) {
      data.append(k, params[k]);
    }

    console.log('Req Url:' + (endpoint + prefix));

    fetch(endpoint + prefix, {
      method: 'post',
      body: data
    })
    .then( res => res.json())
    .then(
      (res) => cb(res, undefined), 
      (err) => cb(undefined, err)
    )
  }
  
  setCamera = (ref) => {
      this.camera = ref;
  };

  onFacesDetected = ({ faces }) => {
    // console.log(faces);
    if (this.state.passportOk)
      return;
      
    if (faces.length > 0) {
      console.log('rollAngle', faces[0].rollAngle, 'yawAngle', faces[0].yawAngle);
      if (faces[0].rollAngle < 2 && faces[0].yawAngle < 10) {
        console.log('Image found ...!!!');
        this.takePicture();
        this.setState({
          passportOk: true,
        });
      }
    }
  }
  

  uploadImage2 = (imageUri, cb) => {
    console.log('Image Uri:', imageUri);
    this.sendHttp('ocr', {
      // 'token': token,
      // 'sdktype': sdkType,
      // 'sessionid': sessionID,
      // 'imageside': side,
      'image': {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'testPhoto.jpg'
      }
    }, cb);
  };

  takePicture = async  () => {
    if (this.camera) {
      console.log('Take picture');
      let photo = await this.camera.takePictureAsync();
      
      this.onPictureSaved(photo);
    }
  };

  onPictureSaved = (data) => {
        const filename = `${FileSystem.documentDirectory}photos/Photo_${this.state.photoId}.jpg`;
        console.log('Saved picture', filename);

        FileSystem.moveAsync({
          from: data.uri,
          to: filename,
        }).then(() => {

        this.uploadImage2( filename, (resp2, err2) => {

          console.log(resp2, err2);
          if (err2 != undefined) {
            console.log('Photo upload failed:' + err2);
            return;
          }
          let user = [];

          for(const key in resp2) {
            user.push({'Key': key, 'Value': resp2[key]});
          }

          this.props.navigation.navigate(
            'Detail',
            { user },
          );
        });
        
        this.setState({
          photoId: this.state.photoId + 1,
        });
        Vibration.vibrate();
      });     
  };

  render() {
    const { hasCameraPermission } = this.state;
    if (hasCameraPermission === null) {
      return <View />;
    } else if (hasCameraPermission === false) {
      return <Text>No access to camera</Text>;
    } else {
      return (
        <View style={{ flex: 1 }}>
        
          <Camera style={{ flex: 1 }} 
            type={this.state.type}  
            faceDetectionClassifications={this.state.faceDetectionClassifications}
            onFacesDetected={this.onFacesDetected}
            style={{
                flex: 1,
                backgroundColor: 'transparent',
                flexDirection: 'row',
                alignSelf: 'flex-end'
              }}
            ref={this.setCamera}>
            <View style={{
            flex: 1,
            backgroundColor: 'transparent',
            flexDirection: 'row',
            alignSelf: 'flex-end',
            justifyContent: 'center'
            }}>
            { this.state.passportOk && <Ionicons name="ios-checkmark-circle-outline" size={70} color="white" />}
            </View>
          </Camera>
        </View>
      );
    }
  }
}
