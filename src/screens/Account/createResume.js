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

export default function CreateResume() {
  const navigation = useNavigation();
  return (
    <SafeAreaView style={[style.area, { backgroundColor: Colors.bg, paddingBottom: 50 }]}>
      <StatusBar backgroundColor="transparent" translucent={true} barStyle={'dark-content'} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : null}>
        <View style={[style.main, { backgroundColor: Colors.bg, marginTop: 20 }]}>
          <AppBar
            color={Colors.bg}
            elevation={0}
            leading={
              <TouchableOpacity onPress={() => navigation.goBack()} style={[style.icon]}>
                <Icon name="arrow-back" size={24} color={'#6C6C6C'} />
              </TouchableOpacity>
            }
          />

          <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: 10 }}>
            <Image
              source={require('../../../assets/image/createResume.jpg')}
              resizeMode="stretch"
              style={{
                height: 350,
                width: 350,
                alignSelf: 'center',
                marginTop: 40,
                objectFit: 'contain',
              }}
            ></Image>

            <Text
              style={[
                style.m22,
                {
                  color: Colors.txt,
                  marginTop: 30,

                  textAlign: 'center',
                  fontWeight: 'bold',
                  fontSize: 28,
                },
              ]}
            >
              Build Your Professional Resume
            </Text>
            <Text style={[style.r16, { color: '#667085', textAlign: 'center', marginTop: 10 }]}>
              Create a standout resume in just a few steps. Fill in your details, and we’ll format
              them for you!
            </Text>

            <View style={{ width: '100%', alignItems: 'center' }}>
              <TouchableOpacity
                onPress={() => navigation.navigate('Resume Form')}
                style={[
                  style.btn,
                  {
                    marginTop: 70,
                    marginBottom: 20,
                    width: width / 1.5,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  },
                ]}
              >
                <Text style={[style.btntxt, { marginBottom: -8, fontWeight: '400', fontSize: 20 }]}>
                  Create my resume
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
