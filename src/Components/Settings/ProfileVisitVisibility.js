import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, SafeAreaView, StatusBar } from 'react-native';
import { Checkbox, Switch } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from '../../theme/color';
import { useNavigation } from '@react-navigation/native';

const ProfileVisitVisibility = () => {
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
        <Text style={styles.headerTitle}>Profile Visit Visibility</Text>
      </View>

      {/* Description */}
      <Text style={styles.description}>
      Do you want to allow organizations to see that you visited their Profile?
      </Text>

      <View style={styles.switchContainer}>
        <Text style={styles.optionTitle}>Allow organizations to see when you visit their profile</Text>
        <Switch/>
      </View>

     
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
    width: 300,
    fontSize: 12,
    color: Colors.disable,
    fontFamily: 'Poppins-Regular',
    marginTop: 4,
    marginBottom: 24,
  },
  optionsContainer: {
    marginBottom: 24,
  },
  optionTitle: {
    width: 280,
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: Colors.disable,
  },
  switchContainer: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    marginBottom: 24,
  },
});

export default ProfileVisitVisibility;