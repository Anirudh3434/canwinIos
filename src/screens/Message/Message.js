import {
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
  FlatList,
  SafeAreaView,
  ImageBackground,
  StatusBar,
  Image,
  ScrollView,
  TextInput,
} from 'react-native';
import React, { useState, useContext } from 'react';
import { Colors } from '../../theme/color';
import style from '../../theme/style';
import { useNavigation } from '@react-navigation/native';
import { Avatar } from 'react-native-paper';
import { AppBar, HStack } from '@react-native-material/core';
import Icon from 'react-native-vector-icons/Ionicons';
import Icons from 'react-native-vector-icons/MaterialCommunityIcons';

const width = Dimensions.get('screen').width;
const height = Dimensions.get('screen').height;

export default function Message() {
  const navigation = useNavigation();
  const [visible, setVisible] = useState(false);
  return (
    <SafeAreaView style={[style.area, { backgroundColor: Colors.bg }]}>
      <StatusBar translucent={false} backgroundColor={Colors.bg} barStyle={'dark-content'} />
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
            title={
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Image
                  source={require('../../../assets/image/a14.png')}
                  resizeMode="stretch"
                  style={{ height: 44, width: 44 }}
                />
                <Text style={[style.m18, { color: Colors.txt, marginLeft: 5, marginBottom: -4 }]}>
                  Claudia Surr
                </Text>
              </View>
            }
            leading={
              <TouchableOpacity
                onPress={() => navigation.navigate('MyTabs')}
                style={[style.icon, { borderColor: Colors.bord }]}
              >
                <Icon name="arrow-back" size={24} color={'#6C6C6C'} />
              </TouchableOpacity>
            }
            trailing={
              <TouchableOpacity>
                <Icon name="ellipsis-vertical" size={24} color={Colors.active} />
              </TouchableOpacity>
            }
          />
          <View
            style={[style.divider, { backgroundColor: Colors.bord, marginVertical: 15, height: 1 }]}
          ></View>
          <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: 10 }}>
            <View style={{ alignItems: 'flex-start', marginTop: 10 }}>
              <View
                style={{
                  width: width / 1.5,
                  paddingHorizontal: 15,
                  paddingVertical: 10,
                  backgroundColor: '#FCEED4',
                  borderTopLeftRadius: 15,
                  borderTopRightRadius: 15,
                  borderBottomRightRadius: 15,
                }}
              >
                <Text style={[style.r14, { color: '#262626' }]}>
                  Do you have a time for interviews today?
                </Text>
              </View>
              <Text style={[style.r12, { color: '#969696', marginTop: 5 }]}>4.30 AM</Text>
            </View>

            <View style={{ alignItems: 'flex-end', marginTop: 10 }}>
              <View
                style={{
                  width: width / 3,
                  paddingHorizontal: 15,
                  paddingVertical: 10,
                  backgroundColor: Colors.primary,
                  borderTopLeftRadius: 15,
                  borderBottomLeftRadius: 15,
                  borderBottomRightRadius: 15,
                }}
              >
                <Text style={[style.r14, { color: Colors.secondary }]}>Yes, I have.</Text>
              </View>
              <Text style={[style.r12, { color: '#969696', marginTop: 5 }]}>9.30 AM</Text>
            </View>

            <View style={{ alignItems: 'flex-start', marginTop: 10 }}>
              <View
                style={{
                  width: width / 1.5,
                  paddingHorizontal: 15,
                  paddingVertical: 10,
                  backgroundColor: '#FCEED4',
                  borderTopLeftRadius: 15,
                  borderTopRightRadius: 15,
                  borderBottomRightRadius: 15,
                }}
              >
                <Text style={[style.r14, { color: '#262626' }]}>
                  Okay, please meet me at Franklin Avenue at 5 pm
                </Text>
              </View>
              <Text style={[style.r12, { color: '#969696', marginTop: 5 }]}>9:44 AM</Text>
            </View>

            <View style={{ alignItems: 'flex-end', marginTop: 10 }}>
              <View
                style={{
                  width: width / 1.7,
                  paddingHorizontal: 15,
                  paddingVertical: 10,
                  backgroundColor: Colors.primary,
                  borderTopLeftRadius: 15,
                  borderBottomLeftRadius: 15,
                  borderBottomRightRadius: 15,
                }}
              >
                <Text style={[style.r14, { color: Colors.secondary }]}>
                  Roger that sir, thankyou
                </Text>
              </View>
              <Text style={[style.r12, { color: '#969696', marginTop: 5 }]}>9.30 AM</Text>
            </View>
          </ScrollView>

          <View
            style={[
              style.inputContainer,
              { marginVertical: 20, height: 62, borderColor: '#DADADA' },
            ]}
          >
            <TextInput
              placeholder="Type message..."
              placeholderTextColor={'#B0B0B0'}
              selectionColor={Colors.primary}
              style={[style.r14, { color: Colors.active, flex: 1, marginBottom: -4 }]}
            />
            <Image
              source={require('../../../assets/image/a19.png')}
              resizeMode="stretch"
              style={{ height: 46, width: 46, marginRight: -10 }}
            ></Image>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
