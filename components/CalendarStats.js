import {Grid, LineChart, XAxis, YAxis} from "react-native-svg-charts";
import React from "react";
import {Button, Text} from "react-native-elements";
import {
    Alert,
    ActivityIndicator,
    Picker,
    Platform,
    View,
    ActionSheetIOS,
    TouchableOpacity,
    ScrollView
} from "react-native";
import * as baseStyles from "../styles/baseStyles";
import * as firebase from "firebase";
import moment from "moment";
import {Calendar} from "react-native-calendars";
// import * as ActionSheetIOS from "react-native";

class CalendarStats extends React.Component {

    constructor(props) {
        super(props);        //avoid reinitializing firebase when it has already been done.
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
            markedDates: {[new Date()]: {disabled: true}},
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
                    const markedDateStyle = {
                        customStyles: {
                            container: {
                                // backgroundColor: 'green',
                            },
                            text: {
                                color: session.val().outcome >= 0 ? 'limegreen' : 'red',
                                fontWeight: 'bold'
                            },
                        },
                        data: {
                            duration: session.val().duration || null,
                            outcome: session.val().outcome || null
                        }
                    };
                    const markedDatesObj = {... this.state.markedDates, ...{[session.val().date]: markedDateStyle }};
                    this.setState({
                        markedDates: markedDatesObj
                    });
                }
            });
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

    render() {
        return <View style={baseStyles.container}>
            <Calendar
                style={{borderRadius: 10, marginHorizontal: 10}}
                markingType={'custom'}
                markedDates={this.state.markedDates}
                // Initially visible month. Default = Date()
                // current={'2012-03-01'}
                // Minimum date that can be selected, dates before minDate will be grayed out. Default = undefined
                // minDate={'2012-05-10'}
                // Maximum date that can be selected, dates after maxDate will be grayed out. Default = undefined
                maxDate={new Date()}
                // Handler which gets executed on day press. Default = undefined
                onDayPress={(day) => {this.state.markedDates[day.dateString] ? Alert.alert(day.dateString, 'Time spent: ' + this.state.markedDates[day.dateString].data.duration +
                    ' min\nOutcome: $' + this.state.markedDates[day.dateString].data.outcome) : null}}
                // Handler which gets executed on day long press. Default = undefined
                onDayLongPress={(day) => {console.log('long selected day', day)}}
                // Month format in calendar title. Formatting values: http://arshaw.com/xdate/#Formatting
                monthFormat={'yyyy MMM'}
                // Handler which gets executed when visible month changes in calendar. Default = undefined
                onMonthChange={(month) => {console.log('month changed', month)}}
                // Hide month navigation arrows. Default = false
                // hideArrows={true}
                // Replace default arrows with custom ones (direction can be 'left' or 'right')
                // renderArrow={(direction) => (<Arrow />)}
                // Do not show days of other months in month page. Default = false
                hideExtraDays={true}
                // If hideArrows=false and hideExtraDays=false do not switch month when tapping on greyed out
                // day from another month that is visible in calendar page. Default = false
                // disableMonthChange={true}
                // If firstDay=1 week starts from Monday. Note that dayNames and dayNamesShort should still start from Sunday.
                firstDay={1}
                // Hide day names. Default = false
                // hideDayNames={true}
                // Show week numbers to the left. Default = false
                // showWeekNumbers={true}
                // Handler which gets executed when press arrow icon left. It receive a callback can go back month
                onPressArrowLeft={substractMonth => substractMonth()}
                // Handler which gets executed when press arrow icon left. It receive a callback can go next month
                onPressArrowRight={addMonth => addMonth()}
            />
            {this.state.loading &&
            <View style={baseStyles.loading}>
                <ActivityIndicator size='large' />
            </View>
            }
        </View>
    }
}

export default CalendarStats;