import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const ConsentCheckbox = ({ isChecked, onToggle }) => {
  return (
    <TouchableOpacity style={styles.checkboxContainer} onPress={onToggle}>
      <View
        style={[styles.checkbox, isChecked ? styles.checkboxChecked : styles.checkboxUnchecked]}
      >
        {isChecked && <Ionicons name="checkmark" size={16} color="white" />}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderRadius: 4,
    marginRight: 10,
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
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#555',
    flex: 1,
  },
  linkText: {
    color: '#14B6AA',
    textDecorationLine: 'underline',
  },
});

export default ConsentCheckbox;
