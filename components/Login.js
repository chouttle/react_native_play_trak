import React from 'react';
import firebase from 'firebase';
import '../assets/dices.png';
import {
    AsyncStorage,
    Text,
    TextInput,
    Button,
    Platform,
    View,
    ActivityIndicator,
    ScrollView,
    KeyboardAvoidingView, Image
} from 'react-native';
const baseStyles = require("../styles/baseStyles");

export default class LoginPage extends React.Component {

    constructor(props) {
        super(props);
        // Initialize Firebase
        const config = {
            apiKey: "AIzaSyChhft1gQMOt5BmfObjtaAg-sel9nGoBHE",
            authDomain: "selfmonitoringgamblingapp.firebaseapp.com",
            databaseURL: "https://selfmonitoringgamblingapp.firebaseio.com",
            projectId: "selfmonitoringgamblingapp",
            storageBucket: "selfmonitoringgamblingapp.appspot.com",
            messagingSenderId: "91102348917"
        };

        //avoid reinitializing firebase when it has already been done.
        if (!firebase.apps.length) {
            firebase.initializeApp(config);
        }

        this.state = {
            textEmail: '',
            textPwd: '',
            userId: '',
            error: '',
            loading: false
        };
    }

    _signInAsync(){
        this.setState({
            error: '',
            loading: true
        });
        firebase.auth().signInWithEmailAndPassword(this.state.textEmail, this.state.textPwd).then(async () => {
            await AsyncStorage.setItem('userToken', firebase.auth().currentUser.uid);
            this.setState({
                error: 'Successful',
                loading: false
            });
            this.props.navigation.navigate('App');
        }).catch((error) => {
            this.setState({
                error: 'Could not login: ' + error,
                loading: false
            });
        });
    };

    render() {
        return (
            <KeyboardAvoidingView style={{flex: 1}} keyboardVerticalOffset={65} behavior="padding" enabled>
                <ScrollView style={baseStyles.scrollViewContainer}>
                    {/*<Text style={baseStyles.welcomeMsg}>Welcome to */}
                    <Text style={baseStyles.titleMsg}>Play & Trak
                        {/*<Text style={baseStyles.pAndT}>Play&Trak</Text>*/}
                    </Text>
                    <View style={{ justifyContent: 'center', alignItems: 'center'}}>
                        <Image style={{ flexShrink: 1}}
                               resizeMode='contain'
                               source={require('../assets/dices.png')}
                        />
                    </View>
                    <View style={baseStyles.textInputContainer}>
                        <View style={baseStyles.textInputs}>
                            <View style={baseStyles.textInputView}>
                                <TextInput style={baseStyles.textInput} placeholderTextColor={Platform.select({ios: '', android: 'white'})} underlineColorAndroid="white" placeholder="User Email" onChangeText={(textEmail) => this.setState({textEmail})}/>
                            </View>
                            <View style={baseStyles.textInputView}>
                                <TextInput style={baseStyles.textInput} placeholderTextColor={Platform.select({ios: '', android: 'white'})} underlineColorAndroid="white" placeholder="Password" secureTextEntry={true} onChangeText={(textPwd) => this.setState({textPwd})}/>
                            </View>
                        </View>
                    </View>
                    <View style={baseStyles.buttonsView}>
                        <Button title="Login" containerViewStyle={{width: "auto"}} onPress={this._signInAsync.bind(this)}/>
                    </View>
                    <Text style={baseStyles.centeredText}>{this.state.error}</Text>
                    <Text style={baseStyles.noAccountText}>You don't have an account? Create one!</Text>
                    <View style={baseStyles.buttonsView}>
                        <Button title="Register" containerViewStyle={{width: "auto", marginLeft: 0}} onPress={() => {this.props.navigation.navigate('Register');}}/>
                    </View>
                </ScrollView>
                {this.state.loading &&
                <View style={baseStyles.loading}>
                    <ActivityIndicator size='large' />
                </View>
                }
            </KeyboardAvoidingView>

        );
    }
}