import {
  View,
  Text,
  SafeAreaView,
  Dimensions,
  StatusBar,
  KeyboardAvoidingView,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import React, { useState, useContext } from 'react';
import { useNavigation } from '@react-navigation/native';
import style from '../../theme/style';
import { Colors } from '../../theme/color';
import Icon from 'react-native-vector-icons/Ionicons';
import Icons from 'react-native-vector-icons/MaterialCommunityIcons';
import { AppBar } from '@react-native-material/core';

const width = Dimensions.get('screen').width;
const height = Dimensions.get('screen').height;

export default function Success() {
  const navigation = useNavigation();
  return (
    <SafeAreaView style={[style.area, { backgroundColor: Colors.bg }]}>
      <StatusBar backgroundColor="transparent" translucent={true} barStyle={'dark-content'} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : null}>
        <View style={[style.main, { backgroundColor: Colors.bg, marginTop: 100 }]}>
          <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: 10 }}>
            <Image
              source={require('../../../assets/image/a3.png')}
              resizeMode="stretch"
              style={{ height: height / 5, width: width / 2.3, alignSelf: 'center', marginTop: 40 }}
            ></Image>

            <Text
              style={[
                style.m22,
                {
                  color: Colors.txt,
                  marginTop: 30,
                  textAlign: 'center',
                  color: '#14B6AA',
                  fontWeight: 'bold',
                  fontSize: 40,
                },
              ]}
            >
              You are successful registered!
            </Text>
            <Text
              style={[style.r16, { color: Colors.disable1, textAlign: 'center', marginTop: 10 }]}
            >
              Nice to see you again. Let’s find your Job
            </Text>

            <View style={{ width: '100%', alignItems: 'center' }}>
              <TouchableOpacity
                onPress={() => navigation.navigate('Category')}
                style={[style.btn, { marginTop: 70, marginBottom: 20, width: width / 1.5 }]}
              >
                <Text style={[style.btntxt, { marginBottom: -8 }]}>LET'S GO</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
