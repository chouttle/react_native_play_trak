import React from 'react';
import {Alert, Text, View, FlatList, ActivityIndicator} from 'react-native';
import firebase from 'firebase';
import {Icon} from "react-native-elements";
const baseStyles = require('../styles/baseStyles');

class SessionHistory extends React.Component {

    constructor(props) {
        super(props);
        const { params } = this.props.navigation.state;
        this.state = {
            error: '',
            loading: false,
            previousSessions: []
        };
        this.setState({
            error: '',
            loading: true,
        });
        const user = firebase.auth().currentUser;
        const gsPath = `/gamblingSession`;
        firebase.database().ref(gsPath).orderByChild('uid').equalTo(user.uid).once('value').then((snapshot) => {
            snapshot.forEach((session) => {
                if(session.val().date.length <= 10){
                    this.setState({ previousSession: this.state.previousSessions.push({
                            id: session.key || 'No id',
                            date: session.val().date || 'No date',
                            game: session.val().game || 'No game',
                            duration: session.val().duration || '?',
                            outcome: session.val().outcome || '?'
                        })});
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
        });
    }

    //cannot be static!
    outcomeColor(outcome) {
        if(outcome === 0){
            return 'white';
        } else if(outcome > 0){
            return 'green';
        } else if(outcome < 0){
            return 'red';
        } else {
            return 'white';
        }
    }

    render() {
        return (
            <View style={baseStyles.container}>
                {/*<Text style={baseStyles.homeText}>Session History</Text>*/}
                <Text style={[baseStyles.centeredText, baseStyles.whiteText]}>{this.state.error}</Text>
                <View style={{flexDirection: 'row'}}>
                    <View style={{flex: 0.05, alignSelf: 'stretch'}}/>{/*margin on the left*/}
                    <View style={{flex: 0.3, alignSelf: 'stretch'}}/>
                    <View style={{flex: 0.05, alignSelf: 'stretch'}}/>{/*margin on the left*/}
                    <View style={{flex: 1, alignSelf: 'stretch'}}>
                        <Text style={[{fontWeight: 'bold'}, baseStyles.whiteText]}>Date</Text>
                    </View>
                    <View style={{flex: 1.5, alignSelf: 'stretch'}}>
                        <Text style={[{fontWeight: 'bold'}, baseStyles.whiteText]}>Game</Text>
                    </View>
                    <View style={{flex: 1, alignSelf: 'stretch'}}>
                        <Text style={[{fontWeight: 'bold'}, baseStyles.whiteText]}>Duration</Text>
                    </View>
                    <View style={{flex: 1, alignSelf: 'stretch'}}>
                        <Text style={[{fontWeight: 'bold'}, baseStyles.whiteText]}>Outcome</Text>
                    </View>
                </View>
                <FlatList data={this.state.previousSessions}
                          renderItem={({item}) =>
                              <View style={{flex: 1, alignSelf: 'stretch', flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: 'white'}}>
                                  <View style={{flex: 0.05, alignSelf: 'stretch'}}/>{/*margin on the left*/}
                                  <View style={{flex: 0.3, alignSelf: 'stretch'}}>
                                      <Icon name="edit" color="white" onPress={() => Alert.alert('Alert', 'this is an alert: ' + item.id)}/>
                                  </View>
                                  <View style={{flex: 0.05, alignSelf: 'stretch'}}/>{/*margin on the left*/}
                                  <View style={{flex: 1, alignSelf: 'stretch'}}>
                                      <Text style={baseStyles.whiteText}>{item.date || 'No date'}</Text>
                                  </View>
                                  <View style={{flex: 1.5, alignSelf: 'stretch'}}>
                                      <Text style={baseStyles.whiteText}>{item.game || 'No game'}</Text>
                                  </View>
                                  <View style={{flex: 1, alignSelf: 'stretch'}}>
                                      <Text style={baseStyles.whiteText}>{item.duration || 'No duration'}</Text>
                                  </View>
                                  <View style={{flex: 1, alignSelf: 'stretch'}}>
                                      <Text style={{color: this.outcomeColor(item.outcome)}}>{item.outcome || 'No outcome'}</Text>
                                  </View>
                              </View>
                          }
                />
                {this.state.loading &&
                <View style={baseStyles.loading}>
                    <ActivityIndicator size='large' />
                </View>
                }
            </View>
        );
    }
}

export default SessionHistory;
