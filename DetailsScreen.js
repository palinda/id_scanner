import React from 'react';
import { Image, StyleSheet, View, TouchableOpacity, Text, ScrollView, FlatList } from 'react-native';

export default class DetailsScreen extends React.Component {
    
    render() {
        return (
          <View style={styles.container}>
            <FlatList
                data={this.props.navigation.state.params.user}
                renderItem={({item}) => <View style={{flex: 1,flexDirection: 'row',justifyContent: 'space-between',padding: 5}}><Text>{item.Key}</Text><Text>{item.Value}</Text></View>}/>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        padding: 30
    }
});