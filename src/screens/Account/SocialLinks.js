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
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSelector, useDispatch } from 'react-redux';
import { setSocialLinks } from '../../redux/slice/socialLinkSlice';

const { height, width } = Dimensions.get('window');

const SocialLinks = () => {
  const route = useRoute();
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const { req } = route.params || {};

  const [linkedin, setLinkedin] = useState('');
  const [twitter, setTwitter] = useState('');
  const [github, setGithub] = useState('');
  const [website, setWebsite] = useState('');

  const handleSave = () => {
    // Dispatch the action to update the Redux store
    dispatch(
      setSocialLinks({
        linkedin: linkedin,
        twitter: twitter,
        github: github,
        website: website,
      })
    );

    // After saving, you might want to navigate back or show a success message
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <View style={[styles.header, { marginTop: req === 'ResumeLocal' ? 40 : 0 }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.title}>Social Links</Text>
        </View>
        <TouchableOpacity onPress={handleSave}>
          <Text style={styles.saveButton}>Save</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.rowInputContainer}>
          <Ionicons name="logo-linkedin" size={24} color="#14B6AA" style={styles.inputIcon} />
          <TextInput
            style={styles.rowInput}
            placeholder="Enter LinkedIn URL"
            value={linkedin}
            onChangeText={setLinkedin}
          />
        </View>
        <View style={styles.rowInputContainer}>
          <Ionicons name="logo-twitter" size={24} color="#14B6AA" style={styles.inputIcon} />
          <TextInput
            style={styles.rowInput}
            placeholder="Enter Twitter URL"
            value={twitter}
            onChangeText={setTwitter}
          />
        </View>
        <View style={styles.rowInputContainer}>
          <Ionicons name="logo-github" size={24} color="#14B6AA" style={styles.inputIcon} />
          <TextInput
            style={styles.rowInput}
            placeholder="Enter GitHub URL"
            value={github}
            onChangeText={setGithub}
          />
        </View>
        <View style={styles.rowInputContainer}>
          <Ionicons name="globe-outline" size={24} color="#14B6AA" style={styles.inputIcon} />
          <TextInput
            style={styles.rowInput}
            placeholder="Enter Website URL"
            value={website}
            onChangeText={setWebsite}
          />
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
    marginTop: 5,
    marginLeft: 4,
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
  rowInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D5D9DF',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  inputIcon: {
    marginRight: 10,
  },
  rowInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 16,
    borderRadius: 10,
  },
});

export default SocialLinks;
