import {
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  ImageBackground,
  KeyboardAvoidingView,
  StatusBar,
  Image,
  ScrollView,
  TextInput,
} from 'react-native';
import React, { useState, useContext, useRef } from 'react';
import { Colors } from '../../theme/color';
import style from '../../theme/style';
import { useNavigation } from '@react-navigation/native';
import { Avatar } from 'react-native-paper';
import { AppBar } from '@react-native-material/core';
import Icon from 'react-native-vector-icons/Ionicons';
import Icons from 'react-native-vector-icons/MaterialCommunityIcons';

const width = Dimensions.get('screen').width;
const height = Dimensions.get('screen').height;

export default function CDetail() {
  const navigation = useNavigation();
  return (
    <SafeAreaView style={[style.area, { backgroundColor: Colors.bg }]}>
      <StatusBar backgroundColor={Colors.bg} translucent={false} barStyle={'dark-content'} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : null}>
        <View
          style={[
            style.main,
            { backgroundColor: Colors.bg, marginTop: Platform.OS === 'ios' ? 10 : 0 },
          ]}
        >
          <AppBar
            color={Colors.bg}
            elevation={0}
            title="Company Details"
            titleStyle={[style.subtitle, { color: Colors.txt }]}
            leading={
              <TouchableOpacity
                onPress={() => navigation.navigate('JobDetail')}
                style={[style.icon]}
              >
                <Icon name="arrow-back" size={24} color={Colors.active} />
              </TouchableOpacity>
            }
            trailing={<Icon name="ellipsis-vertical" size={20} color={Colors.active} />}
          />

          <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: 10 }}>
            <Image
              source={require('../../../assets/image/s17.png')}
              resizeMode="stretch"
              style={{ height: 88, width: 88, marginTop: 10 }}
            />

            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 20 }}>
              <View style={{ flex: 1 }}>
                <Text style={[style.subtitle, { color: Colors.txt }]}>Highspeed Studios.</Text>
                <Text style={[style.r14, { color: Colors.txt }]}>Medan, Indonesia</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Icon name="star" size={24} color="#FF912C" />
                <Text style={[style.subtitle, { color: '#FF912C' }]}>4.5</Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', marginTop: 20 }}>
              <View
                style={{
                  height: 56,
                  width: 56,
                  borderColor: '#E2E8F0',
                  borderWidth: 1,
                  borderRadius: 30,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Icon name="call" size={26} color={Colors.primary} />
              </View>
              <View style={{ marginLeft: 15, flex: 1 }}>
                <Text style={[style.r14, { color: '#6F6F6F' }]}>Telephone</Text>
                <Text style={[style.m16, { color: Colors.txt }]}>+51 632 445 556</Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', marginTop: 20 }}>
              <View
                style={{
                  height: 56,
                  width: 56,
                  borderColor: '#E2E8F0',
                  borderWidth: 1,
                  borderRadius: 30,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Icon name="mail" size={26} color={Colors.primary} />
              </View>
              <View style={{ marginLeft: 15, flex: 1 }}>
                <Text style={[style.r14, { color: '#6F6F6F' }]}>Email</Text>
                <Text style={[style.m16, { color: Colors.txt }]}>highspeedst@mail.com</Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', marginTop: 20 }}>
              <View
                style={{
                  height: 56,
                  width: 56,
                  borderColor: '#E2E8F0',
                  borderWidth: 1,
                  borderRadius: 30,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Image
                  source={require('../../../assets/image/s18.png')}
                  resizeMode="stretch"
                  style={{ height: 26, width: 26 }}
                />
              </View>
              <View style={{ marginLeft: 15, flex: 1 }}>
                <Text style={[style.r14, { color: '#6F6F6F' }]}>Website</Text>
                <Text style={[style.m16, { color: Colors.txt }]}>highspeed.studio</Text>
              </View>
            </View>

            <Text style={[style.m18, { color: Colors.txt, marginTop: 30 }]}>About Company</Text>

            <Text style={[style.r14, { color: '#313131', marginTop: 5 }]}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua.
            </Text>

            <Text style={[style.r14, { color: '#313131', marginTop: 5 }]}>
              Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat
              nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
            </Text>

            <TouchableOpacity
              style={[
                style.btn,
                {
                  marginVertical: 20,
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 10,
                },
              ]}
            >
              <Text style={[style.btntxt, { flex: 1 }]}>25 Available Jobs</Text>
              <Icon name="chevron-forward" size={24} color={Colors.secondary} />
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
