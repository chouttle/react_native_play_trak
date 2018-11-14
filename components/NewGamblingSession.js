import React from 'react';
import firebase from 'firebase';
import {
    Alert, Platform, Text, TextInput, Button, View, Picker, DatePickerIOS, DatePickerAndroid,
    TimePickerAndroid, ActivityIndicator, TouchableOpacity, ActionSheetIOS, Modal, KeyboardAvoidingView, ScrollView
} from 'react-native';
// import {Modal} from "expo";
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
            borderBottomColor: 'white'
        },
        // Style applied when a validation error occours
        error: {
            color: 'red',
            fontSize: 18,
            marginBottom: 7,
            fontWeight: '600',
        }
    }
};
let gameTypes = ['Poker', 'Blackjack', 'Craps', 'Roulette', 'Slots', 'Sports wagering',
'Lottery tickets/scratch cards', 'Other'];
let gameModes = ['Online', 'Offline'];

export default class NewGamblingSession extends React.Component {

    gameTypes = ['Poker', 'Blackjack', 'Craps', 'Roulette', 'Slots', 'Sports wagering',
        'Lottery tickets/scratch cards', 'Other'];
    gameModes = ['Online', 'Offline'];

    constructor(props) {
        super(props);

        let valid_positive_number = FormValidation.refinement(
            FormValidation.String, function (str ) {
                let num = Number(str);
                // Needs to be an integer, no floating point edge case
                if (!Number.isFinite(num)) {
                    return false;
                }
                return num >= 0;
            }
        );

        let form_fields = FormValidation.struct({
            Duration: valid_positive_number,
            StartAmount: valid_positive_number,
            EndAmount: valid_positive_number,
        });

        const { params } = this.props.navigation.state;
        const user = firebase.auth().currentUser;

        const currentDateTime = new Date();
        const startDateTime = new Date(currentDateTime);
        //removed because both times should be now() as decided
        // startDateTime.setHours(currentDateTime.getHours() - 1);

        this.state = {
            user: user,
            alertDailyLimit: {},
            alertNormativeFeedback: {},
            budgetLimit: '',
            timeLimit: '',
            previousSessions: [],
            todayTotalDuration: 0,
            todayTotalStartingAmounts: 0,
            totalNumSessions: 0,
            startAmount: 0,
            endAmount: 0,
            gameMode: '',
            gameType: '',
            userId: '',
            error: '',
            startDate: currentDateTime,
            endDate: currentDateTime,
            startTimeHours: startDateTime.getHours(),
            startTimeMinutes: startDateTime.getMinutes(),
            duration: 0,
            endTimeHours: currentDateTime.getHours(),
            endTimeMinutes: currentDateTime.getMinutes(),
            startDateModalVisible: false,
            loading: false,
            form_fields: form_fields,
            form_values: {},
            form_options: this.getFormOptions()
        };
    }

    
    getFormOptions () {
        let form_options =  {
            fields: {
                StartAmount: { error: 'Please enter a valid number' },
                EndAmount: { error: 'Please enter a valid number' },
                Duration: { error: 'Please enter a valid number' }
            },
            stylesheet: formStyles
        };
        return form_options;
    }

    clearForm() {
        this.setState({ form_values: undefined})
    }

