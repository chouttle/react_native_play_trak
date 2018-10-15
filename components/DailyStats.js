import React from 'react';
import {ActivityIndicator, Button, Text, TextInput, View} from 'react-native';
import firebase from 'firebase';
const baseStyles = require('../styles/baseStyles');

class DailyStats extends React.Component {

    constructor(props) {
        super(props);
        const { params } = this.props.navigation.state;
        this.state = {
            budgetLimit: '0',
            timeLimit: '0',
            startingAmount: '?',
            endingAmount: '?',
            outcome: '?',
            error: '',
            loading: false
        };
        this.setState({
            error: '',
            loading: true
        });
        const user = firebase.auth().currentUser;
        const userPath = `/users/${user.uid}`;
        firebase.database().ref(userPath).once('value').then((snapshot) => {
            const userSettings = snapshot.val();
            this.setState({
                userSettings: userSettings,
                budgetLimit: userSettings.dailyLimit || '0',
                timeLimit: userSettings.dailyTimeLimit || '0',
                error: '',
                loading: false
            });
        }).catch((error) => {
            this.setState({
                error: 'Could not load user limits: ' + error,
                loading: false
            })
        });

        this.setState({
            loading: true
        });

        const gsPath = `/gamblingSession`;
        firebase.database().ref(gsPath).orderByChild('uid').equalTo(user.uid).once('value').then((snapshot) => {
            snapshot.forEach((session) => {
                const sessionDate = session.val().date;
                const newDate = new Date();
                if(sessionDate.length === 10){
                    const month = (newDate.getMonth() + 1) < 10 ? '0' + (newDate.getMonth() + 1) : '' + (newDate.getMonth() + 1);
                    const day = newDate.getDate() < 10 ? '0' + newDate.getDate() : '' + newDate.getDate();
                    const year = '' + new Date().getFullYear();
                    const sessionMonth = sessionDate.substring(5, 7);
                    const sessionDay = sessionDate.substring(8, 10);
                    const sessionYear = sessionDate.substring(0, 4);

                    if(year === sessionYear && month === sessionMonth && day === sessionDay) {
                        const sessionOutcome = session.val().outcome;
                        const sessionStartingAmount = session.val().startingAmount;
                        const sessionEndingAmount = session.val().finalAmount;
                        if(typeof sessionOutcome !== 'undefined'){
                            if (this.state.outcome === '?' ) {
                                this.setState({outcome: sessionOutcome});
                            } else {
                                this.setState({outcome: this.state.outcome + sessionOutcome});
                            }
                        }
                        if(typeof sessionStartingAmount !== 'undefined'){
                            if(this.state.startingAmount === '?') {
                                this.setState({startingAmount: parseInt(sessionStartingAmount)});
                            } else {
                                this.setState({startingAmount: this.state.startingAmount + parseInt(sessionStartingAmount)});
                            }
                        }
                        if(typeof sessionEndingAmount !== 'undefined'){
                            if(this.state.endingAmount === '?') {
                                this.setState({endingAmount: parseInt(sessionEndingAmount)});
                            } else {
                                this.setState({endingAmount: this.state.endingAmount + parseInt(sessionEndingAmount)});
                            }
                        }
                    }
                } else {
                }
            });
            if(this.state.outcome === '?'){
                this.setState({outcome: 0});
            }
            if(this.state.startingAmount === '?'){
                this.setState({startingAmount: 0});
            }
            if(this.state.endingAmount === '?'){
                this.setState({endingAmount: 0});
            }
            this.setState({
                error: '',
                loading: false
            });
        }).catch((error) => {
            this.setState({
                error: 'Could not load your daily stats: ' + error,
                loading: false
            });
        });
    }

    updateLimits(){
        this.setState({
            error: '',
            loading: true
        });
        const user = firebase.auth().currentUser;
        const userPath = `/users/${user.uid}`;
        const userSettings = this.state.userSettings;
        userSettings.dailyLimit = this.state.budgetLimit;
        userSettings.dailyTimeLimit = this.state.timeLimit;
        this.setState({userSettings: userSettings});
        firebase.database().ref(userPath).update({
            dailyLimit: this.state.budgetLimit,
            dailyTimeLimit: this.state.timeLimit
        }).then(() => {
            this.setState({
                error: 'Success!',
                loading: false
            });
            setTimeout(() => {
                this.setState({
                    error: '',
                    loading: false
                });
            }, 5000)
        }).catch((error) => {
            this.setState({
                error: 'Could not save user data: ' + error,
                loading: false
            });
        });
    }

    //cannot be static!
    outcomeColor(outcome) {
        if(outcome === 0){
            return 'black';
        } else if(outcome > 0){
            return 'green';
        } else if(outcome < 0){
            return 'red';
        }
    }

    render() {
        return (
            <View style={baseStyles.container}>
                <Text style={baseStyles.homeText}>Today</Text>
                <Text style={baseStyles.centeredText}>Sum of starting amounts: {this.state.startingAmount || 'No data'}</Text>
                <Text style={baseStyles.centeredText}>Sum of ending amounts: {this.state.endingAmount || 'No data'}</Text>
                <Text style={baseStyles.centeredText}>
                    Outcome: <Text style={{color: this.outcomeColor(this.state.outcome)}}>{this.state.outcome || 'No outcome'}</Text>
                </Text>


                <Text style={[baseStyles.welcomeMsg, baseStyles.centeredText]}>Update your daily limits: </Text>
                <Text style={baseStyles.centeredText}>Daily budget limit ($)</Text>
                <View style={baseStyles.textInputView}>
                    <TextInput style={baseStyles.textInput} underlineColorAndroid='white' placeholder='Budget Limit ($)' value={this.state.budgetLimit + ''} onChangeText={(budgetLimit) => this.setState({budgetLimit})}/>
                </View>
                <Text style={baseStyles.centeredText}>Daily time limit (minutes)</Text>
                <View style={baseStyles.textInputView}>
                    <TextInput style={baseStyles.textInput} underlineColorAndroid='white' placeholder='Time Limit (minutes)' value={this.state.timeLimit + ''} onChangeText={(timeLimit) => this.setState({timeLimit})}/>
                </View>
                <View style={baseStyles.buttonsView}>
                    <Button title='Update the limits' onPress={this.updateLimits.bind(this)}/>
                </View>
                <Text style={baseStyles.centeredText}>{this.state.error}</Text>
                {this.state.loading &&
                <View style={baseStyles.loading}>
                    <ActivityIndicator size='large' />
                </View>
                }
            </View>
        );
    }
}

export default DailyStats;
