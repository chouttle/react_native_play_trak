import React from 'react';
import { Text, View } from 'react-native';
import firebase from 'firebase';
const baseStyles = require('../styles/baseStyles');

class Homepage extends React.Component {

    constructor(props) {
        super(props);
        const { params } = this.props.navigation.state;
        const user = firebase.auth().currentUser;
        this.state = {
            user: user,
            currentBalance: '?',
            maxWon: '?',
            maxLost: '?',
            totalPlayingTime: '?',
            userSettings: {},
            email: "",
            password: "",
            error: "",
            loading: false
        };
        this.setState({
            error: '',
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
                        const duration = session.val().duration;
                        if(typeof sessionOutcome !== 'undefined'){
                            if (this.state.currentBalance === '?' ) {
                                this.setState({currentBalance: sessionOutcome});
                            } else {
                                this.setState({currentBalance: this.state.currentBalance + sessionOutcome});
                            }

                            if (this.state.maxWon === '?' || this.state.maxWon < sessionOutcome) {
                                this.setState({maxWon: sessionOutcome});
                            }

                            if (this.state.maxLost === '?' || this.state.maxLost > sessionOutcome) {
                                this.setState({maxLost: sessionOutcome});
                            }
                        }
                        if(typeof duration !== 'undefined'){
                            if(this.state.totalPlayingTime === '?') {
                                this.setState({totalPlayingTime: parseInt(duration)});
                            } else {
                                this.setState({totalPlayingTime: this.state.totalPlayingTime + parseInt(duration)});
                            }
                        }
                    }
                } else {}
            });
            if(this.state.maxWon < 0 ){
                this.setState({ maxWon: 0});
            }
            if(this.state.maxLost > 0 ){
                this.setState({ maxLost: 0});
            }
            if(this.state.currentBalance === '?'){
                this.setState({currentBalance: 0});
            }
            if(this.state.maxWon === '?'){
                this.setState({maxWon: 0});
            }
            if(this.state.maxLost === '?'){
                this.setState({maxLost: 0});
            }
            if(this.state.totalPlayingTime === '?'){
                this.setState({totalPlayingTime: 0});
            }
            this.setState({
                error: '',
                loading: false
            });
        }).catch((error) => {
            this.setState({
                error: 'Could not load your stats: ' + error,
                loading: false
            });
        });
    }

    modifyUserSettings(){
        this.props.navigation.navigate('UserSettings');
    }

    startGamblingSession(){
        this.props.navigation.navigate('NewGamblingSession');
    }

    render() {
        return (
            <View style={baseStyles.container}>
                <Text style={baseStyles.homeText}>Overview</Text>
                <Text style={[baseStyles.centeredText, baseStyles.whiteText]}>Current balance</Text>
                <Text style={[baseStyles.centeredText, baseStyles.whiteText]}>{this.state.currentBalance}</Text>
                <Text style={[baseStyles.centeredText, baseStyles.whiteText]}>Max amount won: {this.state.maxWon}</Text>
                <Text style={[baseStyles.centeredText, baseStyles.whiteText]}>Max amount lost: {this.state.maxLost}</Text>
                <Text style={[baseStyles.centeredText, baseStyles.whiteText]}>Total playing time: {this.state.totalPlayingTime}</Text>
                <Text style={[baseStyles.centeredText, baseStyles.whiteText]}>{this.state.error}</Text>
            </View>
        );
    }
}

export default Homepage;
