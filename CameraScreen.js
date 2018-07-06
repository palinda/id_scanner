import { Constants, Camera, FileSystem, Permissions } from 'expo';
import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Slider, Vibration } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const landmarkSize = 2;
const token = 'O81cf465af47fb33c912756187d2737ebs';
// const endpoint = 'https://orbitsdk.com/OrbitService/v3.0.0/index.php/orbit_Api/';
const endpoint = 'http://192.168.1.128:8080/';

const flashModeOrder = {
  off: 'on',
  on: 'auto',
  auto: 'torch',
  torch: 'off',
};

const wbOrder = {
  auto: 'sunny',
  sunny: 'cloudy',
  cloudy: 'shadow',
  shadow: 'fluorescent',
  fluorescent: 'incandescent',
  incandescent: 'auto',
};

export default class CameraScreen extends React.Component {
  state = {
    flash: 'off',
    zoom: 0,
    autoFocus: 'on',
    depth: 0,
    type: 'back',
    whiteBalance: 'auto',
    ratio: '16:9',
    ratios: [],
    photoId: 5,
    showGallery: false,
    photos: [],
    faces: [],
    permissionsGranted: false,
  };

  async componentWillMount() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({ permissionsGranted: status === 'granted' });
  }

  componentDidMount() {
    FileSystem.makeDirectoryAsync(FileSystem.documentDirectory + 'photos').catch(e => {
      console.log(e, 'Directory exists');
    });
  }

  getRatios = async () => {
    const ratios = await this.camera.getSupportedRatios();
    return ratios;
  };

  toggleView() {
    this.setState({
      showGallery: !this.state.showGallery,
    });
  }

  changeView(viewName) {
    this.props.navigation.navigate('Camera');
  }

  toggleFacing() {
    this.setState({
      type: this.state.type === 'back' ? 'front' : 'back',
    });
  }

  toggleFlash() {
    this.setState({
      flash: flashModeOrder[this.state.flash],
    });
  }

  setRatio(ratio) {
    this.setState({
      ratio,
    });
  }

  toggleWB() {
    this.setState({
      whiteBalance: wbOrder[this.state.whiteBalance],
    });
  }

  toggleFocus() {
    this.setState({
      autoFocus: this.state.autoFocus === 'on' ? 'off' : 'on',
    });
  }

  zoomOut() {
    this.setState({
      zoom: this.state.zoom - 0.1 < 0 ? 0 : this.state.zoom - 0.1,
    });
  }

  zoomIn() {
    this.setState({
      zoom: this.state.zoom + 0.1 > 1 ? 1 : this.state.zoom + 0.1,
    });
  }

  setFocusDepth(depth) {
    this.setState({
      depth,
    });
  }

  sendHttp(prefix, params, cb) {

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

  createNewSession(sdkType, subType, cb) {
    this.sendHttp('request_new_session', {
      'token': token,
      'sdktype': sdkType,
      'subtype': subType
    }, cb);
  }

  uploadImage(sessionID, sdkType, imageUri, side, cb) {
    console.log('Image Uri:', imageUri);
    this.sendHttp('uploadImageFile', {
      'token': token,
      'sdktype': sdkType,
      'sessionid': sessionID,
      'imageside': side,
      'imagefile': {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'testPhoto.jpg'
      }
    }, cb);
  }

  uploadImage2(imageUri, cb) {
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
  }

  getCardInfo(sessionID, cb) {
    this.sendHttp('get_card_information', {
      'token': token,
      'sessionid': sessionID,
      'recSide': 'F'
    }, cb);
  }

  takePicture = async function() {
    if (this.camera) {
      this.camera.takePictureAsync({quality: 0.1}).then(data => {
        const filename = `${FileSystem.documentDirectory}photos/Photo_${this.state.photoId}.jpg`;
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

          // this.createNewSession('ORBIT_MRZ', 'PASSPORT', (response, err) => {
          //   if (err != undefined) {
          //     console.error(err);
          //     return;
          //   }
          //   console.log(response);
          //   this.uploadImage(response.session, 'ORBIT_MRZ', filename, 'F', (resp2, err2) => {
              
          //     console.log(resp2);
          //     if (err2 != undefined) {
          //       console.error(err2);
          //       return;
          //     }

          //     console.log(resp2);
          //     this.getCardInfo(response.session, (resp3, err3) => {
          //       if (err3 != undefined) {
          //         console.error(err3);
          //         return;
          //       }

          //       console.log(resp3);

          //       let user = [];
          //       resp3['CardInfo']['Analysis'].forEach(element => {
          //         user.push(element);
          //       });
          //       resp3['CardInfo']['CardData'].forEach(element => {
          //         user.push(element);
          //       });

          //       this.props.navigation.navigate(
          //         'Detail',
          //         { user },
          //       );
          //     });
          //   });
          // });
          
          this.setState({
            photoId: this.state.photoId + 1,
          });
          Vibration.vibrate();
        });
      });
    }
  };

  onFacesDetected = ({ faces }) => this.setState({ faces });
  onFaceDetectionError = state => console.warn('Faces detection error:', state);

  renderGallery() {
    return <GalleryScreen onPress={this.toggleView.bind(this)} />;
  }

  renderInitialScreen() {
    return <InitialScreen onPassport={this.changeView.bind(this)} />;
  }
  

  renderFace({ bounds, faceID, rollAngle, yawAngle }) {
    return (
      <View
        key={faceID}
        transform={[
          { perspective: 600 },
          { rotateZ: `${rollAngle.toFixed(0)}deg` },
          { rotateY: `${yawAngle.toFixed(0)}deg` },
        ]}
        style={[
          styles.face,
          {
            ...bounds.size,
            left: bounds.origin.x,
            top: bounds.origin.y,
          },
        ]}>
        <Text style={styles.faceText}>ID: {faceID}</Text>
        <Text style={styles.faceText}>rollAngle: {rollAngle.toFixed(0)}</Text>
        <Text style={styles.faceText}>yawAngle: {yawAngle.toFixed(0)}</Text>
      </View>
    );
  }

  renderLandmarksOfFace(face) {
    const renderLandmark = position =>
      position && (
        <View
          style={[
            styles.landmark,
            {
              left: position.x - landmarkSize / 2,
              top: position.y - landmarkSize / 2,
            },
          ]}
        />
      );
    return (
      <View key={`landmarks-${face.faceID}`}>
        {renderLandmark(face.leftEyePosition)}
        {renderLandmark(face.rightEyePosition)}
        {renderLandmark(face.leftEarPosition)}
        {renderLandmark(face.rightEarPosition)}
        {renderLandmark(face.leftCheekPosition)}
        {renderLandmark(face.rightCheekPosition)}
        {renderLandmark(face.leftMouthPosition)}
        {renderLandmark(face.mouthPosition)}
        {renderLandmark(face.rightMouthPosition)}
        {renderLandmark(face.noseBasePosition)}
        {renderLandmark(face.bottomMouthPosition)}
      </View>
    );
  }

  renderFaces() {
    return (
      <View style={styles.facesContainer} pointerEvents="none">
        {this.state.faces.map(this.renderFace)}
      </View>
    );
  }

  renderLandmarks() {
    return (
      <View style={styles.facesContainer} pointerEvents="none">
        {this.state.faces.map(this.renderLandmarksOfFace)}
      </View>
    );
  }

  renderNoPermissions() {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 10 }}>
        <Text style={{ color: 'white' }}>
          Camera permissions not granted - cannot open camera preview.
        </Text>
      </View>
    );
  }

  renderCamera() {
    return (
      <Camera
        ref={ref => {
          this.camera = ref;
        }}
        style={{
          flex: 1,
          backgroundColor: 'transparent',
          flexDirection: 'row',
          alignSelf: 'flex-end'
        }}
        type={this.state.type}>
      
        <View style={{
          flex: 1,
          backgroundColor: 'transparent',
          flexDirection: 'row',
          alignSelf: 'flex-end',
          justifyContent: 'center'
        }}>
          <TouchableOpacity            
            onPress={this.takePicture.bind(this)}>
            <Ionicons name="ios-radio-button-on" size={70} color="white" />
          </TouchableOpacity>
        </View>
        {this.renderFaces()}
        {this.renderLandmarks()}
      </Camera>
    );
  }



  render() {
    const cameraScreenContent = this.state.permissionsGranted
      ? this.renderCamera()
      : this.renderNoPermissions();
    // const content = this.state.view == undefined ? this.renderInitialScreen() : ;
    return <View style={styles.container}>{cameraScreenContent}</View>;
  }
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  navigation: {
    flex: 1,
  },
  gallery: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  flipButton: {
    flex: 0.3,
    height: 40,
    marginHorizontal: 2,
    marginBottom: 10,
    marginTop: 20,
    borderRadius: 8,
    borderColor: 'white',
    borderWidth: 1,
    padding: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flipText: {
    color: 'white',
    fontSize: 15,
  },
  item: {
    margin: 4,
    backgroundColor: 'indianred',
    height: 35,
    width: 80,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  picButton: {
    backgroundColor: 'darkseagreen',
  },
  galleryButton: {
    backgroundColor: 'indianred',
  },
  facesContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    left: 0,
    top: 0,
  },
  face: {
    padding: 10,
    borderWidth: 2,
    borderRadius: 2,
    position: 'absolute',
    borderColor: '#FFD700',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  landmark: {
    width: landmarkSize,
    height: landmarkSize,
    position: 'absolute',
    backgroundColor: 'red',
  },
  faceText: {
    color: '#FFD700',
    fontWeight: 'bold',
    textAlign: 'center',
    margin: 10,
    backgroundColor: 'transparent',
  },
  row: {
    flexDirection: 'row',
  },
});