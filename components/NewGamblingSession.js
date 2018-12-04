import React from 'react';
import firebase from 'firebase';
import {
    Alert, Platform, Text, TextInput, Button, View, Picker, DatePickerIOS, DatePickerAndroid,
    TimePickerAndroid, ActivityIndicator, TouchableOpacity, ActionSheetIOS, Modal, KeyboardAvoidingView, ScrollView
} from 'react-native';
// import {Modal} from "expo";
const baseStyles = require("../styles/baseStyles");


import FormValidation from 'tcomb-form-native'
import { AsyncStorage } from "react-native"

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
            color: "white",
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

export default class NewGamblingSession extends React.Component {

    gameTypes = [
        'Fantasy sports pool',
        'Daily Fantasy sports',
        'Poker',
        'Other Card Games',
        'Games of skills (darts, pools, etc.)',
        'Bingo',
        'Casino (Blackjack, Craps, Roulette, etc.)',
        'VLTs/Slots',
        'Sports wagering',
        'Horse races',
        'Lottery tickets/scratch cards',
        'Other'
    ];
    gameModes = ['Online', 'Offline'];

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
        let valid_positive_number = FormValidation.refinement(
            FormValidation.Number, function (num ) {
                // let num = Number(str);
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

        const user = firebase.auth().currentUser;

        const currentDateTime = new Date();
        const startDateTime = new Date(currentDateTime);
        //removed because both times should be now() as decided
        // startDateTime.setHours(currentDateTime.getHours() - 1);

        this.state = {
            user: user,
            editId: 0,
            alertDailyLimit: null,
            alertNormativeFeedback: null,
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
            gameTypeOther: '',
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

    componentDidMount() {
        const retrieveData = async () => {
            try {
                const value = await AsyncStorage.getItem('editId');
                if (value !== null) {
                    // We have data!!
                    this.setState({
                        editId: value
                    });
                    this.loadSessionToBeUpdated(value);
                    let setData = async () => {
                        try {
                            await AsyncStorage.removeItem('editId');
                            // {id: item.id, editing: true});
                        } catch (error) {
                            // Error saving data
                            console.log('error removing AsyncStorage: ' + error);
                        }
                    };
                    setData();
                } else {
                    this.setState({
                        editId: value
                    });
                }
            } catch (error) {
                console.log('error retrieving AsyncStorage: ' + error);
                // Error retrieving data
            }
        };
        retrieveData();
    }

    loadSessionToBeUpdated(editId) {
        const user = firebase.auth().currentUser;
        const gsPath = `/gamblingSession/` + editId;
        firebase.database().ref(gsPath).once('value').then((snapshot) => {
            const sess = snapshot.val();
            this.setState({
                gameType: this.gameTypes.indexOf(sess.game) === -1 ? 'Other' : sess.game,
                gameTypeOther: this.gameTypes.indexOf(sess.game) === -1 ? sess.game : '',
                gameMode: sess.mode,
                endAmount: sess.finalAmount,
                startDate: new Date(sess.date.replace(/-/g, '\/')),
                startTimeHours: sess.startTime.split(':')[0],
                startTimeMinutes: sess.startTime.split(':')[1],
                duration: sess.duration,
                startingAmount: sess.startingAmount,
                form_values: {
                    StartAmount: sess.startingAmount,
                    EndAmount: sess.finalAmount,
                    Duration: sess.duration
                }
            });
            // snapshot.forEach((session) => {
            //     if(session.val().date.length <= 10){
            //         this.setState({ previousSession: this.state.previousSessions.push({
            //                 id: session.key || 'No id',
            //                 date: session.val().date || 'No date',
            //                 game: session.val().game || 'No game',
            //                 duration: session.val().duration || '?',
            //                 outcome: session.val().outcome || '?'
            //             })});
            //     }
            // });
            this.setState({
                error: '',
                loading: false
            });
        }).catch((error) => {
            this.setState({
                error: 'Could not load the data: ' + error,
                loading: false
            });
        });
    }

    getFormOptions () {
        let form_options =  {
            fields: {
                StartAmount: { returnKeyType: 'done', error: 'Please enter a positive number' },
                EndAmount: { returnKeyType: 'done', error: 'Please enter a positive number' },
                Duration: { returnKeyType: 'done', error: 'Please enter a positive number' }
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
        const lastStartDate = new Date(this.state.startDate);
        if(Platform.OS === 'android'){
            lastStartDate.setHours(this.state.startTimeHours);
            lastStartDate.setMinutes(this.state.startTimeMinutes);
        }
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
            game: this.state.gameType === 'Other' ? this.state.gameTypeOther : this.state.gameType,
            key: newGamblingSessionRef,
            mode: this.state.gameMode,
            startTime: lastStartDate.getHours() + ':' + lastStartDate.getMinutes(),
            startingAmount: this.state.startAmount,
            uid: this.state.user.uid
        }).then(() => {
            this.loadDataForAlert().then(() => {
                this.alertDailyLimits().then(() => {
                    this.alertNormativeFeedback().then(() => {
                        if(Platform.OS === 'ios'){
                            if(this.state.alertDailyLimit){
                                Alert.alert(this.state.alertDailyLimit.title,
                                    this.state.alertDailyLimit.message,
                                    this.state.alertDailyLimit.buttons);
                            }
                            if(this.state.alertNormativeFeedback) {
                                Alert.alert(this.state.alertNormativeFeedback.title,
                                    this.state.alertNormativeFeedback.message,
                                    this.state.alertNormativeFeedback.buttons);
                            }
                        } else {
                            if(this.state.alertDailyLimit && this.state.alertNormativeFeedback) {
                                Alert.alert(this.state.alertDailyLimit.title + ' && ' + this.state.alertNormativeFeedback.title,
                                    this.state.alertDailyLimit.message + '\n\n' + this.state.alertNormativeFeedback.message,
                                    this.state.alertDailyLimit.buttons);
                            } else if(this.state.alertDailyLimit) {
                                Alert.alert(this.state.alertDailyLimit.title,
                                    this.state.alertDailyLimit.message,
                                    this.state.alertDailyLimit.buttons);
                            } else if(this.state.alertNormativeFeedback) {
                                Alert.alert(this.state.alertNormativeFeedback.title,
                                    this.state.alertNormativeFeedback.message,
                                    this.state.alertNormativeFeedback.buttons);
                            }
                        }
                    });
                });
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

    saveUpdatedGamblingSession(){
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
        const lastStartDate = new Date(this.state.startDate);
        if(Platform.OS === 'android'){
            lastStartDate.setHours(this.state.startTimeHours);
            lastStartDate.setMinutes(this.state.startTimeMinutes);
        }
        if (this.state.duration <= 0) {
            this.setState({
                error: "The duration needs to be a positive number and cannot be 0.",
                loading: false
            });
            return;
        }

        const newGamblingSessionRef = this.state.editId;
        let stringMonth = (lastStartDate.getMonth() + 1) < 10 ? '0' + (lastStartDate.getMonth() + 1) : '' + (lastStartDate.getMonth() + 1);
        let stringDay = lastStartDate.getDate() < 10 ? '0' + lastStartDate.getDate() : lastStartDate.getDate();
        firebase.database().ref(gsPath + `/${newGamblingSessionRef}`).update({
            date: lastStartDate.getFullYear() + '-' + stringMonth + '-' + stringDay,
            duration: parseInt(this.state.duration, 10),
            // email: this.state.user.email,
            finalAmount: this.state.endAmount,
            outcome: this.state.endAmount - this.state.startAmount,
            game: this.state.gameType === 'Other' ? this.state.gameTypeOther : this.state.gameType,
            // key: newGamblingSessionRef,
            mode: this.state.gameMode,
            startTime: lastStartDate.getHours() + ':' + lastStartDate.getMinutes(),
            startingAmount: this.state.startAmount
            // uid: this.state.user.uid
        }).then(() => {
            this.setState({
                error: '',
                loading: false
            });
            this.props.navigation.navigate('SessionHistory');
        }).catch((error) => {
            this.setState({
                error: 'Error: ' + error,
                loading: false
            });
        });
    }

    loadDataForAlert() {
        const gsPath = `/gamblingSession`;
        let totalDuration = 0;
        let totalStartingAmounts = 0;
        let totalNumSessions = 0;
        this.setState({previousSessions: []});
        return firebase.database().ref(gsPath).orderByChild('uid').equalTo(this.state.user.uid).once('value').then((snapshot) => {
            snapshot.forEach((session) => {
                if(session.val().date.length <= 10){
                    this.setState({ previousSession: this.state.previousSessions.push({
                            date: session.val().date || 'No date',
                            startTime: session.val().startTime || 'No start time',
                            game: session.val().game || 'No game',
                            duration: session.val().duration || '?',
                            startingAmount: session.val().startingAmount || '?',
                            finalAmount: session.val().finalAmount || '?',
                            outcome: session.val().outcome || '?'
                        })
                    });
                    if(session.val().date === (new Date()).getFullYear() + '-' + ((new Date()).getMonth() + 1) + '-' + (new Date()).getDate()) {
                        totalDuration += Number(session.val().duration);
                        totalStartingAmounts += Number(session.val().startingAmount);
                    }
                    totalNumSessions++;
                }
            });
            this.setState({todayTotalDuration: totalDuration});
            this.setState({todayTotalStartingAmounts: totalStartingAmounts});
            this.setState({previousSessions: this.state.previousSessions.sort(this.sortSessionsByLatestDate)});
            this.setState({totalNumSessions: totalNumSessions});
            this.setState({
                error: '',
                loading: false
            });
            return 0;
        }).catch((error) => {
            this.setState({
                error: 'Could not load the data: ' + error,
                loading: false
            });
        });
    }

    sortSessionsByLatestDate(a,b) {
        if (new Date(a.date) > new Date(b.date)){
            return -1;
        }
        if (new Date(a.date) < new Date(b.date)){
            return 1;
        }
        if(a.startTime.split(':')[0] > b.startTime.split(':')[0]) {
            return -1;
        }
        if(a.startTime.split(':')[0] < b.startTime.split(':')[0]) {
            return 1;
        }
        if(a.startTime.split(':')[1] > b.startTime.split(':')[1]){
            return -1;
        }
        if(a.startTime.split(':')[1] < b.startTime.split(':')[1]){
            return 1;
        }
        return 0;
    }


    alertDailyLimits() {
        this.setState({alertDailyLimit: null});
        const userPath = `/users/${this.state.user.uid}`;
        return firebase.database().ref(userPath).once('value').then((snapshot) => {
            const userSettings = snapshot.val();
            this.setState({
                budgetLimit: userSettings.dailyLimit || '0',
                timeLimit: userSettings.dailyTimeLimit || '0',
                error: '',
                loading: false
            });
            const overBudget = this.state.budgetLimit < this.state.todayTotalStartingAmounts;
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
                        buttons: [{text: "OK"}]
                    }
                });
            } else if(overTime) {
                this.setState({alertDailyLimit: {
                        title: "Daily time limit exceeded",
                        message: "WARNING: You have exceeded your daily time limit:\n" +
                            "Your time limit is at " + this.state.timeLimit + " minutes and you spent " + this.state.todayTotalDuration + " minutes gambling today.",
                        buttons: [{text: "OK"}]
                    }
                });
            }
        }).catch((error) => {
            this.setState({
                error: 'Could not load user limits: ' + error,
                loading: false
            })
        });
    }

    alertNormativeFeedback() {
        this.setState({alertNormativeFeedback: null});
        this.setState({
            error: '',
            loading: false,
        });
        return Promise.resolve().then(() => {
            const freq = 5;
            if (this.state.totalNumSessions === freq) {
                let totalAmount = 0;
                for (let i = 0; i < freq; i++) {
                    totalAmount += Number(this.state.previousSessions[i].startingAmount);
                }
                const averageAmount = totalAmount / freq;
                if (averageAmount >= 50) {
                    this.setState({
                        alertNormativeFeedback: {
                            title: "Information",
                            message: "You have gambled " + freq + " times. People your age and gender tend to gamble around $" + Math.floor(0.75 * averageAmount) +
                                " per session while you have gambled on average $" + averageAmount + ".",
                            buttons: [{text: "OK"}]
                        }
                    });
                }
            } else if (this.state.totalNumSessions > freq && this.state.totalNumSessions % freq === 0) {
                let totalMostRecent = 0;
                let totalLeastRecent = 0;
                for (let i = 0; i < freq; i++) {
                    totalMostRecent += Number(this.state.previousSessions[i].startingAmount);
                }
                for (let i = freq; i < 2 * freq; i++) {
                    totalLeastRecent += Number(this.state.previousSessions[i].startingAmount);
                }
                if (totalMostRecent > totalLeastRecent) {
                    this.setState({
                        alertNormativeFeedback: {
                            title: "Slow down!",
                            message: "You have gambled more ($" + totalMostRecent + ") in the past " + freq + " sessions" +
                                " than in the " + freq + " before that ($" + totalLeastRecent + ").",
                            buttons: [{text: "OK"}]
                        }
                    });
                } else if (totalMostRecent < totalLeastRecent) {
                    this.setState({
                        alertNormativeFeedback: {
                            title: "Good job!",
                            message: "You have gambled less ($" + totalMostRecent + ") in the past " + freq + " sessions" +
                                " than in the " + freq + " before that ($" + totalLeastRecent + ").",
                            buttons: [{text: "OK"}]
                        }
                    });
                } else {
                    this.setState({
                        alertNormativeFeedback: {
                            title: "Just so you know ...",
                            message: "You have gambled as much in the past " + freq + " sessions" +
                                " than in the " + freq + " before that ($" + totalLeastRecent + ").",
                            buttons: [{text: "OK"}]
                        }
                    });
                }
            }
        })
            .catch((error) => {
                console.log('error in catch: ' + error);
            });
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
                    {this.state.editId !== null &&
                    <Text style={baseStyles.updatingSessionTitle}>Updating existing session</Text>}

                    {this.modalStartDateComponent()}
                    <View style={{ flex: 1, height: 10}}></View>
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
                                            // itemStyle={{backgroundColor: 'white'}}
                                            style={{backgroundColor: 'white'}}
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
                                            style={{backgroundColor: 'white'}}
                                            selectedValue={this.state.gameType}
                                            onValueChange={(itemValue, itemIndex) => this.setState({gameType: itemValue})}>
                                            <Picker.Item style={baseStyles.whiteText} label="Select a game type" value="Select a game type" />
                                            <Picker.Item style={baseStyles.whiteText} label="Fantasy sports pool" value="Fantasy sports pool" />
                                            <Picker.Item style={baseStyles.whiteText} label="Daily Fantasy sports" value="Daily Fantasy sports" />
                                            <Picker.Item style={baseStyles.whiteText} label="Poker" value="Poker" />
                                            <Picker.Item style={baseStyles.whiteText} label="Other Card Games" value="Other Card Games" />
                                            <Picker.Item style={baseStyles.whiteText} label="Games of skills (darts, pools, etc.)" value="Games of skills (darts, pools, etc.)" />
                                            <Picker.Item style={baseStyles.whiteText} label="Bingo" value="Bingo" />
                                            <Picker.Item style={baseStyles.whiteText} label="Casino (Blackjack, Craps, Roulette, etc.)" value="Casino (Blackjack, Craps, Roulette, etc.)" />
                                            <Picker.Item style={baseStyles.whiteText} label="VLTs/Slots" value="VLTs/Slots" />
                                            <Picker.Item style={baseStyles.whiteText} label="Sports wagering" value="Sports wagering" />
                                            <Picker.Item style={baseStyles.whiteText} label="Horse races" value="Horse races" />
                                            <Picker.Item style={baseStyles.whiteText} label="Lottery tickets/scratch cards" value="Lottery tickets/scratch cards" />
                                            <Picker.Item style={baseStyles.whiteText} label="Other" value="Other" />
                                        </Picker>
                                })}
                            </View>
                            {this.state.gameType === 'Other' ?
                                <TextInput style={[...Form.stylesheet.textbox.normal, {marginTop: 10, backgroundColor: 'white', padding: 10}]}
                                           value={this.state.gameTypeOther}
                                           placeholder='Please specify'
                                           onChangeText={(gameTypeOther) => this.setState({gameTypeOther})}>
                                </TextInput>: null}
                        </View>
                    </View>
                    <View style={[baseStyles.signupButton, {marginTop: 10}]}>
                        <Button style={baseStyles.signupButtonText}
                                title="Save the new session"
                                onPress={() => {

                                    this.setState({
                                        error: ''
                                    });
                                    const value = this.refs.form.getValue();
                                    // Form has been validated
                                    if(this.state.gameMode === '') {
                                        this.setState({
                                            error: 'Please select a game mode.'
                                        });
                                    } else if(this.state.gameType === ''){
                                        this.setState({
                                            error: 'Please select a game type.'
                                        });
                                    }  else if(this.state.gameType === 'Other' && this.state.gameTypeOther === ''){
                                        this.setState({
                                            error: 'Please specify which type if you select Other.'
                                        });
                                    } else if (value) {
                                        this.setState({
                                            startAmount: value.StartAmount,
                                            endAmount: value.EndAmount,
                                            duration: value.Duration
                                        });
                                        setTimeout(() => {
                                            if(this.state.editId === null){
                                                this.saveNewGamblingSession();
                                                this.clearForm();
                                            } else {
                                                this.saveUpdatedGamblingSession();
                                            }

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

