import {Grid, LineChart, XAxis, YAxis} from "react-native-svg-charts";
import React from "react";
import {Button, Text} from "react-native-elements";
import {ActivityIndicator, Picker, Platform, View, ActionSheetIOS, TouchableOpacity} from "react-native";
import * as baseStyles from "../styles/baseStyles";
import * as firebase from "firebase";
import moment from "moment";
// import * as ActionSheetIOS from "react-native";

class Graphs extends React.Component {

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
        this.state = {
            error: '',
            loading: true,
            listSessions: [],
            maxOutcome: null,
            minOutcome: null,
            minDuration: null,
            maxDuration: null,
            timeline: 'weekly',
            timeOrBalance: 'time'
        };
    }

    componentDidMount() {
        const user = firebase.auth().currentUser;
        const gsPath = `/gamblingSession`;
        firebase.database().ref(gsPath).orderByChild('uid').equalTo(user.uid).once('value').then((snapshot) => {
            snapshot.forEach((session) => {
                if(session.val().date.length <= 10 && session.val().duration && session.val().outcome) {
                    this.setState({listSession: this.state.listSessions.push({
                            date: session.val().date || 'Error',
                            duration: session.val().duration || null,
                            outcome: session.val().outcome || null
                        })
                    });
                    if(this.state.minDuration == null || this.state.minDuration > session.val().duration) {
                        this.setState({minDuration: session.val().duration});
                    }
                    if(this.state.maxDuration == null || this.state.maxDuration < session.val().duration) {
                        this.setState({maxDuration: session.val().duration});
                    }
                    if(this.state.minOutcome == null || this.state.minOutcome > session.val().outcome) {
                        this.setState({minOutcome: session.val().outcome});
                    }
                    if(this.state.maxOutcome == null || this.state.maxOutcome < session.val().outcome) {
                        this.setState({maxOutcome: session.val().outcome});
                    }
                }
            });
            this.setState({listSessions: this.state.listSessions.sort(this.sortSessionsByLatestDate)});
            this.setState({listSessions: this.state.listSessions.slice(0, 5)});
            this.setState({listSessions: this.state.listSessions.sort(this.sortSessionsByEarliestDate)});
            this.setState({
                error: '',
                loading: false
            });
        }).catch((error) => {
            this.setState({
                error: 'Could not load the data: ' + error,
                loading: false
            });
        })
    }

    sortSessionsByLatestDate(a,b) {
        if (new Date(a.date) > new Date(b.date))
            return -1;
        if (new Date(a.date) < new Date(b.date))
            return 1;
        return 0;
    }

    sortSessionsByEarliestDate(a,b) {
        if (new Date(a.date) < new Date(b.date))
            return -1;
        if (new Date(a.date) > new Date(b.date))
            return 1;
        return 0;
    }

    iosPickTimeOrBalance() {
        ActionSheetIOS.showActionSheetWithOptions({
                options: ['Time spent', 'Gain/Loss'],
            },
            (buttonIndex) => {
                this.setState({timeOrBalance: buttonIndex === 0 ? 'time' : 'balance'})
            });
    }

    render() {

        const axesSvg = { fontSize: 10, fill: 'black', fontWeight: 'bold'};
        const axesSvgY = { fontSize: 10, fill: 'black', fontWeight: 'bold', originY: 80 };
        const verticalContentInset = { top: 10, bottom: 10 };
        const xAxisHeight = 30;
        return <View style={baseStyles.container}>

            <Text style={baseStyles.welcomeMsg}>Graph of your 5 last sessions</Text>
            <View style={baseStyles.textInputView}>
                {/*TODO: for ios, it should be a button, with a modal that opens onPress, and inside that modal the 'Picker'*/}
                {Platform.select({
                    ios:
                        <TouchableOpacity style={baseStyles.touchBtn} onPress={this.iosPickTimeOrBalance.bind(this)}>
                            <Text style={[baseStyles.touchBtnText, baseStyles.whiteText]}>
                                {this.state.timeOrBalance === 'time' ? "Time spent" : "Gain/Loss"}
                            </Text>
                        </TouchableOpacity>,
                    android:
                        <Picker
                            style={baseStyles.whiteText}
                            mode='dropdown'
                            selectedValue={this.state.timeOrBalance}
                            onValueChange={(itemValue, itemIndex) => this.setState({timeOrBalance: itemValue})}>
                            <Picker.Item label='Time spent' value='time'/>
                            <Picker.Item style={baseStyles.whiteText} label='Gain/Loss' value='balance'/>
                        </Picker>
                })}

            </View>
            {/*Example for axis with values: https://stackoverflow.com/questions/52459901/how-to-display-vertical-grid-with-time-series-data-using-react-native-svg-charts*/}
            <View style={{
                height: 270,
                backgroundColor: 'white',
                padding: 20,
                flexDirection: 'row',
                borderWidth: 2,
                borderStyle: 'solid',
                borderColor: 'transparent',
                borderRadius: 10,
                margin: 5
            }}>
                <YAxis
                    data={this.state.listSessions}
                    style={{
                        marginBottom: xAxisHeight,
                        backgroundColor: 'white',
                        width: 50,
                        height: 200,
                        borderWidth: 2,
                        borderStyle: 'solid',
                        borderColor: 'transparent'
                    }}
                    yAccessor={({item}) => this.state.timeOrBalance === 'time' ? item.duration : item.outcome}
                    min={this.state.timeOrBalance === 'time' ? (this.state.minDuration < 30 ? 0 : this.state.minDuration - 30) : this.state.minOutcome - 50}
                    max={this.state.timeOrBalance === 'time' ? this.state.maxDuration + 30 : this.state.maxOutcome + 50}
                    contentInset={verticalContentInset}
                    svg={axesSvg}
                    formatLabel={value => this.state.timeOrBalance === 'time' ? `${value} min` : `$${value}`}
                    // numberOfTicks={10}
                />
                <View style={{
                    flex: 1,
                    marginLeft: 10,
                    backgroundColor: 'white',
                    // height: 250,
                    borderWidth: 2,
                    borderStyle: 'solid',
                    borderColor: 'transparent'
                }}>
                    <LineChart
                        style={{backgroundColor: 'white', height: 200}}
                        data={this.state.listSessions}
                        yAccessor={({item}) => this.state.timeOrBalance === 'time' ? item.duration : item.outcome}
                        xAccessor={({index}) => index}
                        gridMin={this.state.timeOrBalance === 'time' ? (this.state.minDuration < 30 ? 0 : this.state.minDuration - 30) : this.state.minOutcome - 50}
                        gridMax={this.state.timeOrBalance === 'time' ? this.state.maxDuration + 30 : this.state.maxOutcome + 50}
                        svg={{stroke: 'rgb(134, 65, 244)'}}
                        contentInset={{top: 10, bottom: 10, left: 20, right: 20}}
                    >
                        <Grid/>
                    </LineChart>
                    <XAxis
                        style={{marginHorizontal: -10, height: xAxisHeight}}
                        data={this.state.listSessions}
                        formatLabel={(value, index) => index === this.state.listSessions.length - 1 ? 'Latest' : this.state.listSessions.length - index}
                        contentInset={{left: 30, right: 30}}
                        svg={axesSvgY}
                        // numberOfTicks={5}
                    />
                </View>
            </View>
            {this.state.loading &&
            <View style={baseStyles.loading} pointerEvents='none'>
                <ActivityIndicator size='large'/>
            </View>
            }
        </View>
    }
}

export default Graphs;