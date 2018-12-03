import React from 'react';
import firebase from 'firebase';
import {Text, Button, View, Picker, ActivityIndicator, ActionSheetIOS, Platform, TouchableOpacity} from 'react-native';
const baseStyles = require('../styles/baseStyles');

export default class UserSettings extends React.Component {
    yearsOfBirth = [];
    yearsOfBirthPicks = [];

    constructor(props) {
        super(props);
        //avoid reinitializing firebase when it has already been done.
        if (!firebase.apps.length) {
            const config = {
                apiKey: "AIzaSyChhft1gQMOt5BmfObjtaAg-sel9nGoBHE",
                authDomain: "selfmonitoringgamblingapp.firebaseapp.com",
                databaseURL: "https://selfmonitoringgamblingapp.firebaseio.com",
                projectId: "selfmonitoringgamblingapp",
                storageBucket: "selfmonitoringgamblingapp.appspot.com",
                messagingSenderId: "91102348917"
            };
            firebase.initializeApp(config);
            if(!firebase.auth().currentUser) {
                this.props.navigation.navigate('Login');
            }
        }
        for(let i = new Date().getFullYear() - 18; i >= 1900; i--) {
            this.yearsOfBirth.push(i + '');
            this.yearsOfBirthPicks.push(<Picker.Item value={i} key={i} label={i + ''} />);
        }
        this.state = {
            error: '',
            loading: true,
            yob: null
        };
    }

    componentDidMount() {
        const user = firebase.auth().currentUser;
        let userSettings = {};
        const userPath = `/users/${user.uid}`;
        firebase.database().ref(userPath).once('value').then((snapshot) => {
            userSettings = snapshot.val();
            this.setState({
                user: user,
                userSettings: userSettings,
                textEmail: '',
                yob: userSettings ? Number(userSettings.yob) : null,
                userId: '',
                error: '',
                gender: userSettings ? userSettings.sex : '',
                loading: false
            });
        }).catch((error) => {
            this.setState({
                error: 'Could not load the user settings: ' + error,
                loading: false
            })
        });
    }

    saveUserSettingsToFirebase(){
        this.setState({
            error: '',
            loading: true
        });
        if (this.state.yob === '' || this.state.yob === null) {
            this.setState({
                error: 'Please select your year of birth.',
                loading: false
            });
            return;
        }
        if(this.state.gender === '') {
            this.setState({
                error: 'Please select your gender.',
                loading: false
            });
            return;
        }
        const userPath = `/users/${this.state.user.uid}`;
        const userSettings = this.state.userSettings;
        userSettings.yob = this.state.yob;
        userSettings.gender = this.state.gender;
        this.setState({
            userSettings: userSettings
        });
        firebase.database().ref(userPath).update({
            yob: this.state.yob,
            sex: this.state.gender
        }).then(() => {
            this.setState({
                error: '',
                loading: false
            });
        }).catch((error) => {
            this.setState({
                error: 'Could not save user data: ' + error,
                loading: false
            });
        });
    }

    iosPickGender() {
        ActionSheetIOS.showActionSheetWithOptions({
                options: ['Male', 'Female'],
            },
            (buttonIndex) => {
                this.setState({gender: buttonIndex === 0 ? 'Male' : 'Female'})
            });
    }

    iosPickYearOfBirth() {
        ActionSheetIOS.showActionSheetWithOptions({
                options: ['Cancel'].concat(this.yearsOfBirth),
                cancelButtonIndex: 0
            },
            (buttonIndex) => {
                if(buttonIndex !== 0)
                    this.setState({yob: Number(this.yearsOfBirth[buttonIndex - 1])})
            });
    }

    render() {
        return (
            <View style={baseStyles.container}>
                <Text style={baseStyles.welcomeMsg}>Modify your user settings</Text>
                <View style={baseStyles.textInputContainer}>
                    <View style={baseStyles.textInputs}>
                        <View style={baseStyles.textInputView}>
                            {Platform.select({
                                ios: null,
                                android:
                                    <Text style={[baseStyles.touchBtnText, baseStyles.whiteText]}>Gender</Text>
                            })}
                            {Platform.select({
                                ios:
                                    <TouchableOpacity style={baseStyles.touchBtn} onPress={this.iosPickGender.bind(this)}>
                                        <Text style={[baseStyles.touchBtnText, baseStyles.whiteText]}>
                                            {this.state.gender === '' ? "Gender" : this.state.gender}
                                        </Text>
                                    </TouchableOpacity>,
                                android:
                                    <Picker
                                        style={baseStyles.whiteText}
                                        prompt='Gender'
                                        mode='dropdown'
                                        selectedValue={this.state.gender}
                                        onValueChange={(itemValue, itemIndex) => this.setState({gender: itemValue})}>
                                        <Picker.Item style={baseStyles.whiteText} label='Gender' value='' />
                                        <Picker.Item style={baseStyles.whiteText} label='Male' value='Male' />
                                        <Picker.Item style={baseStyles.whiteText} label='Female' value='Female' />
                                    </Picker>
                            })}
                        </View>
                        {Platform.select({
                            ios: null,
                            android:
                                <Text style={[baseStyles.touchBtnText, baseStyles.whiteText, {marginTop: 20}]}>Year of Birth</Text>
                        })}
                        <View style={[baseStyles.textInputView]}>
                            {Platform.select({
                                ios:
                                    <TouchableOpacity style={baseStyles.touchBtn} onPress={this.iosPickYearOfBirth.bind(this)}>
                                        <Text style={baseStyles.touchBtnText}>
                                            {!this.state.yob ? "Year of Birth" : "Born in " + this.state.yob}
                                        </Text>
                                    </TouchableOpacity>,
                                android:
                                    <Picker
                                        style={baseStyles.whiteText}
                                        prompt='Year of Birth'
                                        mode='dropdown'
                                        selectedValue={this.state.yob}
                                        onValueChange={(itemValue, itemIndex) => this.setState({yob: itemValue})}>
                                        <Picker.Item style={baseStyles.whiteText} label='Year of Birth' key='Year of Birth' value='' />
                                        {this.yearsOfBirthPicks}
                                    </Picker>
                            })}
                        </View>
                    </View>
                </View>
                <View style={{marginVertical: 20}}/>
                <View style={baseStyles.buttonsView}>
                    <Button title='Save' containerViewStyle={{width: 'auto'}} onPress={this.saveUserSettingsToFirebase.bind(this)}/>
                </View>
                <Text style={baseStyles.errorText}>{this.state.error}</Text>
                {this.state.loading &&
                <View style={baseStyles.loading} pointerEvents='none'>
                    <ActivityIndicator size='large' />
                </View>
                }
            </View>
        );
    }
}