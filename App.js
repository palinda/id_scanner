
import React from 'react';
import GalleryScreen from './GalleryScreen';
import CameraScreen from './CameraScreen';
import InitialScreen from './InitialScreen';
import { createStackNavigator } from 'react-navigation';
import DetailsScreen from './DetailsScreen';
import SimpleCamera from './SimpleCamera';

const App = createStackNavigator(
    {
        Initial: {
            screen: InitialScreen,
        },
        Detail: {
            screen: DetailsScreen
        },
        Camera: {
            screen: SimpleCamera
        }
    },
    {
        initialRouteName: 'Initial',
    }
);


export default class MainScreen extends React.Component {
    render() {    
        return <App />;
    }
}