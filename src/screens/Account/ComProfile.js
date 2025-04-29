// Profile.js
import {
  View,
  Text,
  SafeAreaView,
  Dimensions,
  StatusBar,
  KeyboardAvoidingView,
  TouchableOpacity,
  Image,
  ScrollView,
  Platform,
  StyleSheet,
} from 'react-native';
import { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import style from '../../theme/style';
import { Colors } from '../../theme/color';
import ImagePicker from 'react-native-image-crop-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch } from 'react-redux';
import { toggleSidebar } from '../../redux/slice/sideBarSlice';
import ProfileImageFallback from '../../Components/profileImageFallback';
import axios from 'axios';
import RNFS from 'react-native-fs';
import { API_ENDPOINTS } from '../../api/apiConfig';
import { AppBar } from '@react-native-material/core';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function ComProfile() {
  const navigation = useNavigation();
  const [profileImage, setProfileImage] = useState(null);
  const [userId, setUserId] = useState(null);
  const [data, setData] = useState();
  const [docs, setDocs] = useState();
  const dispatch = useDispatch();
  const { height, width } = Dimensions.get('window');

  const pickImage = () => {
    ImagePicker.openPicker({
      width: 300,
      height: 300,
      cropping: true,
      cropperCircleOverlay: true,
    })
    .then(async (image) => {
      const base64Data = await RNFS.readFile(image.path, 'base64');
      const blob = {
        name: image.filename || 'profile.jpg',
        type: image.mime,
        uri: image.path,
        data: base64Data,
      };

      setProfileImage(blob);
      uploadDocument(blob, 'CL');
    })
    .catch((error) => {
      console.log('ImagePicker Error: ', error);
    });
  };

  console.log(data?.data?.allowances)

  const uploadDocument = async (data, type) => {
    const payload = {
      user_id: userId,
      file_name: data.name,
      mime_type: data.type,
      blob_file: data.data,
      type: type
    };

    try {
      const response = await axios.post(API_ENDPOINTS.DOCS, payload);
      console.log('Response:', response.data);
      navigation.navigate('MyTabs');
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('userId');
        if (storedUserId) {
          const id = parseInt(storedUserId);
          setUserId(id);
        }
      } catch (error) {
        console.error('Failed to retrieve userId:', error);
      }
    };
    fetchUserId();
  }, []);

  const fetchCompanyDetails = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.COMPANY_DETAILS, {
        params: { user_id: userId },
      });
      setData(response.data);
    } catch (error) {
      console.error('Failed to retrieve company details:', error);
    }
  };

  const fetchCompanyDocs = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.DOCS, {
        params: { user_id: userId },
      });
      setDocs(response.data);
      
      // Set profile image from docs data if available
      if (response.data?.data?.comp_url) {
        setProfileImage(response.data.data.comp_url);
      }
    } catch (error) {
      console.error('Failed to retrieve company docs:', error);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchCompanyDocs();
      fetchCompanyDetails();
    }
  }, [userId]);

  // Benefits list (not used in the current code but kept for reference)
 
  const getProfileImageSource = () => {
    if (profileImage && typeof profileImage === 'string') {
      // If profileImage is a URL string
      return { uri: profileImage };
    } else if (profileImage && profileImage.uri) {
      // If profileImage is an object with URI property
      return { uri: profileImage.uri };
    }
    // Return null if no valid image source
    return null;
  };

  return (
    <SafeAreaView style={[style.area, { backgroundColor: Colors.bg, padding: 0 }]}>
      <StatusBar backgroundColor="#FFFDF7" translucent={false} barStyle={'dark-content'} />
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: '#00000' }}
        behavior={Platform.OS === 'ios' ? 'padding' : null}
      >
        <AppBar
          leading={
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
              }}
            >
              <TouchableOpacity
                onPress={() => dispatch(toggleSidebar())}
                style={{
                  height: 40,
                  width: 40,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingHorizontal: 20,
                }}
              >
                <Image
                  source={require('../../../assets/image/menu.png')}
                  resizeMode="contain"
                  style={{ width: 16, height: 16 }}
                />
              </TouchableOpacity>
              <Text
                style={{
                  color: '#000',
                  fontSize: 20,
                  fontFamily: 'Poppins-SemiBold',
                  marginTop: 5,
                }}
              >
                Profile
              </Text>
            </View>
          }
          backgroundColor="white"
        />
        <ScrollView showsVerticalScrollIndicator={false} style={{ marginBottom: 10 }}>
          <View style={{ backgroundColor: Colors.bg }}>
            <View style={[style.blurPic, { height: 200, backgroundColor: 'black', opacity: 0.9 }]}>
              <Image
                source={getProfileImageSource()}
                resizeMode="cover"
                style={{
                  width: '100%',
                  height: '100%',
                  opacity: 0.5,
                  objectFit: 'cover',
                  alignSelf: 'center',
                }}
                blurRadius={6}
              />
            </View>

            <View
              style={{
                alignItems: 'center',
                marginTop: 160,
                backgroundColor: '#fff',
                borderRadius: 20,
                padding: 16,
              }}
            >
              <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                <TouchableOpacity
                  style={{
                    top: -80,
                    position: 'absolute',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: 140,
                    width: 140,
                    borderRadius: 70,
                    overflow: 'hidden',
                    marginBottom: 16,
                  }}
                  onPress={pickImage}
                >
                  {getProfileImageSource() ? (
                    <Image
                      source={getProfileImageSource()}
                      resizeMode="cover"
                      style={{
                        height: 100,
                        width: 100,
                        borderRadius: 70,
                        borderWidth: 2,
                        borderColor: 'white'
                      }}
                    />
                  ) : (
                    <ProfileImageFallback
                      fullname={data?.data?.company_name}
                      size={100}
                      fontSize={40}
                    />
                  )}

                  {/* Edit Button */}
                  <TouchableOpacity
                    style={{
                      position: 'absolute',
                      bottom: 20,
                      right: 20,
                      backgroundColor: '#fff',
                      borderRadius: 20,
                      padding: 6,
                      elevation: 3,
                      backgroundColor: '#80559A',
                      borderWidth: 1,
                      borderColor: '#fff',
                    }}
                    onPress={pickImage}
                  >
                    <Ionicons name="pencil" size={14} color="white" />
                  </TouchableOpacity>
                </TouchableOpacity>
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 8,
                  marginTop: 70,
                }}
              >
                <Text style={[style.s22, { color: '#000', marginRight: 8 }]}>
                  {data?.data?.company_name}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate('CompanyName', {
                      data: data,
                      id: userId,
                    });
                  }}
                >
                  <Image
                    source={require('../../../assets/image/editIcon2.png')}
                    style={{ width: 15, height: 15 }}
                  />
                </TouchableOpacity>
              </View>

              <Text
                style={[
                  style.r14,
                  {
                    color: '#666',
                    textAlign: 'center',
                    maxWidth: '80%',
                    lineHeight: 20,
                  },
                ]}
              >
                {data?.data?.state || 'N/A'}, {data?.data?.country || 'N/A'}
              </Text>
            </View>

            <TouchableOpacity
              style={{
                flexDirection: 'row',
                height: 40,
                justifyContent: 'space-between',
                alignItems: 'center',
                marginHorizontal: 20,
                marginVertical: 24,
                borderWidth: 1,
                borderColor: Colors.primary,
                borderRadius: 30,
                backgroundColor: '#F6FCFC',
                paddingHorizontal: 16,
              }}
            >
              <Text
                style={[style.m16, { color: '#333', flex: 1, textAlign: 'center', fontSize: 10 }]}
              >
                Set Your Hiring Preference
              </Text>
              <Text
                style={[
                  style.m16,
                  {
                    color: '#14B6AA',
                    flex: 1,
                    textAlign: 'right',
                    fontSize: 12,
                    fontWeight: '800',
                  },
                ]}
              >
                Set Now
              </Text>
            </TouchableOpacity>

            <View
              style={{
                marginHorizontal: 20,
                marginBottom: 16,
                backgroundColor: '#fff',
                borderRadius: 16,
                padding: 20,
                shadowRadius: 8,
                borderWidth: 1,
                borderColor: '#E5E5EA',
              }}
            >
              <Text
                style={[
                  style.m16,
                  { color: '#000', marginBottom: 16, fontFamily: 'Poppins-SemiBold' },
                ]}
              >
                Recruitment Insights
              </Text>
              <Text style={[style.m14, { color: '#000', marginBottom: 4 }]}>
                Here's How Your Job Postings Are Performing
              </Text>
              <Text style={[style.r1, { color: '#666' }]}>
                Track the performance of your job listings and recruiter activity
              </Text>
              <TouchableOpacity style={{ marginTop: 12 }}>
                <Text style={[style.m14, { color: '#14B6AA' }]}>View details</Text>
              </TouchableOpacity>
            </View>

            <View
              style={{
                marginHorizontal: 20,
                marginBottom: 16,
                backgroundColor: '#fff',
                borderRadius: 16,
                padding: 20,
                shadowRadius: 8,
                borderWidth: 1,
                borderColor: '#E5E5EA',
              }}
            >
              <View
                style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}
              >
                <Text style={[style.m18, { color: '#000', fontFamily: 'Poppins-SemiBold' }]}>
                  Company Details
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate('CompanyDetailModel', {
                      data: data,
                      id: userId,
                    })
                  }
                >
                  <Image
                    source={require('../../../assets/image/editIcon2.png')}
                    style={{ width: 15, height: 15 }}
                  />
                </TouchableOpacity>
              </View>

              <View style={{ flexDirection: 'row' }}>
                <View style={{ width: '30%', gap: 10 }}>
                  <Text style={[style.r12, { color: '#333' }]}>Email</Text>
                  <Text style={[style.r12, { color: '#333' }]}>Website</Text>
                  <Text style={[style.r12, { color: '#333' }]}>Founded</Text>
                  <Text style={[style.r12, { color: '#333' }]}>Employees</Text>
                  <Text style={[style.r12, { color: '#333' }]}>Industry</Text>
                </View>

                <View style={{ width: '70%', gap: 10 }}>
                  <Text style={[style.r12, { color: '#333' }]}>
                    {data?.data?.company_email || 'Not Available'}
                  </Text>
                  <Text style={[style.r12, { color: '#333' }]}>
                    {data?.data?.company_website || 'Not Available'}
                  </Text>
                  <Text style={[style.r12, { color: '#333' }]}>
                    {data?.data?.founded_year || 'Not Available'}
                  </Text>
                  <Text style={[style.r12, { color: '#333' }]}>
                    {data?.data?.no_of_employees || 'Not Available'}
                  </Text>
                  <Text style={[style.r12, { color: '#333' }]}>
                    {data?.data?.industry || 'Not Available'}
                  </Text>
                </View>
              </View>
            </View>

            {/* About Company */}
            <View
              style={{
                marginHorizontal: 20,
                marginBottom: 40,
                backgroundColor: '#fff',
                borderRadius: 16,
                padding: 20,
                shadowRadius: 8,
                borderWidth: 1,
                borderColor: '#E5E5EA',
              }}
            >
              <View
                style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}
              >
                <Text style={[style.m18, { color: '#000', fontFamily: 'Poppins-SemiBold' }]}>
                  About Company
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate('CompanyAboutUs', {
                      data: data,
                      id: userId,
                    })
                  }
                >
                  <Image
                    source={require('../../../assets/image/editIcon2.png')}
                    style={{ width: 15, height: 15 }}
                  />
                </TouchableOpacity>
              </View>
              <Text style={[style.r14, { color: '#666' }]}>
                {data?.data?.about || 'Company description is not available.'}
              </Text>
            </View>

            {/* Requirement Card */}
            <View style={styles.container}>
              <View style={styles.header}>
                <Text style={styles.title}>Why Work With Us?</Text>
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate('Allowance', {
                      data: data,
                      id: userId,
                    })
                  }
                >
                  <Text style={styles.addButton}>Add</Text>
                </TouchableOpacity>
              </View>

            {data?.data?.allowances && data.data.allowances !== '' ? (
  data.data.allowances
    .split(',')
    .filter(item => item.trim() !== '')  // Filter out empty strings
    .map((item, index) => (
      <View key={index} style={styles.benefitItem}>
        <View style={styles.checkmarkContainer}>
          <View style={styles.checkmark}>
            <Text style={styles.checkmarkText}>✓</Text>
          </View>
        </View>
        <Text style={styles.benefitText}>{item.trim()}</Text>
      </View>
    ))
) : (
  <Text style={styles.benefitText}>No Allowances Added</Text>
)}
            </View>

            {/* Contact Us Section */}
            <View
              style={{
                marginHorizontal: 20,
                marginBottom: 16,
                backgroundColor: '#fff',
                borderRadius: 16,
                padding: 20,
                shadowRadius: 8,
                borderWidth: 1,
                borderColor: '#E5E5EA',
              }}
            >
              <View
                style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}
              >
                <Text style={[style.m18, { color: '#000', fontFamily: 'Poppins-SemiBold' }]}>
                  Contact Us
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate('CompanyContactUs', {
                      data: data,
                      id: userId,
                    })
                  }
                >
                  <Image
                    source={require('../../../assets/image/editIcon2.png')}
                    style={{ width: 15, height: 15 }}
                  />
                </TouchableOpacity>
              </View>

              <View style={{ flexDirection: 'row' }}>
                <View style={{ width: '30%', gap: 10 }}>
                  <Text style={[style.r12, { color: '#333' }]}>HR Email</Text>
                  <Text style={[style.r12, { color: '#333' }]}>Head Office</Text>
                </View>

                <View style={{ width: '70%', gap: 10 }}>
                  <Text style={[style.r12, { color: '#333' }]}>
                    {data?.data?.hr_email || 'Not Available'}
                  </Text>
                  <Text style={[style.r12, { color: '#333', flexWrap: 'wrap' }]}>
                    {data?.data?.company_address || 'Not Available'}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginBottom: 40,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    color: '#000',
    fontFamily: 'Poppins-SemiBold',
    fontWeight: '600',
  },
  addButton: {
    color: '#14B6AA',
    fontSize: 16,
    fontWeight: '500',
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  checkmarkContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  checkmark: {
    width: 15,
    height: 15,
    borderRadius: 12,
    backgroundColor: '#80559A', // Purple color for checkmark background
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: 'white',
    fontSize: 10,
    fontFamily: 'Poppins-Regular',
  },
  benefitText: {
    fontSize: 12,
    color: '#333',
    fontFamily: 'Poppins-Regular',
    flex: 1,
    lineHeight: 24,
  },
});