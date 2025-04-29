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

export default function Chat() {
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
            centerTitle={true}
            title="Messages"
            titleStyle={[style.subtitle, { color: Colors.active }]}
          />

          <View style={{ padding: 5, marginTop: 10, marginBottom: 2 }}>
            <View
              style={[
                style.inputContainer,
                {
                  height: 58,
                  backgroundColor: '#F9F9F9',
                  shadowColor: Colors.active,
                  borderWidth: 0,
                },
              ]}
            >
              <Icon name="search" size={24} color={Colors.disable2} />
              <TextInput
                placeholder="Search message.."
                placeholderTextColor={Colors.disable2}
                selectionColor={Colors.primary}
                style={[
                  style.m16,
                  { color: Colors.active, marginLeft: 5, flex: 1, marginBottom: -6 },
                ]}
              />
            </View>
          </View>
          <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: 20 }}>
            <TouchableOpacity
              onPress={() => navigation.navigate('Message')}
              style={{ flexDirection: 'row', marginTop: 10 }}
            >
              <Image
                source={require('../../../assets/image/a13.png')}
                resizeMode="stretch"
                style={{ height: 60, width: 60 }}
              />
              <View style={{ flex: 1, marginLeft: 10, marginTop: 5 }}>
                <Text style={[style.r16, { color: Colors.txt, lineHeight: 18 }]}>
                  Gustauv Semalam
                </Text>
                <Text style={[style.r12, { color: Colors.active, lineHeight: 20 }]}>
                  Roger that sir, thankyou
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginTop: 5,
                    justifyContent: 'space-between',
                  }}
                >
                  <Text style={[style.r12, { color: '#898A8D' }]}>2m ago</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text
                      style={[style.r12, { color: Colors.primary, marginTop: 3, marginRight: 2 }]}
                    >
                      Read
                    </Text>
                    <Icons name="check-bold" size={14} color={Colors.primary}></Icons>
                  </View>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('Message')}
              style={{ flexDirection: 'row', marginTop: 10 }}
            >
              <Image
                source={require('../../../assets/image/a14.png')}
                resizeMode="stretch"
                style={{ height: 60, width: 60 }}
              />
              <View style={{ flex: 1, marginLeft: 10, marginTop: 5 }}>
                <Text style={[style.r16, { color: Colors.txt, lineHeight: 18 }]}>
                  Claudia Surrr
                </Text>
                <Text style={[style.r12, { color: Colors.active, lineHeight: 20 }]}>
                  OK. Lorem ipsum dolor sect...
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginTop: 5,
                    justifyContent: 'space-between',
                  }}
                >
                  <Text style={[style.r12, { color: '#898A8D' }]}>2m ago</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={[style.r12, { color: '#898A8D', marginTop: 3, marginRight: 2 }]}>
                      Pending
                    </Text>
                    <Icons name="check-bold" size={14} color={'#898A8D'}></Icons>
                  </View>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('Message')}
              style={{ flexDirection: 'row', marginTop: 10 }}
            >
              <Image
                source={require('../../../assets/image/a15.png')}
                resizeMode="stretch"
                style={{ height: 60, width: 60 }}
              />
              <View style={{ flex: 1, marginLeft: 10, marginTop: 5 }}>
                <Text style={[style.r16, { color: Colors.txt, lineHeight: 18 }]}>Rose Melati</Text>
                <Text style={[style.r12, { color: Colors.active, lineHeight: 20 }]}>
                  Lorem ipsum dolor
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginTop: 5,
                    justifyContent: 'space-between',
                  }}
                >
                  <Text style={[style.r12, { color: '#898A8D' }]}>2m ago</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text
                      style={[style.r12, { color: Colors.primary, marginTop: 3, marginRight: 2 }]}
                    >
                      Read
                    </Text>
                    <Icons name="check-bold" size={14} color={Colors.primary}></Icons>
                  </View>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('Message')}
              style={{ flexDirection: 'row', marginTop: 10 }}
            >
              <Image
                source={require('../../../assets/image/a16.png')}
                resizeMode="stretch"
                style={{ height: 60, width: 60 }}
              />
              <View style={{ flex: 1, marginLeft: 10, marginTop: 5 }}>
                <Text style={[style.r16, { color: Colors.txt, lineHeight: 18 }]}>Olivia James</Text>
                <Text style={[style.r12, { color: Colors.active, lineHeight: 20 }]}>
                  OK. Lorem ipsum dolor sect...
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginTop: 5,
                    justifyContent: 'space-between',
                  }}
                >
                  <Text style={[style.r12, { color: '#898A8D' }]}>2m ago</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={[style.r12, { color: '#898A8D', marginTop: 3, marginRight: 2 }]}>
                      Unread
                    </Text>
                    <Icons name="check-bold" size={14} color={'#898A8D'}></Icons>
                  </View>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('Message')}
              style={{ flexDirection: 'row', marginTop: 10 }}
            >
              <Image
                source={require('../../../assets/image/a17.png')}
                resizeMode="stretch"
                style={{ height: 60, width: 60 }}
              />
              <View style={{ flex: 1, marginLeft: 10, marginTop: 5 }}>
                <Text style={[style.r16, { color: Colors.txt, lineHeight: 18 }]}>Daphne Putri</Text>
                <Text style={[style.r12, { color: Colors.active, lineHeight: 20 }]}>
                  Lorem ipsum dolor sit amet, consect...
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginTop: 5,
                    justifyContent: 'space-between',
                  }}
                >
                  <Text style={[style.r12, { color: '#898A8D' }]}>2m ago</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={[style.r12, { color: '#898A8D', marginTop: 3, marginRight: 2 }]}>
                      Unread
                    </Text>
                    <Icons name="check-bold" size={14} color={'#898A8D'}></Icons>
                  </View>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('Message')}
              style={{ flexDirection: 'row', marginTop: 10 }}
            >
              <Image
                source={require('../../../assets/image/a18.png')}
                resizeMode="stretch"
                style={{ height: 60, width: 60 }}
              />
              <View style={{ flex: 1, marginLeft: 10, marginTop: 5 }}>
                <Text style={[style.r16, { color: Colors.txt, lineHeight: 18 }]}>
                  David Mckanzie
                </Text>
                <Text style={[style.r12, { color: Colors.active, lineHeight: 20 }]}>
                  Lorem ipsum dolor sit amet, consect...
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginTop: 5,
                    justifyContent: 'space-between',
                  }}
                >
                  <Text style={[style.r12, { color: '#898A8D' }]}>2m ago</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text
                      style={[style.r12, { color: Colors.primary, marginTop: 3, marginRight: 2 }]}
                    >
                      Read
                    </Text>
                    <Icons name="check-bold" size={14} color={Colors.primary}></Icons>
                  </View>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('Message')}
              style={{ flexDirection: 'row', marginTop: 10, marginBottom: 20 }}
            >
              <Image
                source={require('../../../assets/image/a14.png')}
                resizeMode="stretch"
                style={{ height: 60, width: 60 }}
              />
              <View style={{ flex: 1, marginLeft: 10, marginTop: 5 }}>
                <Text style={[style.r16, { color: Colors.txt, lineHeight: 18 }]}>
                  Gustauv Semalam
                </Text>
                <Text style={[style.r12, { color: Colors.active, lineHeight: 20 }]}>
                  Roger that sir, thankyou
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginTop: 5,
                    justifyContent: 'space-between',
                  }}
                >
                  <Text style={[style.r12, { color: '#898A8D' }]}>2m ago</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text
                      style={[style.r12, { color: Colors.primary, marginTop: 3, marginRight: 2 }]}
                    >
                      Read
                    </Text>
                    <Icons name="check-bold" size={14} color={Colors.primary}></Icons>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          </ScrollView>

          <View style={{ position: 'absolute', right: 15, bottom: 0, alignSelf: 'center' }}>
            <View
              style={[
                {
                  backgroundColor: '#80559A',
                  borderWidth: 0,
                  flexDirection: 'row',
                  alignItems: 'center',
                  width: 60,
                  justifyContent: 'center',
                  height: 60,
                  borderRadius: 50,
                },
              ]}
            >
              <Icon name="add-sharp" size={30} color={Colors.secondary} />
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
