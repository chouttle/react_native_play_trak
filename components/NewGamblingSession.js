import React from 'react';
import firebase from 'firebase';
import {
    Platform, Text, TextInput, Button, View, Picker, DatePickerIOS, DatePickerAndroid,
    TimePickerAndroid, ActivityIndicator
} from 'react-native';
const baseStyles = require("../styles/baseStyles");

export default class NewGamblingSession extends React.Component {

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
            userSettings: {},
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
                error: 'Error: ' + error,
                loading: false
            });
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
        if(Platform.OS === 'ios'){
            return (
                <DatePickerIOS
                    date={this.state.startDate}
                    onDateChange={(startDate) => {this.setState({startDate: startDate})}} />
            );
        } else if(Platform.OS === 'android'){
            return (
                <View style={baseStyles.buttonsView}>
                    <Button title={this.state.startDate.toDateString()} onPress={this.openAndroidStartDatePicker.bind(this)}/>
                </View>
            );
        }
    }

    _StartTimePickerComponent(){
        if(Platform.OS === 'ios'){
            return;
        } else if(Platform.OS === 'android'){
            return (
                <View style={baseStyles.buttonsView}>
                    <Button title={this.state.startTimeHours + ':' + this.state.startTimeMinutes}  onPress={this.openAndroidStartTimePicker.bind(this)}/>
                </View>
            );
        }
    }

    _DurationComponent(){
        // if(Platform.OS === 'ios'){
        //     return;
        // } else if(Platform.OS === 'android'){
        return (
            <View style={baseStyles.buttonsView}>
                <TextInput style={baseStyles.textInput} underlineColorAndroid="white" placeholder="Duration (minutes)" keyboardType="numeric" onChangeText={(duration) => this.setState({duration})}/>
            </View>
        );
        // }
    }

    render() {
        return (
            <View style={baseStyles.container}>
                <Text style={baseStyles.welcomeMsg}>New Gambling Session</Text>
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
                            {/*TODO: for ios, it should be a button, with a modal that opens onPress, and inside that modal the 'Picker'*/}
                            <Picker
                                prompt="Select a game mode"
                                mode="dropdown"
                                selectedValue={this.state.gameMode}
                                onValueChange={(itemValue, itemIndex) => this.setState({gameMode: itemValue})}>
                                <Picker.Item label="Select a game mode" value="" />
                                <Picker.Item label="Online" value="online" />
                                <Picker.Item label="Offline" value="offline" />
                            </Picker>
                        </View>
                        <View style={baseStyles.textInputView}>
                            {/*TODO: for ios, it should be a button, with a modal that opens onPress, and inside that modal the 'Picker'*/}
                            <Picker
                                prompt="Select a game type"
                                mode="dropdown"
                                selectedValue={this.state.gameType}
                                onValueChange={(itemValue, itemIndex) => this.setState({gameType: itemValue})}>
                                <Picker.Item label="Select a game type" value="Select a game type" />
                                <Picker.Item label="Poker" value="Poker" />
                                <Picker.Item label="Blackjack" value="Blackjack" />
                                <Picker.Item label="Craps" value="Craps" />
                                <Picker.Item label="Roulette" value="Roulette" />
                                <Picker.Item label="Slots" value="Slots" />
                                <Picker.Item label="Sports wagering" value="Sports wagering" />
                                <Picker.Item label="Lottery tickets/scratch cards" value="Lottery tickets/scratch cards" />
                                <Picker.Item label="Other" value="Other" />
                            </Picker>
                        </View>
                        <View style={baseStyles.textInputView}>
                            <TextInput style={baseStyles.textInput} underlineColorAndroid="white" placeholder="Starting Amount" keyboardType="numeric" onChangeText={(startAmount) => this.setState({startAmount})}/>
                        </View>
                        <View style={baseStyles.textInputView}>
                            <TextInput style={baseStyles.textInput} underlineColorAndroid="white" placeholder="Final amount" keyboardType="numeric" onChangeText={(endAmount) => this.setState({endAmount})}/>
                        </View>
                    </View>
                </View>
                <View style={baseStyles.buttonsView}>
                    <Button title="Submit game session" containerViewStyle={{width: "auto"}} onPress={this.saveNewGamblingSession.bind(this)}/>
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