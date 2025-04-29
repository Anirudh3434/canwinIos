import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons'; // Import Ionicons
import { Colors } from '../../theme/color';
import { useNavigation } from '@react-navigation/native';
import style from '../../theme/style';

const CVId = () => {
  const navigation = useNavigation();
  return (
    <SafeAreaView style={style.area}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
      </View>
      <View style={styles.container}>
        <Text style={styles.title}>Share your details with us</Text>
        <Text style={styles.subtitle}>You need to complete these steps</Text>

        <View style={styles.stepContainer}>
          <View style={[styles.step, { borderColor: Colors.primary, backgroundColor: '#F9FFFE' }]}>
            <Text style={styles.stepText}>Basic Details</Text>
            <Image
              style={{ width: 25, height: 25 }}
              source={require('../../../assets/image/tick.png')}
            />
          </View>
          <View style={styles.step}>
            <Text style={styles.stepText}>Company details</Text>
          </View>
          <View style={styles.step}>
            <Text style={styles.stepText}>Company KYC</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate('ComBasicDetail')}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Start Now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default CVId;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 8,
  },
  container: {
    width: '100%',
    height: '70%',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 30,
    width: 300,
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'gray',
    marginBottom: 24,
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
  },
  stepContainer: {
    width: '100%',
    marginBottom: 24,
    gap: 15,
  },
  step: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    marginBottom: 8,
  },
  stepText: {
    fontSize: 18,
    fontFamily: 'Poppins-Regular',
  },
  button: {
    width: '100%',
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontFamily: 'Poppins-Medium',
  },
});
