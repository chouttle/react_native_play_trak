import React from 'react';
import {ActivityIndicator, Dimensions, Platform, ScrollView, StyleSheet, Text, View, ViewPagerAndroid} from 'react-native';
import Carousel from "react-native-snap-carousel";
const baseStyles = require("../styles/baseStyles");
// import firebase from 'firebase';

class Advice extends React.Component {

    adviceItems = [
        {
            title: "Don’t think of gambling as a way to make money.",
            text: "The bottom line is that gambling establishments like land-based casinos and online gambling sites are set up to take in more money than they pay out. This means that over time, you will lose more money than you win.\n" +
                "\n" +
                "And, remember it's not just casinos. All forms of gambling have the same principle – the vast majority of people lose so that a very small minority can have big wins. Virtually all people with gambling problems hold the false expectation that they are the ones who will be the big winners.\n" +
                "\n" +
                "That belief feeds the problem."
        },
        {
            title: "Always gamble with money that you can afford to lose.",
            text: "Gamble with money that you set aside for fun, like going to the movies or going out for drinks. Never use money that you need for important things like rent, bills, tuition, etc."
        },
        {
            title: "Never chase losses.",
            text: "If you lose money, never try to get it back by going over your limit. This usually leads to even bigger losses."
        },
        {
            title: "Set a money limit.",
            text: "Decide how much money you can afford to lose before you play. When you have lost that amount of money, quit. If you win – enjoy, but remember it won’t happen most of the time."
        },
        {
            title: "Set a time limit.",
            text: "Decide how much time you can afford to spend gambling. When you reach that time limit, stop gambling."
        },
        {
            title: "Don’t gamble when you are depressed or upset.",
            text: "It is hard to make good decisions about gambling when you are feeling down."
        },
        {
            title: "Balance gambling with other activities.",
            text: "It’s important to enjoy other activities so that gambling doesn’t become too big a part of your life."
        },
        {
            title: "Gambling, alcohol and drugs are not a good combination.",
            text: "Gambling under the influence is common, but it generally leads people to make bad decisions that they regret later."
        }
    ];

    constructor(props) {
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
                    style={[adviceStyles.dot, isSelect ? adviceStyles.selectDot : null]}
                    key={i}
                />
            )
        }
        return (
            <View {...this.props} style={[adviceStyles.container, this.props.style]} >
                {dotsView}
            </View>
        )
    }

    pagesView() {
        const pages = [];
        for(let i = 0; i < this.adviceItems.length; i++) {
            pages.push(
                <View key={i}>
                    <Text style={baseStyles.adviceTitles}>
                        {this.adviceItems[i].title}
                    </Text>
                    <Text style={baseStyles.adviceText}>
                        {this.adviceItems[i].text}
                    </Text>
                </View>
            )
        }
        return (pages);
    }

    _renderItem ({item, index}) {
        return (
            <ScrollView key={index} style={baseStyles.scrollViewContainer}>
                <Text style={baseStyles.adviceTitles}>{ item.title }</Text>
                <Text style={baseStyles.adviceText}>{ item.text }</Text>
            </ScrollView>
        );
    }

    render() {
        return (
            <View style={baseStyles.container}>
                {Platform.select({
                    ios:
                        <Carousel
                            // ref={(c) => { this._carousel = c; }}
                            data={this.adviceItems}
                            renderItem={this._renderItem}
                            sliderWidth={Dimensions.get('window').width}
                            itemWidth={300}
                            windowSize={1}
                            onSnapToItem={(index) => this.setState({ selectedIndex: index }) }
                        />,
                    android:
                        <ViewPagerAndroid
                            style={baseStyles.viewPagerStyles}
                            initialPage={0}
                            onPageSelected={(event) => {this.setState({selectedIndex: event.nativeEvent.position});}}>
                            {this.pagesView()}
                        </ViewPagerAndroid>
                })}
                {this.renDots(8)}
                {this.state.loading &&
                <View style={baseStyles.loading}>
                    <ActivityIndicator size='large' />
                </View>}
            </View>
        );
    }
}

const adviceStyles = StyleSheet.create({
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
