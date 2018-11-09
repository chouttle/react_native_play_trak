import * as firebase from 'firebase';
const baseStyles = require('../styles/baseStyles');
import React from 'react';
import {
    StyleSheet,
    Alert,
    View,
    Text,
    Image,
    TextInput,
    ScrollView,
    TouchableOpacity,
    Linking,
    Button, KeyboardAvoidingView
} from 'react-native';

import FormValidation from 'tcomb-form-native'

const Form = FormValidation.form.Form;

const formStyles = {
    ...Form.stylesheet,
    formGroup: {
        normal: {
            marginBottom: 10
        },
    },
    controlLabel: {
        normal: {
            color: "black",
            fontSize: 18,
            marginBottom: 7,
            fontWeight: '600'
        },
        // Style applied when a validation error occours
        error: {
            color: 'red',
            fontSize: 18,
            marginBottom: 7,
            fontWeight: '600'
        }
    }
};

export default class Registration extends React.Component {

    constructor(props) {
        super(props);
        // formStyles.textbox.normal.backgroundColor = 'white';
        // formStyles.textbox.error.backgroundColor = 'white';
        // formStyles.select.normal.backgroundColor = 'white';
        // formStyles.pickerContainer.normal.backgroundColor = 'white';
        // formStyles.select.error.backgroundColor = 'white';
        // Email Validation
        let valid_email = FormValidation.refinement(
            FormValidation.String, function (email) {
                var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
                return re.test(email);
            }
        );

        // Password Validation - Min of 6 chars
        let valid_password = FormValidation.refinement(
            FormValidation.String, function (password) {
                return password.length >= 6;
            }
        );

        // Year Validation
        let valid_year_of_birth = FormValidation.refinement(
            FormValidation.String, function (str ) {
                let num = Number(str);
                // Needs to be an integer, no floating point edge case
                if (!Number.isInteger(num)) {
                    return false;
                }
                return 1900 <= num && num <= 2018;
            }
        );
        // Enums implemented as a picker
        let valid_gender = FormValidation.enums({
            M: "Male",
            F: "Female"
        });

        let form_fields = FormValidation.struct({
            Email: valid_email,
            Password: valid_password,
            YearOfBirth: valid_year_of_birth,
            Gender: valid_gender
        });

        // Initial state
        this.state = {
            loading: false,
            error: '',
            email: '',
            password: '',
            gender: '',
            year_of_birth: '',
            form_fields: form_fields,
            form_values: {},
            form_options: this.getFormOptions()
        }
    }

    getFormOptions () {
        let form_options =  {
            fields: {
                Email: { error: 'Please enter a valid email' },
                YearOfBirth: { error: 'Please enter a valid year of birth' },
                Password: {
                    error: 'Your password must be at least 6 characters',
                    secureTextEntry: true,
                },
                Gender: {
                    error: "Please select your gender"
                }
            },
            stylesheet: formStyles
        };
        return form_options;
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
                error: error,
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
            yob: this.state.year_of_birth,
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
        return (
            <KeyboardAvoidingView style={{flex: 1}} keyboardVerticalOffset={65} behavior="padding" enabled>
                <ScrollView style={baseStyles.scrollViewContainer}>
                    <Form
                        ref="form"
                        type={this.state.form_fields}
                        value={this.state.form_values}
                        options={this.state.form_options}
                        onChange={(form_values) => {this.setState({ form_values })}/>

                    <View style={baseStyles.signupButton}>
                        <Button style={baseStyles.signupButtonText}
                                title="Sign up"
                                onPress={() => {
                                    const value = this.refs.form.getValue();
                                    // Form has been validated
                                    if (value) {
                                        this.setState({
                                            email: value.Email,
                                            password: value.Password,
                                            year_of_birth: value.YearOfBirth,
                                            gender: value.Gender
                                        });
                                        this.createUserInFirebase();
                                    }
                                }}
                        />
                        <Text style={baseStyles.errorText}> {this.state.error}</Text>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        );
    }
}