    saveNewGamblingSession(){
        this.setState({
            error: '',
            loading: true
        });

        if (this.state.startAmount === '' || this.state.endAmount === '') {
            this.setState({
                error: "The start and end amount need to be set to a numeric value.",
                loading: false
            });
            return;
        }
        const gsPath = `/gamblingSession`;
        // const lastEndDate = new Date(this.state.endDate);
        const lastStartDate = new Date(this.state.startDate);
        if(Platform.OS === 'android'){
            // lastEndDate.setHours(this.state.endTimeHours);
            // lastEndDate.setMinutes(this.state.endTimeMinutes);
            lastStartDate.setHours(this.state.startTimeHours);
            lastStartDate.setMinutes(this.state.startTimeMinutes);
        }
        // const diff = lastEndDate - lastStartDate;
        // if(diff <= 0) {
        //     this.setState({
        //         error: "The end date and time must be after the start date and time.",
        //         loading: false
        //     });
        //     return;
        // }
        // const duration = Math.floor((diff/1000)/60);
        if (this.state.duration <= 0) {
            this.setState({
                error: "The duration needs to be a positive number and cannot be 0.",
                loading: false
            });
            return;
        }

        const newGamblingSessionRef = firebase.database().ref(gsPath).push().key;
        let stringMonth = (lastStartDate.getMonth() + 1) < 10 ? '0' + (lastStartDate.getMonth() + 1) : '' + (lastStartDate.getMonth() + 1);
        let stringDay = lastStartDate.getDate() < 10 ? '0' + lastStartDate.getDate() : lastStartDate.getDate();
        firebase.database().ref(gsPath + `/${newGamblingSessionRef}`).set({
            date: lastStartDate.getFullYear() + '-' + stringMonth + '-' + stringDay,
            duration: parseInt(this.state.duration, 10),
            email: this.state.user.email,
            // endTime: lastEndDate.getHours() + ':' + lastEndDate.getMinutes(),
            finalAmount: this.state.endAmount,
            outcome: this.state.endAmount - this.state.startAmount,
            game: this.state.gameType,
            key: newGamblingSessionRef,
            mode: this.state.gameMode,
            startTime: lastStartDate.getHours() + ':' + lastStartDate.getMinutes(),
            startingAmount: this.state.startAmount,
            uid: this.state.user.uid
        }).then(() => {
            // this.setState({
            //     error: 'Success!',
            //     loading: false
            // });
            // Alert.alert("Congratulations",
            //     "You have gambled",
            //     [
            //         {text: 'Ask me later', onPress: () => console.log('Ask me later pressed')},
            //         {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
            //         {text: 'OK', onPress: () => console.log('OK Pressed')}
            //     ],
            //     { cancelable: false });
            this.loadDataForAlert().then(() => {
                this.alertDailyLimits();
                this.alertNormativeFeedback();
                setTimeout(() => {
                    if(Platform.OS === 'ios'){
                        if(this.state.alertDailyLimit.title){
                            Alert.alert(this.state.alertDailyLimit.title,
                                this.state.alertDailyLimit.message,
                                this.state.alertDailyLimit.buttons);
                        }
                        if(this.state.alertNormativeFeedback.title) {
                            Alert.alert(this.state.alertNormativeFeedback.title,
                                this.state.alertNormativeFeedback.message,
                                this.state.alertNormativeFeedback.buttons);
                        }
                    } else {
                        if(this.state.alertDailyLimit.title && this.state.alertNormativeFeedback.title) {
                            Alert.alert(this.state.alertDailyLimit.title + ' && ' + this.state.alertNormativeFeedback.title,
                                this.state.alertDailyLimit.message + '\n\n' + this.state.alertNormativeFeedback.message,
                                this.state.alertDailyLimit.buttons);
                        } else if(this.state.alertDailyLimit.title) {
                            Alert.alert(this.state.alertDailyLimit.title,
                                this.state.alertDailyLimit.message,
                                this.state.alertDailyLimit.buttons);
                        } else if(this.state.alertNormativeFeedback.title) {
                            Alert.alert(this.state.alertNormativeFeedback.title,
                                this.state.alertNormativeFeedback.message,
                                this.state.alertNormativeFeedback.buttons);
                        }
                    }
                }, 0);
            });
            setTimeout(() => {
                this.setState({
                    error: '',
                    loading: false
                });
            }, 500000)
        }).catch((error) => {
            this.setState({
                error: 'Error: ' + error,
                loading: false
            });
        });
    }

    loadDataForAlert() {
        console.log("Entering loadDataForAlerts");
        const gsPath = `/gamblingSession`;
        return firebase.database().ref(gsPath).orderByChild('uid').equalTo(this.state.user.uid).once('value').then((snapshot) => {
            snapshot.forEach((session) => {
                if(session.val().date.length <= 10){
                    this.setState({ previousSession: this.state.previousSessions.push({
                            date: session.val().date || 'No date',
                            game: session.val().game || 'No game',
                            duration: session.val().duration || '?',
                            startingAmount: session.val().startingAmount || '?',
                            finalAmount: session.val().finalAmount || '?',
                            outcome: session.val().outcome || '?'
                        })
                    });
                    if(session.val().date === (new Date()).getFullYear() + '-' + ((new Date()).getMonth() + 1) + '-' + (new Date()).getDate()) {
                        this.setState({todayTotalDuration: this.state.todayTotalDuration + session.val().duration});
                        this.setState({todayTotalStartingAmounts: this.state.todayTotalStartingAmounts + session.val().startingAmount});
                    }
                    this.setState({totalNumSessions: this.state.totalNumSessions + 1});
                }
            });
            this.setState({previousSessions: this.state.previousSessions.sort(this.sortSessionsByLatestDate)});
            this.setState({
                error: '',
                loading: false
            });
            console.log("Leaving loadDataForAlerts");
            return 0;
        }).catch((error) => {
            this.setState({
                error: 'Could not load the data: ' + error,
                loading: false
            });
        });
    }

