import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { Checkbox } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from '../../theme/color';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_ENDPOINTS } from '../../api/apiConfig';

const ProfileViewingSettings = () => {
  const navigation = useNavigation();
  const [user_id, setUser_id] = useState(null);
  const [data, setData] = useState(null);
  const [docs, setDocs] = useState(null);
  const [selectedOption, setSelectedOption] = useState('');
  const [loading, setLoading] = useState(false);

  const handleOptionSelect = async (option) => {
    setSelectedOption(option);
    await saveVisibilitySetting(option);
  };

  const fetchUserId = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (userId) {
        setUser_id(+userId);
      }
    } catch (error) {
      console.error('Error fetching user ID:', error);
    }
  };

  const fetchPersonalandDoc = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.INTRODUCTION, {
        params: {
          user_id: user_id,
        },
      });
      setData(response.data.data);

      const response2 = await axios.get(API_ENDPOINTS.DOCS, {
        params: {
          user_id: user_id,
        },
      });
      setDocs(response2.data.data);
    } catch (error) {
      console.error('Error fetching personal details:', error);
    }
  };

  const fetchVisiblity = async () => {
    const response = await axios.get(API_ENDPOINTS.VISIBLE, { params: { user_id: user_id } });
    console.log(response.data.data.visibility);
    setSelectedOption(response.data.data.visibility);
    console.log(selectedOption);
  };

  useEffect(() => {
    fetchUserId();
  }, []);

  useEffect(() => {
    if (user_id) {
      fetchPersonalandDoc();
      fetchVisiblity();
    }
  }, [user_id]);

  const saveVisibilitySetting = async (option) => {
    try {
      setLoading(true);
      const response = await axios.post(API_ENDPOINTS.VISIBLE, {
        user_id: user_id,
        visibility: option,
      });
      // You can add success feedback here if needed
      console.log('Saved successfully', response.data);
    } catch (error) {
      console.error('Error saving profile viewing setting:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />
      {loading && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size={50} color={Colors.primary} />
        </View>
      )}

      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile viewing</Text>
      </View>

      {/* Description */}
      <Text style={styles.description}>
        Select what others see when you've viewed their profile
      </Text>

      {/* Options */}
      <View style={styles.optionsContainer}>
        <TouchableOpacity
          style={styles.checkboxRow}
          onPress={() => handleOptionSelect('Public')}
          disabled={loading}
        >
          <Checkbox
            status={selectedOption === 'Public' ? 'checked' : 'unchecked'}
            color={Colors.primary}
            disabled={loading}
          />
          <Text style={styles.checkboxText}>Public Mode</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.checkboxRow}
          onPress={() => handleOptionSelect('Private')}
          disabled={loading}
        >
          <Checkbox
            status={selectedOption === 'Private' ? 'checked' : 'unchecked'}
            color={Colors.primary}
            disabled={loading}
          />
          <Text style={styles.checkboxText}>Private Mode</Text>
        </TouchableOpacity>
      </View>

      {/* Preview */}
      <View style={styles.previewContainer}>
        <Text style={styles.previewTitle}>This is what others will see:</Text>

        <View style={styles.profilePreview}>
          {selectedOption !== 'Private' ? (
            <Image
              source={{ uri: docs?.pp_url || 'https://randomuser.me/api/portraits/men/32.jpg' }}
              style={styles.profileImage}
            />
          ) : (
            <View style={styles.profileImageContainer}>
              <Image
                source={require('../../../assets/image/profile.png')}
                style={{ width: 30, height: 30, tintColor: 'white' }}
              />
            </View>
          )}

          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              {selectedOption === 'Private'
                ? 'Anonymous Member'
                : data?.full_name || 'Henry Kanwil'}
            </Text>
            <Text style={styles.profileInfoText}>
              {data?.profile_headline || 'Software Engineer'}
            </Text>
          </View>
        </View>
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
    flex: 1,
  },
  loader: {
    marginLeft: 10,
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
  },
  profileInfo: {
    marginLeft: 16,
  },
  profileName: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
  },
  profileImageContainer: {
    width: 50,
    height: 50,
    padding: 8,
    backgroundColor: Colors.disable,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 30,
  },
  loaderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  profileInfoText: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#80559A',
  },
});

export default ProfileViewingSettings;
