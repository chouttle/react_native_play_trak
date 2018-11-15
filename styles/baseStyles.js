import {Dimensions, Platform} from "react-native";

const React = require('react-native');
const {StyleSheet} = React;


module.exports = StyleSheet.create({
    container: {
        flex: 1,
        // backgroundColor: '#fff'
        backgroundColor: '#0bc5c5',
        justifyContent: 'center',
    },
    scrollViewContainer: {
        flex: 1,
        // backgroundColor: '#fff'
        backgroundColor: '#0bc5c5',
        padding: 20
    },
    scrollViewHorizontal: {
        backgroundColor: '#fff',
        // width: window.width
        width: Dimensions.get('window').width
    },
    viewPagerStyles: {
        flex: 1
    },
    textInputContainer: {
        flexDirection:'row',
        width: window.width
    },
    textInputs: {
        flexDirection: 'column',
        flex: 4,
        justifyContent: 'space-around'
    },
    textInputView: {
        height: 40,
        marginVertical: 10,
        marginHorizontal: '5%'
    },
    textInput: Platform.select({
            ios: {
                fontSize: 18,
                color: 'black',
                backgroundColor: 'white',
                textAlign: 'center',
                paddingBottom: 5,
                paddingTop: 5,
                // borderStyle: 'solid',
                // borderColor: 'black',
                // borderWidth: 1,
                borderRadius: 10
            },
            android: {
                fontSize: 18,
                color: 'white',
                paddingBottom: 10
                // borderStyle: 'solid',
                // borderColor: 'black',
                // borderWidth: 1,
                // borderRadius: 10
            }
    }),
    touchBtn: {
        backgroundColor: 'royalblue',
        padding: 10,
        shadowColor: '#000000',
        shadowOffset: {
            width: 0,
            height: 1
        },
        shadowRadius: 5,
        shadowOpacity: 1.0
    },
    touchBtnText: {
        textAlign: 'center',
        fontSize: 18,
        color: 'white',
        fontWeight: 'bold'
    },
    welcomeMsg: {
        lineHeight: 100,
        fontSize: 22,
        textAlign: 'center',
        color: 'white'
    },
    titleMsg: {
        lineHeight: 100,
        fontSize: 28,
        textAlign: 'center',
        color: 'white'
    },
    pAndT: {
        color: 'red'
        // fontWeight: 'bold'
    },
    centeredText: {
        textAlign: 'center'
    },
    buttonsView: {
        marginHorizontal: '20%'
    },
    noAccountText: {
        marginTop: 10,
        marginBottom: 10,
        lineHeight: 20,
        textAlign: 'center',
        color: 'white'
    },
    pickerInput: {
        borderStyle: 'solid',
        borderColor: 'black',
        borderWidth: 1,
        borderRadius: 10
    },
    pickerLabel: {
        fontSize: 24,
        color: 'white',
        textAlign: 'center'
    },
    homeText: {
        lineHeight: 50,
        fontSize: 28,
        textAlign: 'center',
        color: 'white'
    },
    updatingSessionTitle: {
        fontSize: 24,
        textAlign: 'center',
        color: 'white'
    },
    adviceTitles: {
        fontSize: 24,
        textAlign: 'center',
        marginHorizontal: 30,
        marginVertical: 30,
        fontWeight: 'bold',
        color: 'white'
    },
    adviceText: {
        textAlign: 'center',
        marginHorizontal: 30,
        marginVertical: 30,
        fontSize: 16,
        color: 'white'
    },
    loading: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F5FCFF88'
    },
    headerTitleStyle: {
        width: 400,
        color: 'black'
        // color: '#0bc5c5'
    },
    whiteText: {
        color: 'white'
    },
    signupButton: {
        // marginBottom: 15,
        // backgroundColor: '#bbb',
        // paddingVertical: 15,
        // paddingHorizontal: 30,
        // borderRadius: 5,
        // alignItems: 'center',
        // width: 250,
    },
    signupButtonText: {
        fontSize: 15,
        color: '#fff',
    },
    errorText: {
        color: 'red',
        fontSize: 18,
        marginBottom: 7,
        fontWeight: '600'
    }
});