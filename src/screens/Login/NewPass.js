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

export default function NewPass() {
  const navigation = useNavigation();
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isPasswordVisible1, setIsPasswordVisible1] = useState(false);

  return (
    <SafeAreaView style={[style.area, { backgroundColor: Colors.bg }]}>
      <StatusBar backgroundColor="transparent" translucent={true} barStyle={'dark-content'} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : null}>
        <View style={[style.main, { backgroundColor: Colors.bg, marginTop: 30 }]}>
          <AppBar
            color={Colors.bg}
            elevation={0}
            leading={
              <TouchableOpacity onPress={() => navigation.navigate('Forgot')} style={[style.icon]}>
                <Icon name="arrow-back" size={24} color={'#6C6C6C'} />
              </TouchableOpacity>
            }
          />

          <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: 10 }}>
            <Text style={[style.m22, { color: Colors.txt, marginTop: 10 }]}>Create an Account</Text>
            <Text style={[style.r16, { color: Colors.disable1 }]}>
              Please fill registration form below
            </Text>

            <View
              style={[
                style.inputContainer,
                {
                  marginTop: 30,
                  borderColor: isFocused === 'Password' ? Colors.primary : Colors.bord,
                },
              ]}
            >
              <Icons name="lock-outline" size={22} color={Colors.disable2}></Icons>
              <TextInput
                placeholder="Password"
                placeholderTextColor={Colors.disable2}
                secureTextEntry={!isPasswordVisible}
                selectionColor={Colors.primary}
                onFocus={() => setIsFocused('Password')}
                onBlur={() => setIsFocused(false)}
                style={[
                  style.m16,
                  { color: Colors.active, flex: 1, marginBottom: -8, marginLeft: 10 },
                ]}
              />
              <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
                <Icon
                  name={!isPasswordVisible ? 'eye-off' : 'eye'}
                  color={Colors.disable}
                  size={20}
                />
              </TouchableOpacity>
            </View>

            <View
              style={[
                style.inputContainer,
                { marginTop: 15, borderColor: isFocused === 'Pass' ? Colors.primary : Colors.bord },
              ]}
            >
              <Icons name="lock-outline" size={22} color={Colors.disable2}></Icons>
              <TextInput
                placeholder="Password"
                placeholderTextColor={Colors.disable2}
                secureTextEntry={!isPasswordVisible1}
                selectionColor={Colors.primary}
                onFocus={() => setIsFocused('Pass')}
                onBlur={() => setIsFocused(false)}
                style={[
                  style.m16,
                  { color: Colors.active, flex: 1, marginBottom: -8, marginLeft: 10 },
                ]}
              />
              <TouchableOpacity onPress={() => setIsPasswordVisible1(!isPasswordVisible1)}>
                <Icon
                  name={!isPasswordVisible1 ? 'eye-off' : 'eye'}
                  color={Colors.disable}
                  size={20}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => navigation.navigate('Success')}
              style={[style.btn, { marginTop: 70, marginBottom: 20 }]}
            >
              <Text style={[style.btntxt, { marginBottom: -8 }]}>CREATE</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
