import React from 'react';
import {SwitchNavigator, DrawerNavigator, StackNavigator, DrawerItems, SafeAreaView} from 'react-navigation';
import LoginPage from './components/Login';
import AuthLoadingScreen from './components/AuthLoadingScreen';
import RegisterPage from './components/Registration';
import Homepage from "./components/Homepage";
import UserSettings from "./components/UserSettings";
import NewGamblingSession from "./components/NewGamblingSession";
import {AsyncStorage, View, Button} from "react-native";
import SessionHistory from "./components/SessionHistory";
import DailyStats from "./components/DailyStats";
import Advice from "./components/Advice";
import About from "./components/About";
import {Icon} from "react-native-elements";
import Graphs from "./components/Graphs";
const baseStyles = require("./styles/baseStyles");

export class DrawerComponent extends React.Component {
    constructor(props){
        super(props);
    }

    _signOutAsync = async () => {
        await AsyncStorage.clear();
        this.props.navigation.navigate('Auth');
    };

    render() {
        return (
            <View>
                <SafeAreaView forceInset={{ top: 'always', horizontal: 'never' }}>
                    <DrawerItems labelStyle={{flex: 1}} {...this.props} />
                    <Button title="Logout" onPress={this._signOutAsync.bind(this)}/>
                </SafeAreaView>
            </View>
        );
    }
}

const HomepageStack = StackNavigator({
    Homepage: {
        screen: Homepage,
        navigationOptions: ({ navigation }) => ({
            title: 'Home',
            headerLeft: <View style={{marginLeft: 10}}><Icon name="menu" size={35} onPress={() => navigation.navigate('DrawerOpen') }/></View>,
            headerTitleStyle : { width: 400 }
        })
    }
});

const UserSettingsStack = StackNavigator({
    UserSettings: {
        screen: UserSettings,
        navigationOptions: ({ navigation }) => ({
            title: 'User Settings',
            headerLeft: <View style={{marginLeft: 10}}><Icon name="menu" size={35} onPress={() => navigation.navigate('DrawerOpen') }/></View>,
            headerTitleStyle : { width: 400 }
        })
    }
});

const NewGamblingSessionStack = StackNavigator({
    NewGamblingSession: {
        screen: NewGamblingSession,
        navigationOptions: ({ navigation }) => ({
            title: 'New Gambling Session',
            headerLeft: <View style={{marginLeft: 10}}><Icon name="menu" size={35} onPress={() => navigation.navigate('DrawerOpen') }/></View>,
            headerTitleStyle : { width: 400 }
        })
    }
});

const SessionHistoryStack = StackNavigator({
    SessionHistory: {
        screen: SessionHistory,
        navigationOptions: ({ navigation }) => ({
            title: 'Session History',
            headerLeft: <View style={{marginLeft: 10}}><Icon name="menu" size={35} onPress={() => navigation.navigate('DrawerOpen') }/></View>,
            headerTitleStyle : { width: 400 }
        })
    }
});

const DailyStatsStack = StackNavigator({
    DailyStats: {
        screen: DailyStats,
        navigationOptions: ({ navigation }) => ({
            title: 'Daily Stats',
            headerLeft: <View style={{marginLeft: 10}}><Icon name="menu" size={35} onPress={() => navigation.navigate('DrawerOpen') }/></View>,
            headerTitleStyle : { width: 400 }
        })
    }
});

const GraphsStack = StackNavigator({
    Graphs: {
        screen: Graphs,
        navigationOptions: ({ navigation }) => ({
            title: 'Graphs',
            headerLeft: <View style={{marginLeft: 10}}><Icon name="menu" size={35} onPress={() => navigation.navigate('DrawerOpen') }/></View>,
            headerTitleStyle : { width: 400 }
        })
    }
});

const AdviceStack = StackNavigator({
    Advice: {
        screen: Advice,
        navigationOptions: ({ navigation }) => ({
            title: 'Advice',
            headerLeft: <View style={{marginLeft: 10}}><Icon name="menu" size={35} onPress={() => navigation.navigate('DrawerOpen') }/></View>,
            headerTitleStyle : { width: 400 }
        })
    }
});

const AboutStack = StackNavigator({
    About: {
        screen: About,
        navigationOptions: ({ navigation }) => ({
            title: 'About',
            headerLeft: <View style={{marginLeft: 10}}><Icon name="menu" size={35} onPress={() => navigation.navigate('DrawerOpen') }/></View>,
            headerTitleStyle : { width: 400 }
        })
    }
});

const AppStack = DrawerNavigator(
    {
        Homepage: {
            screen: HomepageStack
        },
        UserSettings: {
            screen: UserSettingsStack
        },
        NewGamblingSession: {
            screen: NewGamblingSessionStack
        },
        SessionHistory: {
            screen: SessionHistoryStack
        },
        DailyStats: {
            screen: DailyStatsStack
        },
        Graphs: {
            screen: GraphsStack
        },
        Advice: {
            screen: AdviceStack
        },
        About: {
            screen: AboutStack
        }
    },
    {
        initialRouteName: 'Homepage',
        contentComponent: DrawerComponent,
        drawerOpenRoute: 'DrawerOpen',
        drawerCloseRoute: 'DrawerClose',
        drawerToggleRoute: 'DrawerToggle'
    }
);

// export default App;
const AuthStack = StackNavigator(
    {
        Login: {
            screen: LoginPage,
            navigationOptions: {
                title: 'Login',
                headerTitleStyle :{
                    width: 400
                }
            }
        },
        Register: {
            screen: RegisterPage,
            navigationOptions: {
                title: 'Register',
                headerTitleStyle :{
                    width: 400
                }
            },
            headerBackTitle: 'Back'
        }
    },
    {
        initialRouteName: 'Login'
    }
);

export default SwitchNavigator(
    {
        AuthLoading: AuthLoadingScreen,
        App: AppStack,
        Auth: AuthStack,
    },
    {
        initialRouteName: 'AuthLoading',
    }
);
