import React from 'react';
import {Alert, Text, View, FlatList, ActivityIndicator} from 'react-native';
import firebase from 'firebase';
import {Icon} from "react-native-elements";
import { AsyncStorage } from "react-native"
const baseStyles = require('../styles/baseStyles');

class SessionHistory extends React.Component {

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
        const { params } = this.props.navigation.state;
        this.state = {
            error: '',
            loading: false,
            previousSessions: []
        };
    }

    componentDidMount() {
        this.setState({
            error: '',
            loading: true,
        });
        const user = firebase.auth().currentUser;
        const gsPath = `/gamblingSession`;
        firebase.database().ref(gsPath).orderByChild('uid').equalTo(user.uid).once('value').then((snapshot) => {
            snapshot.forEach((session) => {
                if(session.val().date.length <= 10){
                    console.log('adding a session');
                    this.setState({ previousSession: this.state.previousSessions.push({
                            id: session.key || 'No id',
                            date: session.val().date || 'No date',
                            game: session.val().game || 'No game',
                            duration: session.val().duration || '?',
                            outcome: session.val().outcome || '?'
                        })});
                }
            });
            console.log(this.state.previousSessions);
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
        console.log('choosing color');
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
                {/*BUG where the flatlist does not render when there is a single row, so if there is a single row we add it manually*/}
                {this.state.previousSessions.length === 1 &&
                <View style={{flex: 1, alignSelf: 'stretch', flexDirection: 'row'}}>
                    <View style={{flex: 0.05, alignSelf: 'stretch'}}/>{/*margin on the left*/}
                    <View style={{flex: 0.3, alignSelf: 'stretch'}}>
                        <Icon name="edit" color="white" onPress={() => {
                            // this.props.navigation.setParams({id: item.id, editing: true});
                            let setData = async () => {
                                try {
                                    await AsyncStorage.setItem('editId', this.state.previousSessions[0].id);
                                    // {id: item.id, editing: true});
                                } catch (error) {
                                    // Error saving data
                                    console.log('error setting AsyncStorage: ' + error);
                                }
                            };
                            setData().then(() => {
                                this.props.navigation.navigate('NewGamblingSession');
                            });
                        }}/>
                    </View>
                    <View style={{flex: 0.05, alignSelf: 'stretch'}}/>{/*margin on the left*/}
                    <View style={{flex: 1, alignSelf: 'stretch'}}>
                        <Text style={baseStyles.whiteText}>{this.state.previousSessions[0].date || 'No date'}</Text>
                    </View>
                    <View style={{flex: 1.5, alignSelf: 'stretch'}}>
                        <Text style={baseStyles.whiteText}>{this.state.previousSessions[0].game || 'No game'}</Text>
                    </View>
                    <View style={{flex: 1, alignSelf: 'stretch'}}>
                        <Text style={baseStyles.whiteText}>{this.state.previousSessions[0].duration || 'No duration'}</Text>
                    </View>
                    <View style={{flex: 1, alignSelf: 'stretch'}}>
                        <Text style={{color: this.outcomeColor(this.state.previousSessions[0].outcome)}}>{this.state.previousSessions[0].outcome || 'No outcome'}</Text>
                    </View>
                </View>
                }
                <FlatList data={this.state.previousSessions}
                          removeClippedSubviews={false}
                          renderItem={({item}) =>
                              <View style={{flex: 1, alignSelf: 'stretch', flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: 'white'}}>
                                  <View style={{flex: 0.05, alignSelf: 'stretch'}}/>{/*margin on the left*/}
                                  <View style={{flex: 0.3, alignSelf: 'stretch'}}>
                                      <Icon name="edit" color="white" onPress={() => {
                                          // this.props.navigation.setParams({id: item.id, editing: true});
                                          let setData = async () => {
                                              try {
                                                  await AsyncStorage.setItem('editId', item.id);
                                                      // {id: item.id, editing: true});
                                              } catch (error) {
                                                  // Error saving data
                                                  console.log('error setting AsyncStorage: ' + error);
                                              }
                                          };
                                          setData().then(() => {
                                              this.props.navigation.navigate('NewGamblingSession');
                                          });
                                      }}/>
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
                          keyExtractor={(item, index) => index.toString()}
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
