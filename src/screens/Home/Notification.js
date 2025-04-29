import {
  View,
  Text,
  FlatList,
  SafeAreaView,
  Dimensions,
  StatusBar,
  KeyboardAvoidingView,
  ImageBackground,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
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

export default function Notification() {
  const navigation = useNavigation();
  return (
    <SafeAreaView style={[style.area, { backgroundColor: Colors.bg }]}>
      <StatusBar backgroundColor={Colors.bg} translucent={false} barStyle={'dark-content'} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : null}>
        <View style={[style.main, { backgroundColor: Colors.bg }]}>
          <AppBar
            color={Colors.bg}
            title="Notification"
            centerTitle={true}
            titleStyle={[style.subtitle, { color: Colors.txt }]}
            elevation={0}
            leading={
              <TouchableOpacity onPress={() => navigation.navigate('Home')} style={[style.icon]}>
                <Icon name="arrow-back" size={24} color={'#6C6C6C'} />
              </TouchableOpacity>
            }
            trailing={
              <TouchableOpacity>
                <Icon name="ellipsis-vertical" size={24} color={'#6C6C6C'} />
              </TouchableOpacity>
            }
          />

          <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: 10 }}>
            <View style={{ backgroundColor: Colors.primary, borderRadius: 12, padding: 15 }}>
              <View
                style={{
                  height: 12,
                  width: 12,
                  backgroundColor: Colors.secondary,
                  borderRadius: 6,
                }}
              ></View>
              <Text style={[style.r14, { color: Colors.secondary, marginTop: 8 }]}>
                You has apply an job in Queenify Group as UI Designer
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
                <Icons name="clock-outline" size={16} color={'#FFFFFF55'}></Icons>
                <Text
                  style={[
                    style.r14,
                    { color: '#FFFFFF55', flex: 1, marginLeft: 5, marginBottom: -5 },
                  ]}
                >
                  10h ago
                </Text>
                <Text style={[style.m14, { color: '#FFFFFF', marginBottom: -5 }]}>
                  Mark as read
                </Text>
              </View>
            </View>

            <View
              style={{ backgroundColor: '#FBF6FF', borderRadius: 12, padding: 15, marginTop: 15 }}
            >
              <Text style={[style.r16, { color: Colors.txt, marginTop: 8 }]}>
                Complete your profile
              </Text>
              <Text style={[style.r14, { color: '#484848', marginTop: 8 }]}>
                Please verify your profile information to continue using this app
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
                <Icons name="clock-outline" size={16} color={'#787878'}></Icons>
                <Text
                  style={[
                    style.r14,
                    { color: '#787878', flex: 1, marginBottom: -5, marginLeft: 5 },
                  ]}
                >
                  4 June
                </Text>
              </View>
            </View>

            <View
              style={{ backgroundColor: '#FBF6FF', borderRadius: 12, padding: 15, marginTop: 15 }}
            >
              <Text style={[style.r16, { color: Colors.txt, marginTop: 8 }]}>Apply Success</Text>
              <Text style={[style.r14, { color: '#484848', marginTop: 8 }]}>
                You has apply an job in Queenify Group as UI Designer
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
                <Icons name="clock-outline" size={16} color={'#787878'}></Icons>
                <Text
                  style={[
                    style.r14,
                    { color: '#787878', flex: 1, marginBottom: -5, marginLeft: 5 },
                  ]}
                >
                  3 June
                </Text>
              </View>
            </View>

            <View
              style={{ backgroundColor: '#FBF6FF', borderRadius: 12, padding: 15, marginTop: 15 }}
            >
              <Text style={[style.r16, { color: Colors.txt, marginTop: 8 }]}>Interview Calls</Text>
              <Text style={[style.r14, { color: '#484848', marginTop: 8 }]}>
                Congratulations! You have interview calls tomorrow. Check schedule here..
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
                <Icons name="clock-outline" size={16} color={'#787878'}></Icons>
                <Text
                  style={[
                    style.r14,
                    { color: '#787878', flex: 1, marginBottom: -5, marginLeft: 5 },
                  ]}
                >
                  4m ago
                </Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