    sortSessionsByLatestDate(a,b) {
        if (new Date(a.date) > new Date(b.date))
            return -1;
        if (new Date(a.date) < new Date(b.date))
            return 1;
        return 0;
    }


    alertDailyLimits() {
        console.log("Entering alertDailyLimits");
        console.log("this.state.todayTotalDuration");
        console.log(this.state.todayTotalDuration);
        const userPath = `/users/${this.state.user.uid}`;
        firebase.database().ref(userPath).once('value').then((snapshot) => {
            const userSettings = snapshot.val();
            this.setState({
                budgetLimit: userSettings.dailyLimit || '0',
                timeLimit: userSettings.dailyTimeLimit || '0',
                error: '',
                loading: false
            });
            const overBudget = (0 - this.state.budgetLimit) > this.state.todayTotalStartingAmounts;
            const overTime = this.state.timeLimit < this.state.todayTotalDuration;
            console.log("overBudget: " + overBudget + " and overTime: " + overTime);
            if(overBudget && overTime) {
                this.setState({alertDailyLimit: {title: "Daily limits exceeded", message: "WARNING: You have exceeded your daily budget and time limit:\n" +
                            "Your daily budget is $" + this.state.budgetLimit + " and you have gambled $" + this.state.todayTotalStartingAmounts + " today.\n" +
                            "Your time limit is at " + this.state.timeLimit + " minutes and you spent " + this.state.todayTotalDuration + " minutes gambling today.",
                        buttons: [{text: "OK"}]}});
            } else if(overBudget) {
                this.setState({alertDailyLimit: {
                        title: "Daily budget exceeded",
                        message: "WARNING: You have exceeded your daily budget:\n" +
                            "Your daily budget is $" + this.state.budgetLimit + " and you have gambled $" + this.state.todayTotalStartingAmounts + " today.",
                        buttons: [{text: "OK"}]}});
            } else if(overTime) {
                this.setState({alertDailyLimit: {
                        title: "Daily time limit exceeded",
                        message: "WARNING: You have exceeded your daily time limit:\n" +
                            "Your time limit is at " + this.state.timeLimit + " minutes and you spent " + this.state.todayTotalDuration + " minutes gambling today.",
                        buttons: [{text: "OK"}]
                    }});
            }
        }).catch((error) => {
            this.setState({
                error: 'Could not load user limits: ' + error,
                loading: false
            })
        });
    }

    alertNormativeFeedback() {
        console.log("Entered Normativefeedback alert");
        this.setState({
            error: '',
            loading: false
        });
        const freq = 5;
        if(this.state.totalNumSessions === freq) {
            let totalAmount = 0;
            for(let i = 0; i < freq; i++) {
                totalAmount += Number(this.state.previousSessions[i].startingAmount);
            }
            const averageAmount = totalAmount / freq;
            if(averageAmount >= 50) {
                console.log("first Normativefeedback alert > 50");
                this.setState({alertNormativeFeedback: {
                        title: "Information",
                        message: "This is the second time you gamble. People your age and gender tend to gamble around $" + Math.floor(0.75 * averageAmount) +
                            " per session while you have gambled on average $" + averageAmount + ".",
                        buttons: [{text: "OK"}]
                    }});
            }
        } else if(this.state.totalNumSessions > freq && this.state.totalNumSessions % freq === 0) {
            let totalMostRecent = 0;
            let totalLeastRecent = 0;
            for(let i = 0; i < freq; i++) {
                totalMostRecent += Number(this.state.previousSessions[i].startingAmount);
            }
            for(let i = freq; i < 2*freq; i++) {
                totalLeastRecent += Number(this.state.previousSessions[i].startingAmount);
            }
            if(totalMostRecent > totalLeastRecent) {
                console.log("gambling going up alert");
                this.setState({alertNormativeFeedback: {
                        title: "Slow down!",
                        message: "You have gambled more ($" + totalMostRecent + ") in the past " + freq + " sessions" +
                            " than in the " + freq + " before that ($" + totalLeastRecent + ").",
                        buttons: [{text: "OK"}]
                    }});
            } else if(totalMostRecent < totalLeastRecent) {
                console.log("gambling going down alert");
                this.setState({alertNormativeFeedback: {
                        title: "Good job!",
                        message: "You have gambled less ($" + totalMostRecent + ") in the past " + freq + " sessions" +
                            " than in the " + freq + " before that ($" + totalLeastRecent + ").",
                        buttons: [{text: "OK"}]
                    }});
            }
        }
    }

