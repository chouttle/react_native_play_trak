import React from 'react';
import {ActivityIndicator, StyleSheet, Text, View, ViewPagerAndroid} from 'react-native';
const baseStyles = require("../styles/baseStyles");
// import firebase from 'firebase';

class Advice extends React.Component {

    constructor(props) {
        /*
        * TODO: Won't work on iOS as it is Android specific.
        */
        super(props);
        const { params } = this.props.navigation.state;
        this.state = {
            error: "",
            loading: false,
            selectedIndex: 0
        }
    }

    renDots(pageCount) {
        if (pageCount <= 0) return null;
        let dotsView = [];
        for (let i = 0; i < pageCount; i++) {
            let isSelect = i === this.state.selectedIndex;
            dotsView.push(
                <View
                    style={[styles.dot, isSelect ? styles.selectDot : null]}
                    key={i}
                />
            )
        }
        return (
            <View {...this.props} style={[styles.container, this.props.style]} >
                {dotsView}
            </View>
        )
    }

    render() {
        return (
            <View style={baseStyles.container}>
                <ViewPagerAndroid
                    style={baseStyles.viewPagerStyles}
                    initialPage={0}
                    onPageSelected={(event) => {this.setState({selectedIndex: event.nativeEvent.position});}}>
                    <View>
                        <Text style={baseStyles.adviceTitles}>
                            Don’t think of gambling as a way to make money.
                        </Text>
                        <Text style={baseStyles.adviceText}>
                            The bottom line is that gambling establishments like land-based casinos and online gambling sites are set up to take in more money than they pay out. This means that over time, you will lose more money than you win.
                            {'\n\n'}
                            And, remember it's not just casinos. All forms of gambling have the same principle – the vast majority of people lose so that a very small minority can have big wins. Virtually all people with gambling problems hold the false expectation that they are the ones who will be the big winners.
                            {'\n\n'}
                            That belief feeds the problem.
                        </Text>
                    </View>
                    <View>
                        <Text style={baseStyles.adviceTitles}>
                            Always gamble with money that you can afford to lose.
                        </Text>
                        <Text style={baseStyles.adviceText}>
                            Gamble with money that you set aside for fun, like going to the movies or going out for drinks. Never use money that you need for important things like rent, bills, tuition, etc.
                        </Text>
                    </View>
                    <View>
                        <Text style={baseStyles.adviceTitles}>
                            Never chase losses.
                        </Text>
                        <Text style={baseStyles.adviceText}>
                            If you lose money, never try to get it back by going over your limit. This usually leads to even bigger losses.
                        </Text>
                    </View>
                    <View>
                        <Text style={baseStyles.adviceTitles}>
                            Set a money limit.
                        </Text>
                        <Text style={baseStyles.adviceText}>
                            Decide how much money you can afford to lose before you play. When you have lost that amount of money, quit. If you win – enjoy, but remember it won’t happen most of the time.
                        </Text>
                    </View>
                    <View>
                        <Text style={baseStyles.adviceTitles}>
                            Set a time limit.
                        </Text>
                        <Text style={baseStyles.adviceText}>
                            Decide how much time you can afford to spend gambling. When you reach that time limit, stop gambling.
                        </Text>
                    </View>
                    <View>
                        <Text style={baseStyles.adviceTitles}>
                            Don’t gamble when you are depressed or upset.
                        </Text>
                        <Text style={baseStyles.adviceText}>
                            It is hard to make good decisions about gambling when you are feeling down.
                        </Text>
                    </View>
                    <View>
                        <Text style={baseStyles.adviceTitles}>
                            Balance gambling with other activities.
                        </Text>
                        <Text style={baseStyles.adviceText}>
                            It’s important to enjoy other activities so that gambling doesn’t become too big a part of your life.
                        </Text>
                    </View>
                    <View>
                        <Text style={baseStyles.adviceTitles}>
                            Gambling, alcohol and drugs are not a good combination.
                        </Text>
                        <Text style={baseStyles.adviceText}>
                            Gambling under the influence is common, but it generally leads people to make bad decisions that they regret later.
                        </Text>
                    </View>
                </ViewPagerAndroid>
                {this.renDots(8)}
                {this.state.loading &&
                <View style={baseStyles.loading}>
                    <ActivityIndicator size='large' />
                </View>}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 30,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 6 >> 1,
        backgroundColor: '#BBBBBB',
        margin: 6 >> 1
    },
    selectDot: {
        width: 8,
        height: 8,
        borderRadius: 8 >> 1,
        backgroundColor: 'lightblue',
        margin: 8 >> 1
    }
});

export default Advice;
