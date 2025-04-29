import {
  View,
  Text,
  Dimensions,
  KeyboardAvoidingView,
  SafeAreaView,
  StatusBar,
  Image,
  Platform,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import React, { useState, useContext } from 'react';
import { Colors } from '../../theme/color';
import style from '../../theme/style';
import { useNavigation } from '@react-navigation/native';
import { AppBar, HStack } from '@react-native-material/core';

export default function Apply() {
  const navigation = useNavigation();
  // const [visible, setVisible] = useState(false)
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
            title="Apply"
            titleStyle={[style.subtitle, { color: Colors.active }]}
          />
          <View
            style={{ width: '100%', height: '90%', justifyContent: 'center', alignItems: 'center' }}
          >
            <Image style={styles.image} source={require('../../../assets/image/NoApply.png')} />
            <Text style={styles.title}>You haven't applied yet!</Text>
            <Text style={styles.subtitle}>
              Search for jobs and start applying. You can track your applications here!
            </Text>

            <TouchableOpacity style={styles.botton}>
              <Text style={styles.buttonText}>Start my job search</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  image: {
    width: 300,
    height: 300,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 27,
    fontFamily: 'Poppins-SemiBold',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
  },
  botton: {
    marginTop: 40,
    borderRadius: 10,
    width: 250,
    height: 50,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    color: 'white',
    fontFamily: 'Poppins-Mediums',
  },
});
