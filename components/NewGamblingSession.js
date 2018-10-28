import React from 'react';
import firebase from 'firebase';
import {
    Alert, Platform, Text, TextInput, Button, View, Picker, DatePickerIOS, DatePickerAndroid,
    TimePickerAndroid, ActivityIndicator, TouchableOpacity, ActionSheetIOS, Modal, KeyboardAvoidingView, ScrollView
} from 'react-native';
// import {Modal} from "expo";
const baseStyles = require("../styles/baseStyles");

export default class NewGamblingSession extends React.Component {

    gameTypes = ['Poker', 'Blackjack', 'Craps', 'Roulette', 'Slots', 'Sports wagering',
        'Lottery tickets/scratch cards', 'Other'];
    gameModes = ['Online', 'Offline'];

    constructor(props) {
        super(props);
        const { params } = this.props.navigation.state;
        const user = firebase.auth().currentUser;

        const currentDateTime = new Date();
        const startDateTime = new Date(currentDateTime);
        //removed because both times should be now() as decided
        // startDateTime.setHours(currentDateTime.getHours() - 1);

        this.state = {
            user: user,
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
            loading: false
        };
    }

    saveNewGamblingSession(){
        this.setState({
            error: '',
            loading: true
        });

        if(this.state.startAmount === '' || this.state.endAmount === '') {
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
                Alert.alert("Daily limits exceeded",
                    "WARNING: You have exceeded your daily budget and time limit:\n" +
                    "Your daily budget is $" + this.state.budgetLimit + " and you have gambled $" + this.state.todayTotalStartingAmounts + " today.\n" +
                    "Your time limit is at " + this.state.timeLimit + " minutes and you spent " + this.state.todayTotalDuration + " minutes gambling today.",
                    [{text: "OK"}])
            } else if(overBudget) {
                Alert.alert("Daily budget exceeded",
                    "WARNING: You have exceeded your daily budget:\n" +
                    "Your daily budget is $" + this.state.budgetLimit + " and you have gambled $" + this.state.todayTotalStartingAmounts + " today.",
                    [{text: "OK"}])
            } else if(overTime) {
                Alert.alert("Daily time limit exceeded",
                    "WARNING: You have exceeded your daily time limit:\n" +
                    "Your time limit is at " + this.state.timeLimit + " minutes and you spent " + this.state.todayTotalDuration + " minutes gambling today.",
                    [{text: "OK"}])
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
            if(averageAmount < -50) {
                console.log("first Normativefeedback alert > 50");
                Alert.alert("Information",
                    "This is the second time you gamble. People your age and gender tend to gamble around $" + Math.floor(0.75 * averageAmount) +
                    " per session while you have gambled on average $" + averageAmount + ".",
                    [{text: "OK"}])
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
                Alert.alert("Slow down!",
                    "You have gambled more ($" + totalMostRecent + ") in the past " + freq + " sessions" +
                    " than in the " + freq + " before that ($" + totalLeastRecent + ").",
                    [{text: "OK"}])
            } else if(totalMostRecent < totalLeastRecent) {
                console.log("gambling going down alert");
                Alert.alert("Good job!",
                    "You have gambled less ($" + totalMostRecent + ") in the past " + freq + " sessions" +
                    " than in the " + freq + " before that ($" + totalLeastRecent + ").",
                    [{text: "OK"}])
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

    _DurationComponent(){
        // if(Platform.OS === 'ios'){
        //     return;
        // } else if(Platform.OS === 'android'){
        return (
            <View style={baseStyles.buttonsView}>
                <TextInput style={baseStyles.textInput} placeholderTextColor={Platform.select({ios: '', android: 'white'})} underlineColorAndroid="white" placeholder="Duration (minutes)" keyboardType="numeric" returnKeyType="done" onChangeText={(duration) => this.setState({duration})}/>
            </View>
        );
        // }
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
                    {this._DurationComponent()}

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
                            <View style={baseStyles.textInputView}>
                                <TextInput style={baseStyles.textInput} placeholderTextColor={Platform.select({ios: '', android: 'white'})} underlineColorAndroid="white" placeholder="Starting Amount" keyboardType="numeric" returnKeyType="done" onChangeText={(startAmount) => this.setState({startAmount})}/>
                            </View>
                            <View style={baseStyles.textInputView}>
                                <TextInput style={baseStyles.textInput} placeholderTextColor={Platform.select({ios: '', android: 'white'})} underlineColorAndroid="white" placeholder="Final amount" keyboardType="numeric" returnKeyType="done" onChangeText={(endAmount) => this.setState({endAmount})}/>
                            </View>
                        </View>
                    </View>
                    <View style={baseStyles.buttonsView}>
                        <Button title="Submit game session" containerViewStyle={{width: "auto"}} onPress={this.saveNewGamblingSession.bind(this)}/>
                    </View>
                    <Text style={baseStyles.centeredText}>{this.state.error}</Text>
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