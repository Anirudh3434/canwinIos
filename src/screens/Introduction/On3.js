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
} from 'react-native';
import React, { useState, useContext } from 'react';
import { Colors } from '../../theme/color';
import style from '../../theme/style';
import { useNavigation } from '@react-navigation/native';
import { Avatar } from 'react-native-paper';
import Icon from 'react-native-vector-icons/Ionicons';
import Icons from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon1 from 'react-native-vector-icons/MaterialIcons';

const width = Dimensions.get('screen').width;
const height = Dimensions.get('screen').height;

export default function On3() {
  const navigation = useNavigation();
  return (
    <SafeAreaView style={[style.area, { backgroundColor: Colors.bg }]}>
      <StatusBar backgroundColor="transparent" translucent={true} barStyle={'dark-content'} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : null}>
        <View style={[style.main, { backgroundColor: Colors.bg }]}>
          <Text
            style={[style.s22, { color: Colors.txt, marginTop: Platform.OS === 'ios' ? 10 : 30 }]}
          >
            Where do you want to work?
          </Text>

          <View style={{ padding: 5, marginTop: 10 }}>
            <TouchableOpacity
              style={[
                style.shadow,
                {
                  backgroundColor: Colors.bg,
                  shadowColor: Colors.active,
                  justifyContent: 'center',
                  padding: 15,
                  borderRadius: 30,
                  flexDirection: 'row',
                  alignItems: 'center',
                },
              ]}
            >
              <Icon1 name="my-location" size={24} color={Colors.active} />
              <Text style={[style.r14, { color: Colors.txt1, marginLeft: 10 }]}>
                Select Current Location
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: 10 }}>
            <Text style={[style.r15, { color: Colors.txt1, marginTop: 20 }]}>Dubai</Text>
            <View
              style={[style.divider, { backgroundColor: Colors.divider, marginVertical: 20 }]}
            ></View>

            <Text style={[style.r15, { color: Colors.txt1 }]}>Sharjah</Text>
            <View
              style={[style.divider, { backgroundColor: Colors.divider, marginVertical: 20 }]}
            ></View>

            <Text style={[style.r15, { color: Colors.txt1 }]}>Al Hamraniyah Ras </Text>
            <View
              style={[style.divider, { backgroundColor: Colors.divider, marginVertical: 20 }]}
            ></View>

            <Text style={[style.r15, { color: Colors.txt1 }]}>Al Khaimah</Text>
            <View
              style={[style.divider, { backgroundColor: Colors.divider, marginVertical: 20 }]}
            ></View>

            <Text style={[style.r15, { color: Colors.txt1 }]}>Al Hamriyah</Text>
            <View
              style={[style.divider, { backgroundColor: Colors.divider, marginVertical: 20 }]}
            ></View>

            <Text style={[style.r15, { color: Colors.txt1 }]}>Ajman</Text>
            <View
              style={[style.divider, { backgroundColor: Colors.divider, marginVertical: 20 }]}
            ></View>

            <Text style={[style.r15, { color: Colors.txt1, marginBottom: 10 }]}>Umm al-Quwain</Text>
          </ScrollView>

          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            style={[style.btn, { marginVertical: 20 }]}
          >
            <Text style={[style.btntxt]}>PROCEED</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