    async openAndroidStartTimePicker(){
        try {
            const {action, hour, minute} = await TimePickerAndroid.open({
                hour: this.state.startTimeHours,
                minute: this.state.startTimeMinutes,
                is24Hour: false, // Will display '2 PM'
            });
            if (action !== TimePickerAndroid.dismissedAction) {
                // Selected hour (0-23), minute (0-59)
                this.setState({startTimeHours: hour});
                this.setState({startTimeMinutes: minute});
            }
        } catch ({code, message}) {
            console.warn('Cannot open time picker', message);
        }
    }

    async openAndroidStartDatePicker(){
        try {
            const {action, year, month, day} = await DatePickerAndroid.open({
                date: this.state.startDate
            });
            if (action !== DatePickerAndroid.dismissedAction) {
                // Selected year (2017), month (0 to 11) and date (1-31)
                let newDate = new Date(year, month, day);
                this.setState({startDate: newDate});
            }
        } catch ({code, message}) {
            console.warn('Cannot open date picker', message);
        }
    }

    _StartDatePickerComponent() {
        //TODO: for ios, it should be a button like for android, with a modal that opens onPress, and inside that modal the 'DatePickerIO'
        return Platform.select({
            ios:
                <TouchableOpacity style={baseStyles.touchBtn} onPress={this.toggleStartDateModal.bind(this, true)}>
                    <Text style={baseStyles.touchBtnText}>
                        {this.state.startDate.toDateString() + " - " + this.state.startTimeHours + ":" + this.state.startTimeMinutes}
                    </Text>
                </TouchableOpacity>
            ,
            android:
                <View style={baseStyles.buttonsView}>
                    <Button title={this.state.startDate.toDateString()} onPress={this.openAndroidStartDatePicker.bind(this)}/>
                </View>
        });
    }

    toggleStartDateModal(open) {
        this.setState({startDateModalVisible: open});
    }

    showStartDateModal() {
        this.toggleStartDateModal(true);
    }

    hideStartDateModal() {
        this.toggleStartDateModal(false);
    }

    modalStartDateComponent() {
        return Platform.select({
            ios:
                <Modal
                    animationType="slide"
                    transparent={false}
                    visible={this.state.startDateModalVisible}
                    onRequestClose={() => {
                        // something ?
                    }}>
                    <View style={baseStyles.container}>
                        <DatePickerIOS
                            date={this.state.startDate}
                            onDateChange={(startDate) => {
                                this.setState({startDate: startDate});
                                this.setState({startTimeHours: startDate.getHours()});
                                this.setState({startTimeMinutes: startDate.getMinutes()});
                            }}/>
                        <View style={baseStyles.buttonsView}>
                            <Button title="Done" containerViewStyle={{width: "auto"}} onPress={this.toggleStartDateModal.bind(this, false)}/>
                        </View>
                    </View>
                </Modal>,
            android: null
        });
    }

    _StartTimePickerComponent(){
        return Platform.select({
            ios: null,
            android:
                <View style={baseStyles.buttonsView}>
                    <Button title={this.state.startTimeHours + ':' + this.state.startTimeMinutes}  onPress={this.openAndroidStartTimePicker.bind(this)}/>
                </View>
        });
    }

    iosPickGameType() {
        ActionSheetIOS.showActionSheetWithOptions({
                options: this.gameTypes
            },
            (buttonIndex) => {
                this.setState({gameType: this.gameTypes[buttonIndex]})
            });
    }

    iosPickGameMode() {
        ActionSheetIOS.showActionSheetWithOptions({
                options: this.gameModes
            },
            (buttonIndex) => {
                this.setState({gameMode: this.gameModes[buttonIndex].toLowerCase()})
            });
    }

