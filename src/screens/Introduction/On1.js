import {
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  KeyboardAvoidingView,
  StatusBar,
  Image,
  ScrollView,
} from 'react-native';
import React, { useState, useContext } from 'react';
import { Colors } from '../../theme/color';
import style from '../../theme/style';
import { useNavigation } from '@react-navigation/native';
import { setRole } from '../../redux/slice/RoleSlice';
import { useDispatch } from 'react-redux';
const width = Dimensions.get('screen').width;
const height = Dimensions.get('screen').height;
export default function On1() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  return (
    <SafeAreaView style={[style.area, { backgroundColor: Colors.bg }]}>
      <StatusBar backgroundColor={Colors.bg} translucent={true} barStyle={'dark-content'} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : null}>
        <View style={[style.main, { backgroundColor: Colors.bg }]}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            style={{ marginTop: 10 }}
          >
            <View style={style.flexBox}>
              <Image
                source={require('../../../assets/image/compLogo3x.png')}
                resizeMode="cover"
                style={{
                  height: height / 5,
                  width: width / 2,
                  alignSelf: 'center',
                  marginTop: 80,
                }}
              />

              <Text style={[style.apptitle, { color: '#7E52A1', fontWeight: 700 }]}>
                CAN
                <Text style={[style.apptitle, { color: '#14B6AA' }]}>WINN</Text>
              </Text>
              <Text style={[{ textAlign: 'center', color: Colors.active, fontWeight: 700 }]}>
                Job Finder App
              </Text>

              <Text style={[style.apptitle, { color: Colors.txt, marginTop: 60 }]}>
                Get Started As
              </Text>
              <Text style={[style.r14, { color: Colors.txt, marginTop: 0, textAlign: 'center' }]}>
                Sign up now and take the next step {'\n'} toward success.
              </Text>
            </View>
            <View style={{ padding: 5, marginTop: 20 }}>
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate('Signup', { userType: 'Job Seeker' });
                  dispatch(setRole('Job Seeker'));
                }}
                style={[style.signupBox, { borderRadius: 10 }]}
              >
                <Image
                  source={require('../../../assets/image/5.png')}
                  resizeMode="stretch"
                  style={{ height: 77, width: 77 }}
                />
                <View style={{ marginLeft: 10, flex: 1 }}>
                  <Text style={[style.s16, { color: '#80559A' }]}>JOB SEEKERS</Text>
                  <Text style={[style.r14, { color: Colors.txt, marginTop: 3 }]}>
                    Finding a job here never been easier than before
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            <View style={{ padding: 5, marginTop: 15, marginBottom: 20 }}>
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate('Signup', { userType: 'Company' });
                  dispatch(setRole('Company'));
                }}
                style={[style.signupBox, { borderRadius: 10 }]}
              >
                <Image
                  source={require('../../../assets/image/6.png')}
                  resizeMode="stretch"
                  style={{ height: 77, width: 77 }}
                />
                <View style={{ marginLeft: 10, flex: 1 }}>
                  <Text style={[style.s16, { color: '#80559A' }]}>COMPANY</Text>
                  <Text style={[style.r14, { color: Colors.txt, marginTop: 3 }]}>
                    Let’s recruit your great candidate faster here{' '}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
