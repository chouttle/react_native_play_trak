import React from 'react';
import firebase from 'firebase';
import {Text, Button, View, Picker, ActivityIndicator} from 'react-native';
const baseStyles = require('../styles/baseStyles');

export default class UserSettings extends React.Component {

    constructor(props) {
        super(props);
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

    render() {
        let yearsOfBirth = [];
        for(let i = 1900; i <= new Date().getFullYear() - 18; i++) {
            yearsOfBirth.push(<Picker.Item value={i} label={i + ''} />);
        };
        return (
            <View style={baseStyles.container}>
                <Text style={baseStyles.welcomeMsg}>Modify your user settings</Text>
                <View style={baseStyles.textInputContainer}>
                    <View style={baseStyles.textInputs}>
                        <View style={baseStyles.textInputView}>
                            <Text style={baseStyles.centeredText}>Gender</Text>
                            {/*TODO: for ios, it should be a button, with a modal that opens onPress, and inside that modal the 'Picker'*/}
                            <Picker
                                prompt='Gender'
                                mode='dropdown'
                                selectedValue={this.state.gender}
                                onValueChange={(itemValue, itemIndex) => this.setState({gender: itemValue})}>
                                <Picker.Item label='Gender' value='' />
                                <Picker.Item label='Male' value='Male' />
                                <Picker.Item label='Female' value='Female' />
                            </Picker>
                        </View>
                        <Text  style={baseStyles.centeredText}>Date of Birth</Text>
                        <View style={[baseStyles.textInputView]}>
                            {/*TODO: for ios, it should (probably??) be a button, with a modal that opens onPress, and inside that modal the 'Picker'*/}
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