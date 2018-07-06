import React from 'react';
import { Image, StyleSheet, View, TouchableOpacity, Text, ScrollView } from 'react-native';

export default class InitialScreen extends React.Component {
 
    render() {
        return (
          <View style={styles.container}>
            <TouchableOpacity style={styles.button} onPress={() => this.props.navigation.navigate('Camera')}>
                <Text style={{fontSize: 24}}>Passport</Text>
            </TouchableOpacity>
          </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        flex: 1,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
    button: {
        padding: 20,
    },
});