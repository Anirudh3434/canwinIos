import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, SafeAreaView, StatusBar } from 'react-native';
import { Checkbox } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from '../../theme/color';
import { useNavigation } from '@react-navigation/native';

const DiscoverByEmail = () => {
  const navigation = useNavigation();
  const [selectedOption, setSelectedOption] = useState('nameHeadline');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Discover by email</Text>
      </View>

      {/* Description */}
      <Text style={styles.description}>
         Who can discover your profile, if they have your email address?
      </Text>

      {/* Options */}
      <View style={styles.optionsContainer}>
        <TouchableOpacity
          style={styles.checkboxRow}
          onPress={() => setSelectedOption('No one')}
        >
          <Checkbox
            status={selectedOption === 'No one' ? 'checked' : 'unchecked'}
            color={Colors.primary}
          />
          <Text style={styles.checkboxText}>No One</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.checkboxRow}
          onPress={() => setSelectedOption('Your Connection')}
        >
          <Checkbox
            status={selectedOption === 'Your Connection' ? 'checked' : 'unchecked'}
            color={Colors.primary}
          />
          <Text style={styles.checkboxText}>Your Connection</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.checkboxRow}
          onPress={() => setSelectedOption('AnyOne')}
        >
          <Checkbox
            status={selectedOption === 'AnyOne' ? 'checked' : 'unchecked'}
            color={Colors.primary}
          />
          <Text style={styles.checkboxText}>AnyOne</Text>
        </TouchableOpacity>
      </View>

      {/* Preview */}
     
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'column',
    paddingVertical: 12,
    gap: 8,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  description: {
    fontSize: 10,
    color: Colors.disable,
    fontFamily: 'Poppins-Regular',
    marginTop: 4,
    marginBottom: 24,
  },
  optionsContainer: {
    marginBottom: 24,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  checkboxText: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: Colors.disable,
  },
  previewContainer: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 16,
  },
  previewTitle: {
    fontSize: 10,
    color: Colors.disable,
    fontFamily: 'Poppins-Regular',
    marginBottom: 16,
  },
  profilePreview: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 30,
    objectFit: 'contain',
  },
  profileInfo: {
    marginLeft: 16,
  },
  profileName: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'Poppins-SemiBold',
  },
  profileImageContainer: {
    width: 50,
    height: 50,
    objectFit: 'contain',
    padding: 8,
    backgroundColor: Colors.disable,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 30,
  },
  profileHeadline: {
    fontSize: 12,
    color: '#80559A',
    fontFamily: 'Poppins-Regular',
  },
});

export default DiscoverByEmail;