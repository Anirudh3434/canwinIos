import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons'; // Import Ionicons
import { Colors } from '../../theme/color';
import { CommonActions, useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import { API_ENDPOINTS } from '../../api/apiConfig';
import { Alert } from 'react-native';

const AddWorkplaceHighlights = () => {


  const navigation = useNavigation()

  const  route = useRoute();
  const { data } = route.params;

  const company = data?.data;

  console.log(company)

  const [highlightText, setHighlightText] = useState('');
  const [highlights, setHighlights] = useState(company?.allowances?.split(',') || []);

  console.log(highlights)

  const handleAddHighlight = () => {
    if (highlightText.trim() !== '') {
      setHighlights([...highlights, highlightText.trim()]);
      setHighlightText('');
    }
  };

 


  const handleSave = async () => {
    
     const payload = {
      allowances: highlights.join(','),
      company_id: parseInt(company?.company_id ?? 0),
      company_type: company?.company_type ?? '',
      company_logo: company?.company_logo ?? '',
      company_name: company?.company_name ?? '',
      industry: company?.industry ?? '',
      city: company?.city ?? '',
      company_address: company?.company_address ?? '',
      company_email: company?.company_email ?? '',
      company_website: company?.company_website ?? '',
      about: company?.about ?? '',
      hr_email: company?.hr_email ?? '',
      company_gstin: company?.company_gstin ?? '',
      verified_status: company?.verified_status ?? 'N',
      no_of_employees: parseInt(company?.no_of_employees ?? 0),
      country: parseInt(company?.country ?? 0),
      state: parseInt(company?.state ?? 0),
      pincode: parseInt(company?.pincode ?? 0),
      founded_year: parseInt(company?.founded_year ?? 0),
    };
    try {
      const response = await axios.post(API_ENDPOINTS.COMPANY_DETAILS, payload);
      const res = response?.data;

      if (res?.status === 'success') {
        Alert.alert('Success', res.message || 'Company details updated successfully');
        navigation.navigate('MyTabs');
      } else {
        Alert.alert('Error', res.message || 'Update failed');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Something went wrong while saving');
    }
  }

  const handleSelectPreset = (preset) => {
    if (!highlights.includes(preset)) {
      setHighlights([...highlights, preset]);
    }
  };

  const handleRemoveHighlight = (index) => {
    const newHighlights = [...highlights];
    newHighlights.splice(index, 1);
    setHighlights(newHighlights);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <TouchableOpacity style={styles.backButton}>
        <Icon name="arrow-back" size={24} color="black" />
      </TouchableOpacity>
      <Text style={styles.title}>Add Workplace Highlights</Text>
      <Text style={styles.subtitle}>
        Let candidates know what makes your company a great place to work. Highlight your values, benefits, and culture.
      </Text>

      {/* Add a Workplace Highlight Input */}
      <View style={styles.addHighlightContainer}>
        <Text style={styles.addHighlightLabel}>Add a Workplace Highlight <Text style={styles.required}>*</Text></Text>
        <View style={styles.inputContainer}>
          <ScrollView 
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsScrollContainer}
          >
            {highlights.map((highlight, index) => (
              <View key={index} style={styles.highlightChip}>
                <Text style={styles.highlightChipText}>{highlight}</Text>
                <TouchableOpacity onPress={() => handleRemoveHighlight(index)}>
                  <Icon name="close-circle-outline" size={20} color="gray" />
                </TouchableOpacity>
              </View>
            ))}
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                value={highlightText}
                onChangeText={setHighlightText}
                placeholder="Type a highlight..."
                onSubmitEditing={handleAddHighlight}
              />
              {highlightText.trim() !== '' && (
                <TouchableOpacity onPress={handleAddHighlight} style={styles.addButton}>
                  <Icon name="add" size={24} color={Colors.primary} />
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        </View>
      </View>

      {/* Preset Highlights */}
      <TouchableOpacity style={styles.presetButton} onPress={() => handleSelectPreset('Competitive Salary & Perks')}>
        <Text style={styles.presetText}>Competitive Salary & Perks</Text>
        <Icon name="add-circle" size={20} color={Colors.primary} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.presetButton} onPress={() => handleSelectPreset('Hybrid Work Model ( Remote + Office )')}>
        <Text style={styles.presetText}>Hybrid Work Model ( Remote + Office )</Text>
        <Icon name="add-circle" size={20} color={Colors.primary} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.presetButton} onPress={() => handleSelectPreset('Health & Wellness Benefits')}>
        <Text style={styles.presetText}>Health & Wellness Benefits</Text>
        <Icon name="add-circle" size={20} color={Colors.primary} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.presetButton} onPress={() => handleSelectPreset('Career Growth Opportunities')}>
        <Text style={styles.presetText}>Career Growth Opportunities</Text>
        <Icon name="add-circle" size={20} color={Colors.primary} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.presetButton} onPress={() => handleSelectPreset('Collaborative & Diverse Work Culture')}>
        <Text style={styles.presetText}>Collaborative & Diverse Work Culture</Text>
        <Icon name="add-circle" size={20} color={Colors.primary} />
      </TouchableOpacity>

      {/* Bottom Buttons */}
      <View style={styles.bottomButtons}>
        <TouchableOpacity style={styles.cancelButton}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 40, // Adjust for status bar if needed
  },
  backButton: {
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    marginBottom: 10,
    fontFamily: 'Poppins-SemiBold',
  },
  subtitle: {
    fontSize: 12,
    color: '#667085',
    fontFamily: 'Poppins-Regular',
    marginBottom: 20
  },
  addHighlightContainer: {
    marginBottom: 20,
  },
  addHighlightLabel: {
    fontSize: 16,
    marginBottom: 5,
  },
  required: {
    color: 'red',
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: '#D5D9DF',
    borderRadius: 8,
    paddingVertical: 10,
    backgroundColor: 'white',
    height: 60,
  },
  chipsScrollContainer: {
    alignItems: 'center',
    paddingHorizontal: 10,
    flexDirection: 'row',
  },
  highlightChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginRight: 8,
  },
  highlightChipText: {
    marginRight: 6,
    fontSize: 14,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 100, // Ensure input is always visible
  },
  input: {
    flex: 1,
    height: 40,
  },
  addButton: {
    padding: 8,
  },
  presetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F4F6F9',
    paddingVertical: 20,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginBottom: 8,
  },
  presetText: {
    fontSize: 16,
    color: '#333',
  },
  bottomButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
    paddingBottom: 20, // Add some padding at the bottom
  },
  cancelButton: {
    width: '48%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    paddingVertical: 20,
    paddingHorizontal: 40,
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 16,
  },
  saveButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '48%',
    backgroundColor: '#14B6AA',
    borderRadius: 8,
    paddingVertical: 20,
    paddingHorizontal: 40,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AddWorkplaceHighlights;