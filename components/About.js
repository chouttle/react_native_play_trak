import React from 'react';
import {Text, View, Image, Linking, ActivityIndicator, ScrollView} from 'react-native';
import '../assets/ic-logo.png';
const baseStyles = require('../styles/baseStyles');
// import firebase from 'firebase';

class About extends React.Component {

    constructor(props) {
        super(props);
        const { params } = this.props.navigation.state;
        this.state = {
            error: '',
            loading: false
        }
    }

    render() {
        return (
            <ScrollView style={baseStyles.scrollViewContainer}>
            <View style={baseStyles.container}>
                <View style={{flexDirection: 'row'}}>
                    <Image style={{ flexShrink: 1}}
                           resizeMode='contain'
                           source={require('../assets/ic-logo.png')}
                    />
                </View>
                <Text style={baseStyles.homeText}>About Us</Text>
                <View style={{marginHorizontal: 40}}>
                    <Text>
                        For over 20 years, the International Center for Youth Gambling Problems and High-Risk Behaviours at McGill University has been at the forefront of leading-edge research aimed at identifying and understanding the critical factors related to youth gambling issues.
                        In Addition to its many research endeavors, the center also provides treatment for youth experiencing gambling problems.{'\n'}
                    </Text>
                    <Text>
                        For more information, visit us on our website:&nbsp;
                        <Text style={{color: 'blue'}} onPress={() => Linking.openURL('http://www.youthgambling.com')}>
                            http://www.youthgambling.com
                        </Text>
                    </Text>
                </View>
                {this.state.loading &&
                <View style={baseStyles.loading}>
                    <ActivityIndicator size='large' />
                </View>
                }
            </View>
            </ScrollView>
        );
    }
}

export default About;
