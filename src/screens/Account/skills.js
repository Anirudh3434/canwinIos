import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
  StyleSheet,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import { API_ENDPOINTS } from '../../api/apiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DropDownPicker from 'react-native-dropdown-picker';
import { Colors } from '../../theme/color';

const { height, width } = Dimensions.get('window');

const SkillMenu = () => {
  const route = useRoute();
  const { req, data } = route.params || {};
  const [user_id, setUserId] = useState();

  const [skillValues, setSkillValues] = useState([]);
  const [skillLabels, setSkillLabels] = useState([]);

  const [open, setOpen] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [dropdownItems, setDropdownItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const navigation = useNavigation();

  console.log(data)



  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('userId');
        if (storedUserId) setUserId(parseInt(storedUserId, 10)); // Parse to number
      } catch (error) {
        console.error('Error fetching user ID:', error);
      }
    };
    fetchUserId();
  }, []);

  const fetchSkills = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.SKILL_LIST);
      const skills = response.data.data;

      const skillList = skills.map((item) => ({
        label: item.skill_name,
        value: item.skill_id,
      }));

      setDropdownItems(skillList);


    } catch (error) {
      console.error('Error fetching skills:', error);
      Alert.alert('Error', 'Failed to fetch skills. Please check your network connection.');
    }
  };
    useEffect(() => {
    if (dropdownItems.length > 0 && Array.isArray(data)) { // Check if dropdownItems is populated
        const initialSkills = data.map(label => {
            const trimmedLabel = label.trim().toLowerCase();
            const match = dropdownItems.find(item => item.label.trim().toLowerCase() === trimmedLabel);
            return match ? { label: match.label, value: match.value } : null;
        }).filter(skill => skill !== null); // Remove null values

        setSkillValues(initialSkills.map(skill => skill.value));
        setSkillLabels(initialSkills.map(skill => skill.label));
    }
}, [dropdownItems, data]);

  useEffect(() => {
    if (user_id) fetchSkills();
  }, [user_id]);

  const handleAddSkill = () => {
    if (selectedSkill) {
      const selectedSkillObj = dropdownItems.find((item) => item.value === selectedSkill);
      if (selectedSkillObj && !skillValues.includes(selectedSkillObj.value)) {
        setSkillValues((prev) => [...prev, selectedSkillObj.value]);
        setSkillLabels((prev) => [...prev, selectedSkillObj.label]);
      }
      setSelectedSkill(null);
      setOpen(false);
    }
  };

  const handleRemoveSkill = (index) => {
    setSkillValues((prev) => prev.filter((_, i) => i !== index));
    setSkillLabels((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (skillValues.length === 0) {
      Alert.alert('No Skills', 'Please add at least one skill.');
      return;
    }

    try {
      setLoading(true);
      const skillNameString = skillValues.join(',');
      const response = await axios.post(API_ENDPOINTS.SKILLS, {
        user_id,
        skill_name: skillNameString,
      });

      if (response.data.status === 'success') {
        setLoading(false);
        navigation.navigate(req === 'ResumeLocal' ? 'Resume Form' : 'MyTabs');
      } else {
        setLoading(false);
        Alert.alert('Error', 'Failed to save skills: ' + response.data.message); // Show server message
      }
    } catch (error) {
      setLoading(false);
      console.error('Error saving skills:', error);
      Alert.alert('Error', 'Failed to save skills. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Skills</Text>
        <TouchableOpacity disabled={loading} onPress={handleSave}>
          <Text style={styles.saveButton}>{loading ? 'Saving...' : 'Save'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} nestedScrollEnabled={true}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Skill/Software name</Text>
        
        <View style={{flexDirection: 'row' , alignItems: 'center'}}>

          <View style={styles.dropdownContainer}>
            <DropDownPicker
              open={open}
              value={selectedSkill}
              items={dropdownItems}
              setOpen={setOpen}
              setValue={setSelectedSkill}
              setItems={setDropdownItems}
              placeholder="Select or search for a skill"
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropdownList}
              listMode="SCROLLVIEW"
              scrollViewProps={{ nestedScrollEnabled: true }}
              maxHeight={200}
              searchable={true}
              searchPlaceholder="Search for skills..."
              searchContainerStyle={styles.searchContainer}
              searchTextInputStyle={styles.searchTextInput}
              searchPlaceholderTextColor="#999"
              onChangeSearchText={(text) => {
                // No need to set state here if DropDownPicker handles it internally
              }}
            />
          </View>

          <TouchableOpacity
            style={[styles.addButton]}
            onPress={handleAddSkill}
            disabled={!selectedSkill}
          >
            <Text style={styles.addButtonText}>+ Add</Text>
          </TouchableOpacity>
        </View>

          <View style={styles.badgeContainer}>
            {skillLabels.map((skill, index) => (
              <View key={index} style={styles.badgeButtonSelected}>
                <Text style={styles.badgeText}>{skill}</Text>
                <TouchableOpacity onPress={() => handleRemoveSkill(index)}>
                  <Ionicons name="close-circle" size={20} color="#14B6AA" />
                </TouchableOpacity>
              </View>
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
    elevation: 3,
  },
  title: {
    fontFamily: 'Poppins-Medium',
    fontSize: 20,
    fontWeight: '600',
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
  dropdownContainer: {
    width: '80%',
    marginVertical: 10,
    zIndex: 3000,
  },
  dropdown: {
    borderColor: '#D5D9DF',
    backgroundColor: '#fff',
    paddingVertical: 12,
  },
  dropdownList: {
    borderColor: '#D5D9DF',
    backgroundColor: '#fff',
  },
  addButton: {
    marginBottom: 10,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
    zIndex: 1,
  },
  addButtonDisabled: {
    backgroundColor: '#a0d8d4',
  },
  addButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
  },
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 15,
    zIndex: 1,
  },
  badgeButtonSelected: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEFFFE',
    borderWidth: 1,
    borderColor: '#14B6AA',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 8,
  },
  badgeText: {
    color: '#14B6AA',
    fontFamily: 'Poppins-Medium',
  },
  searchContainer: {
    borderBottomColor: '#F2F2F2',
    padding: 8,
  },
  searchTextInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    color: '#333',
  },
});

export default SkillMenu;
