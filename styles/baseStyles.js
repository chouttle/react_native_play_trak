const React = require('react-native');
const {StyleSheet} = React;

module.exports = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        justifyContent: 'center',
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
        marginHorizontal: 40
    },
    textInput: {
        fontSize: 18,
        color: 'black',
        textAlign: 'center',
        borderStyle: 'solid',
        borderColor: 'black',
        borderWidth: 1,
        borderRadius: 10
    },
    touchBtn: {
        backgroundColor: 'lightblue',
        padding: 10,
        shadowColor: '#000000',
        shadowOffset: {
            width: 0,
            height: 3
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
        textAlign: 'center'
    },
    pAndT: {
        color: 'red'
        // fontWeight: 'bold'
    },
    centeredText: {
        textAlign: 'center'
    },
    buttonsView: {
        marginHorizontal: 80
    },
    noAccountText: {
        marginTop: 30,
        lineHeight: 20,
        textAlign: 'center'
    },
    pickerInput: {
        borderStyle: 'solid',
        borderColor: 'black',
        borderWidth: 1,
        borderRadius: 10
    },
    pickerLabel: {
        fontSize: 24,
        color: 'black',
        textAlign: 'center'
    },
    homeText: {
        lineHeight: 100,
        fontSize: 32,
        textAlign: 'center'
    },
    adviceTitles: {
        fontSize: 24,
        textAlign: 'center',
        marginHorizontal: 30,
        marginVertical: 30,
        fontWeight: 'bold'
    },
    adviceText: {
        textAlign: 'center',
        marginHorizontal: 30,
        marginVertical: 30,
        fontSize: 16
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
    }
});