import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import { API_ENDPOINTS } from '../../../api/apiConfig';

const { height, width } = Dimensions.get('window');

const LanguageDetail = () => {
  const route = useRoute();
  const navigation = useNavigation();

  const { language, id } = route.params || {};

  console.log(id);

  const [proficiency, setProficiency] = useState(language?.proficiency || '');
  const [languageName, setLanguageName] = useState(language?.language_name || '');
  const [comfortable, setComfortable] = useState(
    language?.comfortable ? language.comfortable.split(',') : []
  );
  const [loading, setLoading] = useState(false);
  const [languageNameError, setLanguageNameError] = useState('');

  const comfortableOptions = ['Reading', 'Writing', 'Speaking'];

  const handleComfortableToggle = (option) => {
    if (comfortable.includes(option)) {
      setComfortable(comfortable.filter((item) => item !== option));
    } else {
      setComfortable([...comfortable, option]);
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      'Delete Language ',
      'Are you sure you want to delete this Employment record?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              console.log('Deleting Language with ID:', language?.lang_id);
              const response = await axios.delete(API_ENDPOINTS.DELETE_LANGUAGE, {
                params: { language_id: language?.lang_id },
              });
              console.log('Delete response:', response.data);
              console.log(response.data);
              if (response.data.status === 'success') {
                navigation.navigate('MyTabs');
              }
            } catch (error) {
              console.error('Error deleting Language:', error);
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  const validateInputs = () => {
    let isValid = true;
    if (!languageName.trim()) {
      setLanguageNameError('Language name is required');
      isValid = false;
    } else {
      setLanguageNameError('');
    }
    return isValid;
  };

  const handleSave = async () => {
    if (!validateInputs()) {
      return;
    }

    const params = language
      ? {
          lang_id: language?.lang_id,
          language_name: languageName,
          proficiency: proficiency,
          comfortable: comfortable.join(','), // Convert array to string
          user_id: id,
        }
      : {
          language_name: languageName,
          proficiency: proficiency,
          comfortable: comfortable.join(','), // Convert array to string
          user_id: id,
        };

    try {
      setLoading(true);
      const response = await axios.post(API_ENDPOINTS.LANGUAGE, params);
      console.log('Response:', response.data);
      navigation.navigate('MyTabs');
      setLoading(false);
    } catch (error) {
      console.log('Error saving language:', error);
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />

      {/* Header */}
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.title}>Language</Text>
        </View>
        <View style={{ display: 'flex', flexDirection: 'row', gap: 30, alignItems: 'center' }}>
          <TouchableOpacity disabled={loading} onPress={handleSave}>
            <Text style={styles.saveButton}>
              {language ? (loading ? 'Saving...' : 'Edit') : loading ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>

          {language && (
            <TouchableOpacity style={styles.trashButton} onPress={handleDelete}>
              <Ionicons name="trash-outline" size={20} color="red" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
        {/* Language Name */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Language</Text>
          <TextInput
            style={[styles.input, languageNameError && styles.inputError]}
            placeholder="Language"
            value={languageName}
            onChangeText={setLanguageName}
            placeholderTextColor="#C8C8C8"
          />
          {languageNameError ? <Text style={styles.errorText}>{languageNameError}</Text> : null}
        </View>

        {/* Proficiency */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Proficiency</Text>
          <View style={styles.buttonRow}>
            {['Beginner', 'Intermediate', 'Expert'].map((level) => (
              <TouchableOpacity
                key={level}
                style={
                  proficiency === level ? styles.badgeButtonSelected : styles.badgeButtonUnselected
                }
                onPress={() => setProficiency(level)}
              >
                <Text style={styles.buttonText}>{level}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Comfortable Options */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>You are comfortable in</Text>
          <View style={styles.buttonRow}>
            {comfortableOptions.map((option) => (
              <TouchableOpacity
                key={option}
                style={
                  comfortable.includes(option)
                    ? styles.badgeButtonSelected
                    : styles.badgeButtonUnselected
                }
                onPress={() => handleComfortableToggle(option)}
              >
                <Text style={styles.buttonText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderColor: '#00000014',

    shadowColor: '#00000014',
    shadowOffset: { width: -2, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    // Add elevation for Android shadow
    elevation: 3, // Adjust elevation as needed
  },
  title: {
    fontFamily: 'Poppins-Medium',
    fontSize: 20,
    fontWeight: '600',
    marginTop: 5,
    marginLeft: 4,
  },
  saveButton: {
    color: '#14B6AA',
    fontSize: 18,
    borderWidth: 1,
    borderColor: '#14B6AA',
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 5,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    marginTop: 10,
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: '#000',
    marginBottom: 5,
  },
  input: {
    width: '90%',
    borderWidth: 1,
    borderColor: '#D5D9DF',
    borderRadius: 8,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: 16,
    backgroundColor: '#fff',
  },
  inputError: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 5,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 20,
  },
  badgeButtonSelected: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEFFFE',
    borderWidth: 1,
    borderColor: '#14B6AA',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  badgeButtonUnselected: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#DDE0E5',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  buttonText: {
    color: '#667085',
  },
  experienceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  experienceInputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  experienceInput: {
    width: 70,
    borderWidth: 1,
    borderColor: '#D5D9DF',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#fff',
    textAlign: 'center',
  },
  AmountInput: {
    width: 150,
    borderWidth: 1,
    borderColor: '#D5D9DF',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#fff',
    textAlign: 'center',
  },
  unitLabel: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: '#667085',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  dropdownOptions: {
    position: 'absolute',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D5D9DF',
    maxHeight: 200,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  dropdownScrollContent: {
    paddingVertical: 5,
  },
  option: {
    padding: 15,
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  optionBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  inputText: {
    fontSize: 16,
    color: '#999',
  },
  selectedInputText: {
    color: '#333',
  },
  activeInput: {
    borderColor: '#14B6AA',
  },
});

export default LanguageDetail;
