import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Dimensions,
  ScrollView,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';

const { width, height } = Dimensions.get('window');

const KycIntro = () => {
  const [isChecked, setIsChecked] = useState(false);

  const navigation = useNavigation();

  const toggleCheckbox = () => {
    setIsChecked(!isChecked);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
        </View>

        <View style={styles.container}>
          <Image
            style={styles.image}
            source={require('../../../../assets/image/Privacy-policy.png')}
          />
          <Text style={styles.title}>Complete your KYC and secure your account</Text>

          <View style={styles.infoBox}>
            <Text style={styles.subTitle}>
              As a company partnership entity, you have to do the following steps
            </Text>

            <View style={styles.verificationStep}>
              <Ionicons name="checkmark-circle-outline" size={24} color="#14B6AA" />
              <Text style={styles.stepText}>Name and address proof verification (GST or COI)</Text>
            </View>
          </View>

          <View style={styles.consentBox}>
            <TouchableOpacity style={styles.checkboxContainer} onPress={toggleCheckbox}>
              <View
                style={[
                  styles.checkbox,
                  isChecked ? styles.checkboxChecked : styles.checkboxUnchecked,
                ]}
              >
                {isChecked && <Ionicons name="checkmark" size={16} color="white" />}
              </View>

              <Text style={styles.consentText}>
                I provide consent for the verification of the documents, submitted here on behalf of
                my company, for purposes mentioned in the{' '}
                <Text style={styles.linkText}>Privacy policy</Text> and{' '}
                <Text style={styles.linkText}>Terms and Conditions</Text>. I also consent to get
                this verification done via third-party service providers.
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.startButton, !isChecked && styles.disabledButton]}
            disabled={!isChecked}
            onPress={() => navigation.navigate('KycComplete')}
          >
            <Text style={styles.startButtonText}>Start KYC Process</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default KycIntro;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    width: '100%',
    paddingVertical: height * 0.02,
    paddingHorizontal: width * 0.05,
  },
  backButton: {
    padding: 8,
  },
  container: {
    width: '90%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: height * 0.03,
  },
  image: {
    width: '100%',
    height: height * 0.3,
    resizeMode: 'contain',
    marginBottom: height * 0.03,
  },
  title: {
    fontSize: width * 0.06,
    fontFamily: 'Poppins-SemiBold',
    textAlign: 'center',
    marginBottom: height * 0.02,
  },
  infoBox: {
    backgroundColor: '#14B6AA19',
    padding: width * 0.04,
    borderRadius: 8,
    width: '100%',
    marginBottom: height * 0.03,
  },
  subTitle: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    marginBottom: height * 0.015,
  },
  verificationStep: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    fontWeight: '700',
    marginLeft: width * 0.03,
    flex: 1,
  },
  consentBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: height * 0.03,
    width: '100%',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderRadius: 4,
    marginRight: width * 0.03,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#14B6AA',
    borderColor: '#14B6AA',
  },
  checkboxUnchecked: {
    backgroundColor: 'transparent',
    borderColor: '#ADADAD',
  },
  consentText: {
    fontSize: width * 0.035,
    fontFamily: 'Poppins-Regular',
    color: '#555',
    flex: 1,
  },
  linkText: {
    color: '#14B6AA',
    textDecorationLine: 'underline',
  },
  startButton: {
    backgroundColor: '#14B6AA',
    paddingVertical: height * 0.015,
    paddingHorizontal: width * 0.3,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 13,
    fontFamily: 'Poppins-SemiBold',
  },
});
