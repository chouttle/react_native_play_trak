import React from 'react';
import {Text, TextInput, Button, View, Picker, AsyncStorage, ActivityIndicator} from 'react-native';
const baseStyles = require('../styles/baseStyles');
import firebase from 'firebase';

export default class Registration extends React.Component {

    constructor(props) {
        super(props);
        const { params } = this.props.navigation.state;
        this.state = {
            email: '',
            password: '',
            gender: '',
            yob: '',
            error: '',
            loading: false
        }
    }

    createUserInFirebase(){
        this.setState({
            error: '',
            loading: true
        });
        firebase.auth().createUserWithEmailAndPassword(this.state.email, this.state.password).then((authData) => {
            this.setState({
                error: 'Successful!',
                loading: false
            });
            this.writeUserData(authData.uid);
        }).catch((error) => {
            this.setState({
                error: 'Could not login: ' + error,
                loading: false
            });
        });
    }

    writeUserData(uid){
        this.setState({
            error: '',
            loading: true
        });
        const userPath = `/users/${uid}`;
        const userSettings = {
            yob: this.state.yob,
            sex: this.state.gender
        };
        firebase.database().ref(userPath).set(userSettings).then(async () => {
            try{
                await AsyncStorage.setItem('userToken', uid);
            } catch(error){
                this.setState({
                    error: 'Could not store user token: ' + error + '.\nYour account has been created, try using the Login Page.',
                    loading: false
                });
            }
            this.setState({
                error: 'Successful!',
                loading: false
            });
            this.props.navigation.navigate('App');
        }).catch((error) => {
            this.setState({
                error: 'Could not save user data: ' + error,
                loading: false
            });
        });
    }

    render() {
        let yearsOfBirth = [];
        for(let i = 1900; i <= new Date().getFullYear() - 18; i++) {
            yearsOfBirth.push(<Picker.Item value={i} label={i + ''} />);
        };
        return (
            <View style={baseStyles.container}>
                <Text style={baseStyles.welcomeMsg}>Make an account</Text>
                <View style={baseStyles.textInputContainer}>
                    <View style={baseStyles.textInputs}>
                        <View style={baseStyles.textInputView}>
                            <TextInput style={baseStyles.textInput} underlineColorAndroid='white' placeholder='User Email' onChangeText={(email) => this.setState({email})}/>
                        </View>
                        <View style={baseStyles.textInputView}>
                            <TextInput style={baseStyles.textInput} underlineColorAndroid='white' placeholder='Password' secureTextEntry={true} onChangeText={(password) => this.setState({password})}/>
                        </View>
                        <View style={baseStyles.textInputView}>
                            {/*TODO: for ios, it should be a button, with a modal that opens onPress, and inside that modal the 'Picker'*/}
                            <Picker
                                style={baseStyles.pickerInput}
                                itemStyle={baseStyles.pickerLabel}
                                prompt='Gender'
                                mode='dropdown'
                                selectedValue={this.state.gender}
                                onValueChange={(itemValue, itemIndex) => this.setState({gender: itemValue})}>
                                <Picker.Item label='Gender' value='' />
                                <Picker.Item label='Male' value='Male' />
                                <Picker.Item label='Female' value='Female' />
                            </Picker>
                        </View>
                        <View style={baseStyles.textInputView}>
                            <Picker
                                prompt='Year of Birth'
                                mode='dropdown'
                                selectedValue={this.state.yob}
                                onValueChange={(itemValue, itemIndex) => this.setState({yob: itemValue})}>
                                <Picker.Item label='Year of Birth' value='' />
                                {yearsOfBirth}
                            </Picker>
                        </View>
                    </View>
                </View>
                <View style={baseStyles.buttonsView}>
                    <Button containerViewStyle={{width: 'auto', marginLeft: 0}} title='Register' onPress={this.createUserInFirebase.bind(this)}/>
                </View>
                <Text style={baseStyles.centeredText}> {this.state.error} </Text>
                {this.state.loading &&
                <View style={baseStyles.loading}>
                    <ActivityIndicator size='large' />
                </View>
                }
            </View>
        );
    }
}