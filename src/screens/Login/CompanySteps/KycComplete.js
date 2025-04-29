import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DocumentPicker from 'react-native-document-picker';
import { launchCamera } from 'react-native-image-picker';
import DropDownPicker from 'react-native-dropdown-picker';
import { API_ENDPOINTS } from '../../../api/apiConfig';
import { useSelector } from 'react-redux';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';

const { width, height } = Dimensions.get('window');

const KycScreen = () => {
  const navigation = useNavigation();
  const [userId, setUserId] = useState(null);
  const [gstNumber, setGstNumber] = useState('');
  const [companyId, setCompanyId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState([]);
  
  // Dropdown state
  const [open, setOpen] = useState(false);
  const [proofType, setProofType] = useState(null);
  const [items, setItems] = useState([
    { label: 'Aadhar Card', value: 'aadhar' },
    { label: 'Pan Card', value: 'pan' },
    { label: 'Voter ID', value: 'voter' },
  ]);
  
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const companyData = useSelector((state) => state.companyDetail);

  // Fetch user ID on component mount
  useEffect(() => {
    fetchUserId();
  }, []);

  const fetchUserId = async () => {
    try {
      const storedUserId = await AsyncStorage.getItem('userId');
      if (storedUserId) {
        setUserId(+storedUserId);
      } else {
        Alert.alert('Error', 'User not logged in');
        navigation.navigate('Login');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      Alert.alert('Error', 'Could not retrieve user information');
    }
  };

  const validateForm = () => {
 
    
    
 
    
    
    if (!gstNumber || gstNumber.trim().length < 15) {
      Alert.alert('Invalid GST Number', 'Please enter a valid 15-digit GST Number');
      return false;
    }
    
    return true;
  };

  const uploadDocument = async (blob, type) => {
    if (!userId) return;
    
    try {
      const payload = {
        user_id: userId,
        type: type || proofType,
        file_name: blob.name,
        mime_type: blob.type,
        blob_file: blob.data
      };

      const response = await axios.post(API_ENDPOINTS, payload);
      
      if (response.data.status !== 'success') {
        throw new Error(response.data.message || 'Upload failed');
      }
      
      return response.data;
    } catch (error) {
      console.error('Upload failed:', error);
      throw error;
    }
  };

  const handleKycAndCompanyRegister = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    const body = {
      ...companyData,
      company_gstin: gstNumber,
    };

    try {
      // Step 1: Register company
      const response = await axios.post(API_ENDPOINTS.COMPANY_DETAILS, body);

      if (response.data.status !== 'success') {
        throw new Error(response.data.message || 'Company registration failed');
      }

      const companyIDFromResponse = response.data.company_id;
      setCompanyId(companyIDFromResponse);
      
      // Step 2: Create employer association
      const empResponse = await axios.post(API_ENDPOINTS.EMPLOYER, {
        user_id: userId,
        company_id: companyIDFromResponse,
        user_company_role: 'Admin',
      });

      if (empResponse.data.status !== 'success') {
        throw new Error(empResponse.data.message || 'Employer registration failed');
      }
      
      // Step 3: Update user steps
      const getStepsResponse = await axios.get(`${API_ENDPOINTS.STEP}?user_id=${userId}`);
      
      if (getStepsResponse.data.status !== 'success') {
        throw new Error('Could not retrieve user progress');
      }
      
      const postStepResponse = await axios.post(API_ENDPOINTS.STEP, {
        user_id: userId,
        steps: +getStepsResponse.data.data.steps + 1,
      });
      
      if (postStepResponse.data.status !== 'success') {
        throw new Error('Could not update user progress');
      }
      
      // Success - navigate to next screen
      Alert.alert('Success', 'Registration completed successfully');
      navigation.navigate('Validate');
      
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert(
        'Registration Failed',
        error.message || 'Unable to complete registration. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async () => {
    if (uploadedFiles.length >= 2) {
      Alert.alert('File Limit Reached', 'You can only upload 2 documents');
      return;
    }
    
    try {
      setIsUploading(true);
      const res = await DocumentPicker.pick({
        type: [
          DocumentPicker.types.pdf, 
          DocumentPicker.types.images,
          DocumentPicker.types.doc,
          DocumentPicker.types.docx
        ],
        allowMultiSelection: uploadedFiles.length === 0,
      });

      // Process each selected file
      for (const file of res) {
        const filePath = file.uri.replace('file://', '');
        const base64Data = await RNFS.readFile(filePath, 'base64');
        
        const blob = {
          name: file.name,
          type: file.type,
          size: file.size,
          uri: file.uri,
          data: base64Data,
        };

        // Add to UI list
        setUploadedFiles(prev => {
          const updated = [...prev, blob];
          return updated.slice(0, 2); // Keep max 2 files
        });
        
      }
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        console.log('User cancelled file selection');
      } else {
        console.error('Error uploading file:', err);
        Alert.alert('File Selection Error', 'There was a problem selecting or processing your file');
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleOpenCamera = async () => {
    if (uploadedFiles.length >= 2) {
      Alert.alert('File Limit Reached', 'You can only upload 2 documents');
      return;
    }
    
    const options = {
      mediaType: 'photo',
      maxWidth: 1024,
      maxHeight: 1024,
      quality: 0.8,
      includeBase64: true,
    };

    try {
      setIsUploading(true);
      launchCamera(options, async (response) => {
        if (response.didCancel) {
          console.log('User cancelled camera');
          setIsUploading(false);
        } else if (response.errorCode) {
          console.log('Camera Error: ', response.errorMessage);
          Alert.alert('Camera Error', response.errorMessage);
          setIsUploading(false);
        } else if (response.assets && response.assets.length > 0) {
          const asset = response.assets[0];
          
          // If base64 isn't included directly, read the file
          let base64Data = asset.base64;
          if (!base64Data) {
            const filePath = asset.uri.replace('file://', '');
            base64Data = await RNFS.readFile(filePath, 'base64');
          }
          
          const blob = {
            name: asset.fileName || `camera_image_${Date.now()}.jpg`,
            type: asset.type || 'image/jpeg',
            size: asset.fileSize,
            uri: asset.uri,
            data: base64Data,
          };

          // Add to UI list
          setUploadedFiles(prev => {
            const updated = [...prev, blob];
            return updated.slice(0, 2); // Keep max 2 files
          });
          
          // Upload to server
          await uploadDocument(blob, 'VD');
          setIsUploading(false);
        }
      });
    } catch (error) {
      console.error('Camera handling error:', error);
      Alert.alert('Error', 'Failed to process camera image');
      setIsUploading(false);
    }
  };

  const removeFile = (indexToRemove) => {
    setUploadedFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const isNextEnabled =   gstNumber.trim().length >= 15;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
      </View>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <Text style={styles.title}>Complete your KYC</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Name and Address Proof Type</Text>
            <DropDownPicker
              listMode="SCROLLVIEW"
              scrollViewProps={{ nestedScrollEnabled: true }}
              open={open}
              value={proofType}
              items={items}
              setOpen={setOpen}
              setValue={setProofType}
              setItems={setItems}
              placeholder="Select Proof Type"
              style={styles.dropdownStyle}
              dropDownContainerStyle={styles.dropdownContainerStyle}
              placeholderStyle={styles.placeholderStyle}
              zIndex={1000}
              zIndexInverse={1}
            />
          </View>

          <View style={styles.uploadContainer}>
            <Text style={styles.label}>Upload Proof</Text>
            <Text style={styles.subLabel}>
              Upload 2 documents in pdf, jpeg or png format with maximum 4MB each
            </Text>

            <TouchableOpacity
              style={[styles.fileUploadButton, (uploadedFiles.length >= 2 || isUploading) && styles.disabledButton]}
              onPress={handleFileUpload}
              disabled={uploadedFiles.length >= 2 || isUploading}
            >
              <Text style={styles.fileUploadText}>Choose File</Text>
              <Ionicons name="document-outline" size={24} color="#9F9F9F" />
            </TouchableOpacity>

            <View style={{ width: '100%', alignItems: 'flex-start' }}>
              <TouchableOpacity
                style={[styles.cameraUploadButton, (uploadedFiles.length >= 2 || isUploading) && styles.disabledText]}
                onPress={handleOpenCamera}
                disabled={uploadedFiles.length >= 2 || isUploading}
              >
                <Text style={[styles.cameraUploadText, (uploadedFiles.length >= 2 || isUploading) && styles.disabledText]}>
                  <Text style={{ color: '#667085' }}>Or</Text> Open Camera
                </Text>
              </TouchableOpacity>
            </View>

            {uploadedFiles.map((file, index) => (
              <View key={index} style={styles.uploadedFileItem}>
                <View style={styles.fileInfoContainer}>
                  <Ionicons name="document" size={20} color="#14B6AA" />
                  <Text style={styles.uploadedFileName} numberOfLines={1}>
                    {file.name || file.uri.split('/').pop()}
                  </Text>
                </View>
                
                {isUploading && (
                  <ActivityIndicator size="small" color="#14B6AA" style={styles.uploadStatusIndicator} />
                )}

                <TouchableOpacity 
                  onPress={() => removeFile(index)}
                  disabled={isUploading}
                  style={isUploading ? styles.disabledButton : null}
                >
                  <Ionicons name="close" size={20} color={isUploading ? "#ccc" : "red"} />
                </TouchableOpacity>
              </View>
            ))}

            <View style={styles.inputContainer}>
              <Text style={styles.label}>GST Number</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter GST Number"
                value={gstNumber}
                onChangeText={setGstNumber}
                maxLength={15}
                keyboardType="default"
              />
              {gstNumber.length > 0 && gstNumber.length < 15 && (
                <Text style={styles.errorText}>GST Number should be 15 characters</Text>
              )}
            </View>
          </View>

          <TouchableOpacity 
            style={[
              styles.nextButton, 
              (!isNextEnabled || isLoading || isUploading) && styles.disabledButton
            ]} 
            onPress={handleKycAndCompanyRegister}
            disabled={!isNextEnabled || isLoading || isUploading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.nextButtonText}>Next</Text>
            )}
          </TouchableOpacity>
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
  scrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 50,
  },
  header: {
    width: '100%',
    paddingVertical: height * 0.02,
    paddingHorizontal: width * 0.05,
  },
  backButton: {
    padding: 8,
  },
  container: {
    width: '90%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: height * 0.02,
  },
  title: {
    fontSize: width * 0.06,
    fontFamily: 'Poppins-SemiBold',
    textAlign: 'center',
    marginBottom: 50,
  },
  inputContainer: {
    width: '100%',
    marginBottom: height * 0.02,
  },
  label: {
    fontSize: width * 0.045,
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 8,
  },
  subLabel: {
    fontSize: width * 0.035,
    fontFamily: 'Poppins-Regular',
    color: '#666',
    marginBottom: 12,
  },
  uploadContainer: {
    width: '100%',
    marginBottom: height * 0.02,
  },
  fileUploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#14B6AA',
    borderRadius: 8,
    paddingVertical: 15,
    paddingHorizontal: 10,
    marginBottom: 12,
  },
  fileUploadText: {
    color: '#9F9F9F',
    fontFamily: 'Poppins-SemiBold',
    marginLeft: 8,
  },
  cameraUploadButton: {
    alignItems: 'center',
    marginBottom: 12,
  },
  cameraUploadText: {
    color: '#14B6AA',
    fontFamily: 'Poppins-SemiBold',
  },
  textInput: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ADADAD',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 20,
    marginBottom: 8,
  },
  uploadedFileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#14B6AA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  fileInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  uploadedFileName: {
    flex: 1,
    marginHorizontal: 8,
    fontFamily: 'Poppins-Regular',
  },
  uploadStatusIndicator: {
    marginRight: 10,
  },
  nextButton: {
    backgroundColor: '#14B6AA',
    paddingVertical: height * 0.02,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: width * 0.045,
    fontFamily: 'Poppins-SemiBold',
  },
  disabledButton: {
    backgroundColor: '#ccc',
    opacity: 0.7,
  },
  disabledText: {
    color: '#ccc',
  },
  dropdownStyle: {
    borderColor: '#ADADAD',
    borderRadius: 8,
  },
  dropdownContainerStyle: {
    borderColor: '#ADADAD',
  },
  placeholderStyle: {
    color: '#ADADAD',
  },
  errorText: {
    color: 'red',
    fontSize: width * 0.035,
    fontFamily: 'Poppins-Regular',
    marginTop: 4,
  },
});

export default KycScreen;