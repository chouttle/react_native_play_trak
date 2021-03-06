import React from "react";
import {ActivityIndicator, AsyncStorage, StatusBar, View} from "react-native";
import firebase from 'firebase';

export default class AuthLoadingScreen extends React.Component {
    constructor() {
        super();
        AsyncStorage.clear();
        this._bootstrapAsync();
    }

    // Fetch the token from storage then navigate to our appropriate place
    _bootstrapAsync = async () => {
        const userToken = await AsyncStorage.getItem('userToken');
        // This will switch to the App screen or Auth screen and this loading
        // screen will be unmounted and thrown away.
        console.log('redirected to auth worked');
        console.log('and user token is ' + userToken);
        this.props.navigation.navigate(userToken && firebase.auth.currentUser ? 'App' : 'Auth');
    };

    // Render any loading content that you like here
    render() {
        return (
            <View style={AsyncStorage.container}>
                <ActivityIndicator />
                <StatusBar barStyle="default" />
            </View>
        );
    }
}