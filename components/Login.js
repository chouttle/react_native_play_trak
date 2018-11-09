import React from 'react';
import * as firebase from 'firebase';
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


import FormValidation from 'tcomb-form-native'

const Form = FormValidation.form.Form;

const formStyles = {
    ...Form.stylesheet,
    formGroup: {
        normal: {
            marginBottom: 10,
        },
    },
    controlLabel: {
        normal: {
            color: "black",
            fontSize: 18,
            marginBottom: 7,
            fontWeight: '600',
        },
        // Style applied when a validation error occours
        error: {
            color: 'red',
            fontSize: 18,
            marginBottom: 7,
            fontWeight: '600',
        }
    },
    // textbox: {
    //     normal: {
    //         backgroundColor: 'white'
    //     },
    //     error: {
    //         backgroundColor: 'white'
    //     }
    // },
    // select: {
    //     normal: {
    //         backgroundColor: 'white'
    //     },
    //     error: {
    //         backgroundColor: 'white'
    //     }
    // },
    // pickerContainer: {
    //     normal: {
    //         backgroundColor: 'white'
    //     },
    //     error: {
    //         backgroundColor: 'white'
    //     }
    // }
};

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

        let form_fields = FormValidation.struct({
            Email: valid_email,
            Password: valid_password,
        });

        // Initial state
        this.state = {
            loading: false,
            error: '',
            email: '',
            password: '',
            userId: '',
            form_fields: form_fields,
            form_values: {},
            form_options: this.getFormOptions()
        }

        // this.state = {
        //     textEmail: '',
        //     textPwd: '',
        //     userId: '',
        //     error: '',
        //     loading: false
        // };
    }

    
    getFormOptions () {
        let form_options =  {
            fields: {
                Email: { error: 'Please enter a valid email' },
                Password: {
                    error: 'Your password must be at least 6 characters',
                    secureTextEntry: true,
                }
            },
            stylesheet: formStyles
        };
        return form_options;
    }

    _signInAsync(){
        this.setState({
            error: '',
            loading: true
        });
        firebase.auth().signInWithEmailAndPassword(this.state.email, this.state.passowrd).then(async () => {
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
                <Text style={baseStyles.titleMsg}>Play & Trak
                    </Text>
                    <View style={{ justifyContent: 'center', alignItems: 'center'}}>
                        <Image style={{ flexShrink: 1}}
                               resizeMode='contain'
                               source={require('../assets/dices.png')}
                        />
                    </View>
                    <Form
                        ref="form"
                        type={this.state.form_fields}
                        value={this.state.form_values}
                        options={this.state.form_options}
                        onChange={(form_values) => this.setState({form_values})}/>

                    <View style={baseStyles.signupButton}>
                        <Button style={baseStyles.signupButtonText}
                                title="Log in"
                                onPress={() => {
                                    const value = this.refs.form.getValue();
                                    // Form has been validated
                                    if (value) {
                                        this.setState({
                                            email: value.Email,
                                            password: value.Password,
                                        });
                                        this._signInAsync();
                                    }
                                }}
                        />
                        <Text style={baseStyles.noAccountText}>You don't have an account? Create one!</Text>
                        <Button style={baseStyles.signupButtonText}
                                title="Register"
                                onPress={() => {this.props.navigation.navigate('Register');}}
                        />
                        
                        <Text style={baseStyles.errorText}> {this.state.error}</Text>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        );
    }
}