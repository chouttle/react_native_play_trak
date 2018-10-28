import firebase from 'firebase'
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
  Button
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
      color: "#4267b2",
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
}

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
        FormValidation.String, function (str ) {
            let num = Number(str)
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
        Year: valid_year_of_birth,
        Gender: valid_gender
      })

    // Initial state
    this.state = {
      loading: false,
      error: '',
      email: '',
      password: '',
      gender: '',
      year: '',
      form_fields: form_fields,
      form_values: {},
      form_options: this.getFormOptions()
    }
  }
  
  getFormOptions () {
      let form_options =  {
        fields: {
          Email: { error: 'Please enter a valid email' },
          Year: { error: 'Please enter a valid year' },
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
            yob: this.state.year,
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
      <View style={styles.container}>
      <ScrollView>
      <Form
          ref="form"
          type={this.state.form_fields}
          value={this.state.form_values}
          options={this.state.form_options} />

        <View styles={styles.signupButton}>
        <Button style={styles.signupButtonText}
            title="Sign up"
            onPress={() => {
                const value = this.refs.form.getValue();
                // Form has been validated 
                if (value) {
                    this.setState({ 
                        email: value.Email,
                        password: value.Password,
                        year: value.Year,
                        gender: value.Gender
                    })
                   this.createUserInFirebase();
                }
            }}
        />
        <Text style={styles.errorText}> {this.state.error}</Text>
        </View>

      </ScrollView>
      </View>
    );
  }

}

const styles = StyleSheet.create({

container: {
    justifyContent: 'center',
    marginTop: 50,
    padding: 20,
    backgroundColor: '#ffffff',
  },
  signupButton: {
    marginBottom: 15,
    backgroundColor: '#bbb',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 5,
    alignItems: 'center',
    width: 250,
  },
  signupButtonText: {
    fontSize: 15,
    color: '#fff',
  },
  errorText: {
    color: 'red',
    fontSize: 18,
    marginBottom: 7,
    fontWeight: '600'
  }
});

