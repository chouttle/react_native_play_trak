import React from 'react';
import firebase from 'firebase';
import {Text, Button, View, Picker, ActivityIndicator, ActionSheetIOS, Platform, TouchableOpacity} from 'react-native';
const baseStyles = require('../styles/baseStyles');

export default class UserSettings extends React.Component {
    yearsOfBirth = [];
    yearsOfBirthPicks = [];

    constructor(props) {
        super(props);
        for(let i = new Date().getFullYear() - 18; i >= 1900; i--) {
            this.yearsOfBirth.push(i + '');
            this.yearsOfBirthPicks.push(<Picker.Item value={i} label={i + ''} />);
        }
        const user = firebase.auth().currentUser;
        let userSettings = {};
        const userPath = `/users/${user.uid}`;
        this.state = {
            error: '',
            loading: true,
            yob: null
        };
        firebase.database().ref(userPath).once('value').then((snapshot) => {
            userSettings = snapshot.val();
            this.setState({
                user: user,
                userSettings: userSettings,
                textEmail: '',
                yob: userSettings ? userSettings.yob : null,
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
                                <Text  style={[baseStyles.touchBtnText, baseStyles.whiteText]}>Date of Birth</Text>
                        })}
                        <View style={[baseStyles.textInputView]}>
                            {Platform.select({
                                ios:
                                    <TouchableOpacity style={baseStyles.touchBtn} onPress={this.iosPickYearOfBirth.bind(this)}>
                                        <Text style={baseStyles.touchBtnText}>
                                            {this.state.yob === '' ? "Year of Birth" : "Born in " + this.state.yob}
                                        </Text>
                                    </TouchableOpacity>,
                                android:
                                    <Picker
                                        style={baseStyles.whiteText}
                                        prompt='Year of Birth'
                                        mode='dropdown'
                                        selectedValue={this.state.yob}
                                        onValueChange={(itemValue, itemIndex) => this.setState({yob: itemValue})}>
                                        <Picker.Item style={baseStyles.whiteText} label='Year of Birth' value='' />
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
                <Text style={baseStyles.centeredText}>{this.state.error}</Text>
                {this.state.loading &&
                <View style={baseStyles.loading} pointerEvents='none'>
                    <ActivityIndicator size='large' />
                </View>
                }
            </View>
        );
    }
}