    render() {
        return (
            <KeyboardAvoidingView style={{flex: 1}} keyboardVerticalOffset={65} behavior="padding" enabled>
                <ScrollView style={baseStyles.scrollViewContainer}>
                    {this.modalStartDateComponent()}
                    <View style={{ flex: 1, height: 50}}></View>
                    {/*<Text style={baseStyles.welcomeMsg}>New Gambling Session</Text>*/}
                    {this._StartDatePickerComponent()}
                    <View style={{marginVertical: 5}}/>
                    {this._StartTimePickerComponent()}
                    {/*<View style={{marginVertical: 5}}/>*/}
                    {/*{this._EndDatePickerComponent()}*/}
                    <View style={{marginVertical: 5}}/>
                    <Form
                        ref="form"
                        type={this.state.form_fields}
                        value={this.state.form_values}
                        options={this.state.form_options}
                        onChange={(form_values) => {this.setState({ form_values })}}/>

                    <View style={baseStyles.textInputContainer}>
                        <View style={baseStyles.textInputs}>
                            <View style={baseStyles.textInputView}>
                                {Platform.select({
                                    ios:
                                        <TouchableOpacity style={baseStyles.touchBtn} onPress={this.iosPickGameMode.bind(this)}>
                                            <Text style={baseStyles.touchBtnText}>
                                                {this.state.gameMode === '' ? "Select a game mode" : this.state.gameMode.charAt(0).toUpperCase() + this.state.gameMode.substr(1)}
                                            </Text>
                                        </TouchableOpacity>,
                                    android:
                                        <Picker
                                            prompt="Select a game mode"
                                            mode="dropdown"
                                            selectedValue={this.state.gameMode}
                                            onValueChange={(itemValue, itemIndex) => this.setState({gameMode: itemValue})}>
                                            <Picker.Item style={baseStyles.whiteText} label="Select a game mode" value="" />
                                            <Picker.Item style={baseStyles.whiteText} label="Online" value="online" />
                                            <Picker.Item style={baseStyles.whiteText} label="Offline" value="offline" />
                                        </Picker>
                                })}
                            </View>
                            <View style={baseStyles.textInputView}>
                                {Platform.select({
                                    ios:
                                        <TouchableOpacity style={baseStyles.touchBtn} onPress={this.iosPickGameType.bind(this)}>
                                            <Text style={baseStyles.touchBtnText}>
                                                {this.state.gameType === '' ? "Select a game type" : this.state.gameType}
                                            </Text>
                                        </TouchableOpacity>,
                                    android:
                                        <Picker
                                            prompt="Select a game type"
                                            mode="dropdown"
                                            selectedValue={this.state.gameType}
                                            onValueChange={(itemValue, itemIndex) => this.setState({gameType: itemValue})}>
                                            <Picker.Item style={baseStyles.whiteText} label="Select a game type" value="Select a game type" />
                                            <Picker.Item style={baseStyles.whiteText} label="Poker" value="Poker" />
                                            <Picker.Item style={baseStyles.whiteText} label="Blackjack" value="Blackjack" />
                                            <Picker.Item style={baseStyles.whiteText} label="Craps" value="Craps" />
                                            <Picker.Item style={baseStyles.whiteText} label="Roulette" value="Roulette" />
                                            <Picker.Item style={baseStyles.whiteText} label="Slots" value="Slots" />
                                            <Picker.Item style={baseStyles.whiteText} label="Sports wagering" value="Sports wagering" />
                                            <Picker.Item style={baseStyles.whiteText} label="Lottery tickets/scratch cards" value="Lottery tickets/scratch cards" />
                                            <Picker.Item style={baseStyles.whiteText} label="Other" value="Other" />
                                        </Picker>
                                })}
                            </View>
                        </View>
                    </View>
                    <View style={baseStyles.signupButton}>
                        <Button style={baseStyles.signupButtonText}
                                title="Save the new session"
                                onPress={() => {
                                    const value = this.refs.form.getValue();
                                    // Form has been validated
                                    if (value) {
                                        this.setState({
                                            startAmount: value.StartAmount,
                                            endAmount: value.EndAmount,
                                            duration: value.Duration
                                        });
                                        setTimeout(() => {
                                            this.saveNewGamblingSession();
                                            this.clearForm();
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

