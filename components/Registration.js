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
    Button, KeyboardAvoidingView, ActivityIndicator
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
            color: "white",
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
    },
    textbox: {
        normal: {
            ...Form.stylesheet.textbox.normal,
            backgroundColor: 'white'
        },
        error: {
            ...Form.stylesheet.textbox.error,
            backgroundColor: 'white'
        }
    },
    select: {
        normal: {
            ...Form.stylesheet.select.normal,
            backgroundColor: 'white'
        },
        error: {
            ...Form.stylesheet.select.error,
            backgroundColor: 'white'
        }
    },
    pickerContainer: {
        normal: {
            ...Form.stylesheet.pickerContainer.normal,
            backgroundColor: 'white'
        },
        error: {
            ...Form.stylesheet.pickerContainer.error,
            backgroundColor: 'white'
        }
    }
};

export default class Registration extends React.Component {

    constructor(props) {
        super(props);
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
            FormValidation.Number, function (num ) {
                // let num = Number(str);
                // Needs to be an integer, no floating point edge case
                if (!Number.isInteger(num)) {
                    return false;
                }
                return 1850 <= num && num <= (new Date()).getFullYear();
            }
        );


        // Enums implemented as a picker
        let valid_gender = FormValidation.enums({
            Male: "Male",
            Female: "Female"
        });

        let valid_strict_positive_number = FormValidation.refinement(
            FormValidation.Number, function (num ) {
                // let num = Number(str);
                // Needs to be an integer, no floating point edge case
                if (!Number.isFinite(num)) {
                    return false;
                }
                return num > 0;
            }
        );

        let form_fields = FormValidation.struct({
            Email: valid_email,
            Password: valid_password,
            YearOfBirth: valid_year_of_birth,
            Gender: valid_gender,
            DailyBudgetLimit: valid_strict_positive_number,
            DailyTimeLimit: valid_strict_positive_number,
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
                Email: {
                    keyboardType: 'email-address',
                    error: 'Please enter a valid email'
                },
                YearOfBirth: { returnKeyType: 'done', error: 'Please enter a valid year of birth ([1850 - ' + (new Date()).getFullYear() +  '])' },
                Password: {
                    error: 'Your password must be at least 6 characters',
                    secureTextEntry: true,
                },
                Gender: {
                    error: "Please select your gender"
                },
                DailyBudgetLimit: {
                    returnKeyType: 'done',
                    label: 'Daily Budget Limit ($)',
                    error: "Please enter a number above 0"
                },
                DailyTimeLimit: {
                    returnKeyType: 'done',
                    label: 'Daily Budget Limit (min)',
                    error: 'Please enter a number above 0'
                },
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
        firebase.auth().createUserWithEmailAndPassword(this.state.email.trim(), this.state.password).then((authData) => {
            this.setState({
                error: 'Successful!',
                loading: false
            });
            this.writeUserData(authData.user.uid);
        }).catch((error) => {
            this.setState({
                error: 'error is: ' + error,
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
            sex: this.state.gender,
            dailyLimit: this.state.budgetLimit,
            dailyTimeLimit: this.state.timeLimit
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
            <KeyboardAvoidingView style={{flex: 1}} keyboardVerticalOffset={80} behavior="padding" enabled>
                <ScrollView style={baseStyles.scrollViewContainer}>
                    <Form
                        ref="form"
                        type={this.state.form_fields}
                        value={this.state.form_values}
                        options={this.state.form_options}
                        onChange={(form_values) => {this.setState({ form_values })}}/>

                    <View style={baseStyles.signupButton}>
                        <Button style={baseStyles.signupButtonText}
                                title="Sign up"
                                onPress={() => {
                                    const value = this.refs.form.getValue();
                                    // Form has been validated
                                    if (value) {
                                        this.setState({
                                            email: value.Email.trim(),
                                            password: value.Password,
                                            year_of_birth: value.YearOfBirth,
                                            gender: value.Gender,
                                            budgetLimit: value.DailyBudgetLimit,
                                            timeLimit: value.DailyTimeLimit
                                        });
                                        setTimeout(() => {
                                            this.createUserInFirebase();
                                        }, 0);
                                    }
                                }}
                        />
                        <Text style={baseStyles.errorText}> {this.state.error}</Text>
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
