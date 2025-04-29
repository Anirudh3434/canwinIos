import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import style from '../../theme/style';
import { Colors } from '../../theme/color';
import React, { useState, useEffect } from 'react';
import { AppBar } from '@react-native-material/core';
import { Checkbox } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

function FilterScreen({ data, SearchFilterData, filterVisible, index }) {
  const navigation = useNavigation();
  const FilterHeadings = [
    'Work Mode',
    'Experience',
    'Salary',
    'Industries',
    'Work Type',
    'Department',
    'Company Size',
    'Stipend',
    'Education',
    'Posted By',
  ];
  const HeadingOption = [
    { name: 'Work Mode', Option: ['In-person', 'Remote', 'Hybrid'] },
    { name: 'Experience', Option: ['Fresher', '1-2 years', '2-5 years', '5+ years'] },
    { name: 'Salary', Option: ['0-3 LPA', '3-6 LPA', '6-10 LPA', '10+ LPA'] },
    {
      name: 'Industries',
      Option: ['IT & Software', 'Healthcare', 'Finance', 'Education', 'Manufacturing', 'Marketing', 'Technology'],
    },
    { name: 'Work Type', Option: ['Full-Time', 'Part-Time', 'Contract', 'Internship'] },
    {
      name: 'Department',
      Option: ['Engineering', 'Sales', 'HR', 'Marketing', 'Operations'],
    },
    {
      name: 'Company Size',
      Option: [
        '1-10 employees',
        '11-50 employees',
        '51-200 employees',
        '201-500 employees',
        '501-1000 employees',
        '1001+ employees',
      ],
    },
    { name: 'Stipend', Option: ['Unpaid', '0-5K per month', '5K-10K per month', '10K+ per month'] },
    {
      name: 'Education',
      Option: ['Higher Secondary', 'Diploma', "Doctorate", "Post Graduate", 'Graduate'],
    },
    { name: 'Posted By', Option: ['Company', 'Consultant'] },
  ];

  // Initialize with the heading at the provided index
  const [selectedHeading, setSelectedHeading] = useState(FilterHeadings[index] || FilterHeadings[0]);
  // Use state to store filter data with previous selections
  const [filterData, setFilterData] = useState(data || {});
  // Store a backup of original data to compare changes
  const [originalData, setOriginalData] = useState({});

  // Save original data when component mounts
  useEffect(() => {
    setOriginalData(data || {});
  }, [data]);

  const handleApply = () => {
    if (SearchFilterData) {
      SearchFilterData(filterData);
    }
    if (filterVisible) {
      filterVisible(false);
    }
  };

  const handleReset = () => {
    // Reset to original data
    setFilterData(originalData);
  };

  const handleOptionPress = (option) => {
    setFilterData((prevData) => {
      // Create a copy of the current options or initialize as empty array
      const currentOptions = [...(prevData[selectedHeading] || [])];
      const isSelected = currentOptions.includes(option);
      // Create a new object to avoid mutating state directly
      const newData = {
        ...prevData,
      };
      // Update the selected options
      if (isSelected) {
        newData[selectedHeading] = currentOptions.filter((item) => item !== option);
      } else {
        newData[selectedHeading] = [...currentOptions, option];
      }
      return newData;
    });
  };

  const isOptionSelected = (option) => {
    return (filterData[selectedHeading] || []).includes(option);
  };

  return (
    <SafeAreaView style={[style.area, { backgroundColor: Colors.bg }]}>
      <StatusBar backgroundColor={Colors.bg} translucent={false} barStyle="dark-content" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : null}>
        <AppBar
          color={Colors.bg}
          elevation={6}
          style={{ padding: 10 }}
          leading={
            <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%', height: 55 }}>
              <Text style={styles.headerText}>Filter Results</Text>
            </View>
          }
        />
        <View style={styles.filterContainer}>
          {/* Left Side (Headings) */}
          <View style={styles.leftSide}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {FilterHeadings.map((item, idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={() => setSelectedHeading(item)}
                  style={styles.headingButton}
                >
                  <Text
                    style={[styles.headingText, selectedHeading === item && styles.selectedHeading]}
                  >
                    {item}
                  </Text>
                  {/* Show indicator if this heading has selected filters */}
                  {filterData[item] && filterData[item].length > 0 && (
                    <View style={styles.selectedIndicator} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          {/* Right Side (Options) */}
          <View style={styles.rightSide}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {HeadingOption.find((option) => option.name === selectedHeading)?.Option.map(
                (opt, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.optionButton}
                    onPress={() => handleOptionPress(opt)}
                  >
                    <View style={styles.optionRow}>
                      <Checkbox
                        status={isOptionSelected(opt) ? 'checked' : 'unchecked'}
                        onPress={() => handleOptionPress(opt)}
                        color={Colors.primary}
                        uncheckedColor="#ADADAD"
                      />
                      <Text style={styles.optionText}>{opt}</Text>
                    </View>
                  </TouchableOpacity>
                )
              )}
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={handleApply} style={styles.applyButton}>
          <Text style={styles.applyButtonText}>Apply</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            if (filterVisible) filterVisible(false);
          }}
          style={styles.cancelButton}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

export default FilterScreen;

const styles = StyleSheet.create({
  headerText: {
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 20,
    fontFamily: 'Poppins-Medium',
  },
  filterContainer: {
    flexDirection: 'row',
    flex: 1,
    marginHorizontal: 10,
    backgroundColor: Colors.bg,
    borderRadius: 10,
  },
  leftSide: {
    width: '35%',
    height: '90%',
    paddingVertical: 20,
    paddingHorizontal: 10,
    borderRightWidth: 1,
    borderColor: '#ADADAD',
  },
  rightSide: {
    width: '65%',
    height: '90%',
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  headingButton: {
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headingText: {
    textAlign: 'left',
    fontFamily: 'Poppins-Regular',
    fontWeight: '400',
    flex: 1,
  },
  selectedHeading: {
    fontWeight: '700',
  },
  selectedIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    marginLeft: 5,
  },
  optionButton: {
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionText: {
    fontFamily: 'Poppins-Regular',
    marginLeft: 8,
  },
  buttonContainer: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  applyButton: {
    width: 300,
    padding: 12,
    borderRadius: 5,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  applyButtonText: {
    color: Colors.bg,
    fontFamily: 'Poppins-Regular',
  },
  resetButton: {
    width: 300,
    padding: 12,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#888888',
    marginTop: 10,
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#888888',
    fontFamily: 'Poppins-Regular',
  },
  cancelButton: {
    width: 300,
    padding: 12,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: Colors.primary,
    marginTop: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: Colors.primary,
    fontFamily: 'Poppins-Regular',
  },
});