
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
  Animated,
  PanResponder,
} from 'react-native';
import { useState, useRef, useEffect, useId } from 'react';
import { useNavigation } from '@react-navigation/native';
import style from '../../theme/style';
import { Colors } from '../../theme/color';
import Icon from 'react-native-vector-icons/Ionicons';

import DocumentPicker from 'react-native-document-picker';
import ImagePicker from 'react-native-image-crop-picker';
import { useFetchProfileDetail } from '../../hooks/profileData';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { useDispatch } from 'react-redux';
import { toggleSidebar } from '../../redux/slice/sideBarSlice';
import axios from 'axios';
import RNFS from 'react-native-fs';
import { API_ENDPOINTS } from '../../api/apiConfig';
import Pdf from 'react-native-pdf';
import Video from 'react-native-video';

export default function Profile() {
  const navigation = useNavigation();
  const [sideBar, setSideBar] = useState(false);
  const [resume, setResume] = useState(null);
  const [profileImage, setProfileImage] = useState(
    require('../../../assets/image/profileIcon.png')
  );
  const slideAnim = useRef(new Animated.Value(-width)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [userId, setUserId] = useState(null);
  const [data, setData] = useState();
  const [VideoPopMenu, setVideoPopMenu] = useState(false);
  const [VideoProfile, setVideoProfile] = useState(null);
45

  const dispatch = useDispatch();

  const { height, width } = Dimensions.get('window');

const pickDocument = async () => {
  try {
    const res = await DocumentPicker.pick({
      type: [
        DocumentPicker.types.pdf,
        DocumentPicker.types.doc,
        DocumentPicker.types.docx
      ],
    });





    const file = res[0];
    const filePath = file.uri.replace('file://', '');
    const base64Data = await RNFS.readFile(filePath, 'base64');

    const blob = {
      name: file.name,
      type: file.type,
      data: base64Data,
    };

    setResume(blob);
    uploadDocument(blob, 'R');
  } catch (err) {
    if (DocumentPicker.isCancel(err)) {
      console.log('User cancelled document picker');
    } else {
      console.error('Error picking document:', err);
    }
  }
};


const uploadVideo = async () => {
  const options = {
    mediaType: 'video',
    videoQuality: 'high',
  };

  launchImageLibrary(options, async (response) => {
    if (response.didCancel) {
      console.log('User cancelled video picker');
      return;
    }

    if (response.errorCode) {
      console.log('Picker error:', response.errorMessage);
      return;
    }

    const video = response.assets[0];
    const filePath = video.uri || video.originalPath;

    try {
      const base64Data = await RNFS.readFile(filePath, 'base64');
      const blob = {
        name: video.fileName || 'video.mp4',
        type: video.type || 'video/mp4',
        data: base64Data,
      };

      setVideoProfile(blob);
      uploadDocument(blob, 'VP');
      setVideoPopMenu(false)
    } catch (err) {
      console.error('Error reading video file:', err);
    }
  });
};

const recordVideo = async () => {
  const options = {
    mediaType: 'video',
    videoQuality: 'high',
    durationLimit: 120, 
  };

  launchCamera(options, async (response) => {
    if (response.didCancel) {
      console.log('User cancelled video recording');
      return;
    }

    if (response.errorCode) {
      console.log('Camera error:', response.errorMessage);
      return;
    }

    const video = response.assets[0];
    const filePath = video.uri;

    try {
      const base64Data = await RNFS.readFile(filePath, 'base64');
      const blob = {
        name: video.fileName || 'video.mp4',
        uri: video.path,
        type: video.type || 'video/mp4',
        data: base64Data,
      };

      setVideoProfile(blob);
      uploadDocument(blob, 'VP');
    } catch (err) {
      console.error('Error reading recorded video:', err);
    }
  });
};


// console.log('Recorded video:', VideoProfile);


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
    uploadDocument(blob, 'PP');
  })
  .catch((error) => {
    console.log('ImagePicker Error: ', error);
  });
};


const uploadDocument = async (data, type) => {
  const payload = {
    user_id: userId,
    type: type,
    file_name: data.name,
    mime_type: data.type,
    blob_file: data.data
  };

  console.log('Payload:', payload);

  try {
    const response = await axios.post( API_ENDPOINTS.DOCS,
      payload
    );

    refetch();
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
          setUserId(id); // Set userId state
        }
      } catch (error) {
        console.error('Failed to retrieve userId:', error);
      }
    };

    fetchUserId();
  }, []);

  
    const { profileDetail, isLoading, isError , refetch} = useFetchProfileDetail(userId);



  useEffect(() => {
    if (profileDetail && Object.keys(profileDetail).length > 0) {
      console.log('Profile:', profileDetail);
      setData(profileDetail);
    }

    setProfileImage (profileDetail?.docs?.pp_url ? { uri: profileDetail?.docs?.pp_url } : require('../../../assets/image/profileIcon.png'));

    const resumeData = {
      name : profileDetail?.docs?.resume_file_name,
      url : profileDetail?.docs?.resume_file_url,
    }

    const videoData = {
      name : profileDetail?.docs?.vid_pro_name,
      url : profileDetail?.docs?.vid_pro_url,
    }

    if(profileDetail?.docs){setResume(resumeData);}
    setVideoProfile(videoData);

    console.log('Resume:', resume);

  }, [profileDetail]);
  

  useEffect(() => {
    if (sideBar) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -width,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [sideBar, slideAnim, fadeAnim]);

  console.log('asd');

  const VideoPop = ({ onClose }) => {
    const translateY = useRef(new Animated.Value(0)).current;
    const panResponder = useRef(
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) =>
          gestureState.dy > 5 || gestureState.dy < -5,
        onPanResponderMove: Animated.event([null, { dy: translateY }], { useNativeDriver: false }),
        onPanResponderRelease: (_, gestureState) => {
          if (gestureState.dy > 100) {
            Animated.timing(translateY, {
              toValue: height,
              duration: 300,
              useNativeDriver: false,
            }).start(onClose);
          } else {
            Animated.spring(translateY, {
              toValue: 0,
              useNativeDriver: false,
            }).start();
          }
        },
      })
    ).current;

    return (
      <Animated.View
        style={[styles.VideoPop, { transform: [{ translateY }] }]}
        {...panResponder.panHandlers}
      >
        <Text style={styles.title}>Add video profile</Text>
        <Text style={styles.subtitle}>
          Supported file format: MP4, Max size: 225mb, Video length: 30 sec to 2min
        </Text>
        <View style={styles.buttonContainer}>
          <View>
            <TouchableOpacity onPress={recordVideo} style={styles.videoIconButton}>
              <Image
                source={require('../../../assets/image/camera.png')}
                style={styles.videoIcon}
              />
            </TouchableOpacity>
            <Text style={styles.buttonText}>Record Now</Text>
          </View>

          <View>
            <TouchableOpacity onPress={uploadVideo} style={styles.videoIconButton}>
              <Image
                source={require('../../../assets/image/uploadFile.png')}
                style={styles.videoIcon}
              />
            </TouchableOpacity>
            <Text style={styles.buttonText}>Upload video</Text>
          </View>
        </View>
      </Animated.View>
    );
  };

 

  return (
    <SafeAreaView style={[style.area, { backgroundColor: Colors.bg, padding: 0 }]}>

    
   
      {VideoPopMenu && (
        <View
          style={[
            styles.overlay,
            {
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-end',
            },
          ]}
        >
          <VideoPop onClose={() => setVideoPopMenu(false)} />
        </View>
      )}
      <StatusBar backgroundColor="#FFFDF7" translucent={false} barStyle={'dark-content'} />

      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: '#00000' }}
        behavior={Platform.OS === 'ios' ? 'padding' : null}
      >
        <ScrollView showsVerticalScrollIndicator={false} style={{ paddingBottom: 60 }}>
          <View style={{ backgroundColor: Colors.bg }}>
            <TouchableOpacity
              onPress={() => {
                dispatch(toggleSidebar());
              }}
              style={{
                position: 'absolute',
                zIndex: 123,
                top: 17,
                left: 5,
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
            {/* Background Blur Image */}
            <View
              style={[style.blurPic, { height: 200, backgroundColor: '#FFFDF7', opacity: 0.9 }]}
            >
              <Image
                source={profileImage}
                resizeMode="contain"
                style={{
                  height: '100%',
                  width: '100%',
                  opacity: 0.5,
                  objectFit: 'cover',
                  alignSelf: 'center',
                }}
                blurRadius={4}
              />
            </View>

            {/* Profile Section */}
            <View
              style={{
                alignItems: 'center',
                marginTop: 160,
                backgroundColor: '#fff',
                borderRadius: 20,
                padding: 16,
              }}
            >
              <TouchableOpacity
                style={{
                  top: -80,
                  alignSelf: 'center',
                  position: 'absolute',
                  height: 140,
                  width: 140,
                  borderRadius: 70,
                  overflow: 'hidden',
                  marginBottom: 16,
                }}
                onPress={pickImage}
              >
                <Image
                  source={profileImage}
                  resizeMode="cover"
                  style={{ height: '100%', width: '100%' }}
                />
              </TouchableOpacity>

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 8,
                  marginTop: 70,
                }}
              >
                //Adjust margin top to account for image change
                <Text style={[style.s22, { color: '#000', marginRight: 8 }]}>
                  {profileDetail?.introduction?.full_name || 'User'}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate('IntroMenu', {
                      data: profileDetail?.introduction,
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
                {`${profileDetail?.introduction?.profile_headline || 'No headline'} | Expert in ${
                  profileDetail?.introduction?.expertise || 'No expertise listed'
                }`}
              </Text>
            </View>

            {/* Job Search Status */}
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                height: 40, // Increased height for better spacing
                justifyContent: 'space-between',
                alignItems: 'center',
                marginHorizontal: 20,
                marginVertical: 24,
                borderWidth: 1,
                borderColor: '#14B6AA',
                borderRadius: 30,
                backgroundColor: '#F6FCFC',
                paddingHorizontal: 16, // Changed to paddingHorizontal for better text alignment
              }}
            >
              <Text
                style={[
                  style.m16,
                  { color: '#333', fontSize: 16, flex: 1, textAlign: 'center', fontSize: 10 },
                ]}
              >
                Set your job search status
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

            {/* Profile Performance Card */}
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
              <Text style={[style.m14, { color: '#000', marginBottom: 16 }]}>
                Here's how your profile is performing
              </Text>

              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View
                  style={{
                    backgroundColor: '#FFF8E1',
                    borderRadius: 30,
                    height: 56,
                    width: 56,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 16,
                  }}
                >
                  <Text style={[style.s18, { color: '#F9A825' }]}>13</Text>
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={[style.m16, { color: '#000', marginBottom: 4 }]}>
                    Recruiter actions
                  </Text>
                  <Text style={[style.r14, { color: '#666' }]}>
                    12 Nvites sent, 1 Naukri profile viewed
                  </Text>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('ProfilePerformance')}
                    style={{ marginTop: 12 }}
                  >
                    <Text style={[style.m14, { color: '#14B6AA' }]}>View details</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Basic Details Card */}
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
                <Text style={[style.m18, { color: '#000' }]}>Basic Details</Text>
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate('BasicDetail', {
                      data: profileDetail?.basicDetails,
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

              <View style={{ gap: 8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Icon
                    name="briefcase-outline"
                    size={18}
                    color={'#666'}
                    style={{ width: 24, marginRight: 12 }}
                  />
                  <Text style={[style.r12, { color: '#333' }]}>
                    {profileDetail?.basicDetails?.work_status || 'Not specified'}
                  </Text>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Icon
                    name="location-outline"
                    size={18}
                    color={'#666'}
                    style={{ width: 24, marginRight: 12 }}
                  />
                  <Text style={[style.r12, { color: '#333' }]}>
                    {profileDetail?.basicDetails?.current_state || 'Not specified'},{' '}
                    {profileDetail?.basicDetails?.current_country || 'Not specified'}
                  </Text>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Icon
                    name="calendar-outline"
                    size={18}
                    color={'#666'}
                    style={{ width: 24, marginRight: 12 }}
                  />
                  <Text style={[style.r12, { color: '#333' }]}>
                    {profileDetail?.basicDetails?.availability_to_join || 'Not specified'}
                  </Text>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Icon
                    name="mail-outline"
                    size={18}
                    color={'#666'}
                    style={{ width: 24, marginRight: 12 }}
                  />
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={[style.r12, { color: '#333' }]}>
                      {profileDetail?.basicDetails?.email || 'Not specified'}
                    </Text>
                    {/* <View
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: '#14B6AA',
                        marginLeft: 8,
                      }}
                    /> */}
                  </View>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Icon
                    name="call-outline"
                    size={18}
                    color={'#666'}
                    style={{ width: 24, marginRight: 12 }}
                  />
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={[style.r12, { color: '#333' }]}>
                      {profileDetail?.basicDetails?.mobile_number || 'Not specified'}
                    </Text>
                    {/* <View
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: '#14B6AA',
                        marginLeft: 8,
                      }}
                    /> */}
                  </View>
                </View>
              </View>
            </View>

            {/* Resume Card */}
         <View
              style={{
                marginHorizontal: 20,
                marginBottom: 20,
                backgroundColor: '#fff',
                borderRadius: 16,
                padding: 20,
                shadowRadius: 8,
                borderWidth: 1,
                borderColor: '#E5E5EA',
              }}
            >
              <View
                style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}
              >
                <Text style={[style.m18, { color: '#000' }]}>Resume</Text>
                {resume?.name && (
                  <TouchableOpacity onPress={pickDocument}>
                    <Text style={{ fontSize: 16, color: '#14B6AA' }}>
                      {resume?.name ? 'Edit' : 'Upload'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {resume?.name && (
                  <View
                    style={{
                      backgroundColor: '#FFF8E1',
                      borderRadius: 8,
                      padding: 12,
                      marginRight: 12,
                    }}
                  >
                    <Icon name="document-outline" size={24} color={'#F9A825'} />
                  </View>
                )}
                <View>
                  {resume?.name ? (
                    <>
                      <Text style={{ fontSize: 16, color: '#333' , width: 250}}>{resume.name}</Text>
                      <Text style={{ fontSize: 14, color: '#666' }}>
                      <TouchableOpacity onPress={() => navigation.navigate('PdfViewer', {
                   pdfUrl: resume?.url,
              fileName: resume?.name
            })}> 
            
            <Text style={{ color: '#14B6AA', fontSize: 14 }}>View Resume</Text>
            </TouchableOpacity>
                      </Text>
                    </>
                  ) : (
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 10,
                      }}
                    >
                      <TouchableOpacity
                        onPress={pickDocument}
                        style={{
                          width: '48%',
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderWidth: 1,
                          borderColor: '#14B6AA',
                          borderRadius: 6,
                          padding: 10,
                        }}
                      >
                        <Text style={{ fontSize: 16, color: '#14B6AA', textAlign: 'center' }}>
                          Upload Resume
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => navigation.navigate('CreateResume')}
                        style={{
                          width: '48%',
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderWidth: 1,
                          borderColor: '#14B6AA',
                          borderRadius: 6,
                          padding: 10,
                        }}
                      >
                        <Text style={{ fontSize: 16, color: '#14B6AA', textAlign: 'center' }}>
                          Build Resume
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            </View>
            {/* Video Profile */}
           <View
              style={{
                marginHorizontal: 20,
                marginBottom: 20,
                backgroundColor: '#fff',
                borderRadius: 16,
                padding: 20,
                shadowRadius: 8,
                borderWidth: 1,
                borderColor: '#E5E5EA',
              }}
            >
              <View
                style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}
              >
                <Text style={[style.m18, { color: '#000' }]}>Video Profile</Text>
                <TouchableOpacity onPress={() => setVideoPopMenu(true)}>
                  <Text style={[style.m16, { color: '#14B6AA' }]}>Add</Text>
                </TouchableOpacity>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View
                  style={{
                    backgroundColor: '#E3F2FD', // Changed to a bluish color to differentiate from document
                    borderRadius: 8,
                    padding: 12,
                    marginRight: 12,
                  }}
                >
                  <Icon name="videocam-outline" size={24} color={'#2196F3'} />
                  {/* Changed to video icon */}
                </View>

                <View style={{ flex: 1 }}>
                  {/* Added flex: 1 to ensure proper text wrapping */}
                  <Text style={[style.m14, { color: '#333' }]}>
               {VideoProfile?.name ? VideoProfile?.name : ' Improve your hiring chance by 30% by adding a video'}
                  </Text>
                  {VideoProfile?.name ? (
                 
  <TouchableOpacity onPress={() => navigation.navigate('VideoViewer', {
                    videoUrl: VideoProfile?.url,
              fileName: VideoProfile?.name
            })}> 
            
            <Text style={{ color: '#14B6AA', fontSize: 14 }}>View Video</Text>
            </TouchableOpacity>
                    
                  ) : 
                   <Text style={[style.r12, { color: '#666' }]}>
                      Recruiters prefer candidates with a video Profile
                    </Text>
                  }
                </View>
              </View>
            </View>
            {/* Profile Summary */}
            <View
              style={{
                marginHorizontal: 20,
                marginBottom: 20,
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
                <Text style={[style.m18, { color: '#000' }]}>Profile Summary</Text>
                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate('ProfileSummary', {
                      data: profileDetail?.profileSummary,
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
              <Text style={[style.r12, { color: '#666' }]}>
                {profileDetail?.profileSummary?.profile_summary || 'No profile summary'}
              </Text>
            </View>
            {/* Professional Details */}
            <View
              style={{
                marginHorizontal: 20,
                marginBottom: 20,
                backgroundColor: '#fff',
                borderRadius: 16,
                padding: 20,
                shadowRadius: 8,
                borderWidth: 1,
                borderColor: '#E5E5EA',
              }}
            >
              {/* Header Section */}
              <View
                style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}
              >
                <Text style={[style.m18, { color: '#000' }]}>Professional Details</Text>
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate('ProfessionalDetail', {
                      data: profileDetail?.professionalDetail,
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

              {/* Professional Details */}
              {[
                {
                  label: 'Current Industry',
                  value: profileDetail?.professionalDetail?.current_industry,
                },
                {
                  label: 'Current Department',
                  value: profileDetail?.professionalDetail?.current_department,
                },
                {
                  label: 'Current Category',
                  value: profileDetail?.professionalDetail?.role_category,
                },
                {
                  label: 'Current Job',
                  value: profileDetail?.professionalDetail?.current_job_role,
                },
              ].map((item, index) => (
                <View key={index} style={{ marginBottom: index !== 3 ? 12 : 0 }}>
                  <Text style={[style.r12, { color: '#888' }]}>{item.label}</Text>
                  <Text style={[style.m14, { color: '#333' }]}>
                    {item.value?.trim() ? item.value : 'Not specified'}
                  </Text>
                </View>
              ))}

              {/* Fallback Message if All Fields are Empty */}
              {(!profileDetail?.professionalDetail ||
                Object.values(profileDetail?.professionalDetail).every((val) => !val?.trim())) && (
                <Text style={[style.r12, { color: '#666', marginTop: 10 }]}>
                  No professional details available. Update your profile to help recruiters.
                </Text>
              )}
            </View>
            {/* Key skills */}
            <View
              style={{
                marginHorizontal: 20,
                backgroundColor: '#fff',
                borderRadius: 16,
                padding: 20,
                shadowRadius: 8,
                borderWidth: 1,
                borderColor: '#E5E5EA',
              }}
            >
              {/* Header Section */}
              <View
                style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}
              >
                <Text style={[style.m18, { color: '#000' }]}>Key Skills</Text>
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate('Skills', { data: profileDetail?.skill, id: userId })
                  }
                >
                  <Image
                    source={require('../../../assets/image/editIcon2.png')}
                    style={{ width: 15, height: 15 }}
                  />
                </TouchableOpacity>
              </View>

              {/* Skills List or Empty State */}
              {profileDetail?.skill?.length > 0 ? (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {profileDetail?.skill.map((item, index) => (
                    <View
                      key={index}
                      style={{
                        borderWidth: 1,
                        borderColor: '#E5E5EA',
                        borderRadius: 16,
                        paddingHorizontal: 12,
                        paddingVertical: 4,
                        alignSelf: 'flex-start',
                        backgroundColor: '#F6F6F6',
                      }}
                    >
                      <Text
                        style={[
                          style.r12,
                          { color: '#555', textTransform: 'uppercase', fontWeight: '600' },
                        ]}
                      >
                        {item}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={{ alignItems: 'center', padding: 10 }}>
                  <Text style={[style.r12, { color: '#666', textAlign: 'center' }]}>
                    Add your skills to highlight your expertise
                  </Text>
                </View>
              )}
            </View>
            {/* Employment Details */}
            <View
              style={{
                marginHorizontal: 20,
                marginBottom: 20,
                marginTop: 20,
                backgroundColor: '#fff',
                borderRadius: 16,
                padding: 20,
                shadowRadius: 8,
                borderWidth: 1,
                borderColor: '#E5E5EA',
              }}
            >
              {/* Header Section */}
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginBottom: 16,
                }}
              >
                <Text style={[style.m18, { color: '#000' }]}>Employment</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Employment', { id: userId })}>
                  <Text style={[style.m16, { color: '#14B6AA' }]}>Add</Text>
                </TouchableOpacity>
              </View>

              {/* Employment List or Empty State */}
              {data?.employment?.length > 0 ? (
                <View>
                  {data.employment
                    .map((emp, index) => (
                      <TouchableOpacity
                        onPress={() => navigation.navigate('Employment', { emp: emp, id: userId })}
                        key={emp.emp_id}
                        style={{
                          marginBottom: 12,
                          borderBottomWidth: index !== data.employment.length - 1 ? 1 : 0,
                          borderColor: '#f0f0f0',
                          paddingBottom: index !== data.employment.length - 1 ? 20 : 8,
                        }}
                      >
                        {/* Job Title and Edit Icon */}
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <Text
                            style={{ fontSize: 16, color: 'black', fontWeight: '600', padding: 2 }}
                          >
                            {emp.curr_job_title}
                          </Text>
                        </View>

                        {/* Company and Duration Details */}
                        <Text style={{ fontSize: 12, color: '#888', padding: 2 }}>
                          {emp.curr_company_name}
                        </Text>
                        <Text style={{ fontSize: 12, color: '#888' }}>
                          {emp.joining_date}{' '}
                          {emp.isCurrentCompany &&
                            `(${emp.total_exp_in_years}y ${emp.total_exp_in_months}m)`}
                        </Text>
                      </TouchableOpacity>
                    ))}
                </View>
              ) : (
                <View style={{ alignItems: 'center', padding: 10 }}>
                  <Text style={[style.r12, { color: '#666', textAlign: 'center' }]}>
                    No employment details added yet. Click "Add" to showcase your work experience.
                  </Text>
                </View>
              )}
            </View>
            {/* Project Details */}
            <View
              style={{
                marginHorizontal: 20,
                marginBottom: 20,
                backgroundColor: '#fff',
                borderRadius: 16,
                padding: 20,
                shadowRadius: 8,
                borderWidth: 1,
                borderColor: '#E5E5EA',
              }}
            >
              {/* Header Section */}
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginBottom: 16,
                }}
              >
                <Text style={[style.m18, { color: '#000' }]}>Projects</Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate('ProjectDetail', { id: userId })}
                >
                  <Text style={[style.m16, { color: '#14B6AA' }]}>Add</Text>
                </TouchableOpacity>
              </View>

              {/* Projects List or Empty State */}
              {profileDetail?.projects?.length > 0 ? (
                <View>
                  {profileDetail?.projects?.map((project, index) => (
                    <TouchableOpacity
                      onPress={() =>
                        navigation.navigate('ProjectDetail', { project: project, id: userId })
                      }
                      key={project.id}
                      style={{
                        marginBottom: 12,
                        borderBottomWidth: index !== profileDetail?.projects.length - 1 ? 1 : 0,
                        borderColor: '#f0f0f0',
                        paddingBottom: index !== profileDetail?.projects.length - 1 ? 20 : 8,
                      }}
                    >
                      {/* Project Title and Edit Icon */}
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <Text style={[{ fontSize: 16, color: '#333', fontWeight: '600' }]}>
                          {project.project_title}
                        </Text>
                        <TouchableOpacity
                          onPress={() => {
                            // Navigate to edit project screen with current project details
                            navigation.navigate('EditProject', { projectDetails: project });
                          }}
                        ></TouchableOpacity>
                      </View>

                      {/* Project Status and Duration */}
                      <Text style={[{ fontSize: 12, color: '#888' }]}>
                        {project.project_status}
                      </Text>
                      <Text style={[{ fontSize: 12, color: '#888' }]}>
                        {project.work_from} - {project.work_till ? project.work_till : 'Present'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <View style={{ alignItems: 'center', padding: 10 }}>
                  <Text style={[style.r12, { color: '#666', textAlign: 'center' }]}>
                    No projects added yet. Click "Add" to showcase your work experience.
                  </Text>
                </View>
              )}
            </View>
            {/* Eduction */}
            <View
              style={{
                marginHorizontal: 20,
                marginBottom: 20,
                backgroundColor: '#fff',
                borderRadius: 16,
                padding: 20,
                shadowRadius: 8,
                borderWidth: 1,
                borderColor: '#E5E5EA',
              }}
            >
              <View
                style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}
              >
                <Text style={[style.m18, { color: '#000' }]}>Education</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Education')}>
                  <Text style={[style.m16, { color: '#14B6AA' }]}>Add</Text>
                </TouchableOpacity>
              </View>

              {profileDetail?.education?.length > 0 ? (
                profileDetail?.education.map((edu, index) => (
                  <TouchableOpacity
                    onPress={() => navigation.navigate('Education', { edu: edu, id: userId })}
                    key={edu.id}
                    style={{
                      marginBottom: 12,
                      borderBottomWidth: index !== profileDetail?.education?.length - 1 ? 1 : 0,
                      borderColor: '#f0f0f0',
                      paddingBottom: index !== profileDetail?.education?.length - 1 ? 10 : 8,
                    }}
                  >
                    <View
                      style={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      {edu.education === 'X' || edu.education === 'XII' ? (
                        <Text style={{ fontSize: 16, color: '#333', fontWeight: '600' }}>
                          {`Class ${edu.education || ''}`}
                        </Text>
                      ) : (
                        <Text style={{ fontSize: 16, color: '#333', fontWeight: '600' }}>
                          {edu.course_name} in {edu.specialization_name || ''}
                        </Text>
                      )}
                      <Image style={{ marginLeft: 10, width: 15, height: 15 }} />
                    </View>
                    {edu.education === 'X' || edu.education === 'XII' ? (
                      <Text style={{ fontSize: 12, color: '#888' }}>{edu.board_name || ''}</Text>
                    ) : (
                      <Text style={{ fontSize: 12, color: '#888' }}>
                        {edu.institute_name || ''}
                      </Text>
                    )}
                    <Text style={{ fontSize: 12, color: '#888' }}>
                      {edu.year_of_completion || ''}
                    </Text>
                  </TouchableOpacity>
                ))
              ) : (
                <Text>No Education Added</Text>
              )}
            </View>
            {/* Personal Details */}
            <View
              style={{
                marginHorizontal: 20,
                marginBottom: 20,
                backgroundColor: '#fff',
                borderRadius: 16,
                padding: 20,
                shadowRadius: 8,
                borderWidth: 1,
                borderColor: '#E5E5EA',
              }}
            >
              {/* Header Section */}
              <View
                style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}
              >
                <Text style={[style.m18, { color: '#000' }]}>Personal Details</Text>
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate('PersonalDetails', {
                      id: userId,
                      data: data?.PersonalDetail,
                    })
                  }
                >
                  <Image
                    source={require('../../../assets/image/editIcon2.png')}
                    style={{ width: 15, height: 15 }}
                  />
                </TouchableOpacity>
              </View>

              {/* Personal Details */}
              {[
                { label: 'Gender', value: data?.PersonalDetail.gender || 'Not specified' },
                {
                  label: 'Date of Birth',
                  value: data?.PersonalDetail.date_of_birth || 'Not specified',
                },
                { label: 'Category', value: data?.PersonalDetail.category || 'Not specified' },
                { label: 'Disability', value: data?.PersonalDetail.disability || 'Not specified' },
                {
                  label: 'Career Break',
                  value: data?.PersonalDetail.careerbreak || 'Not specified',
                },
              ].map((item, index) => (
                <View key={index} style={{ marginBottom: 12 }}>
                  <Text style={[style.r12, { color: '#888' }]}>{item.label}</Text>
                  <Text style={[style.m14, { color: '#333' }]}>
                    {item.value?.trim() ? item.value : 'Not specified'}
                  </Text>
                </View>
              ))}

              {/* Fallback Message if All Fields are Empty */}
              {(!data?.PersonalDetail ||
                Object.values(data?.PersonalDetail).every(
                  (val) => typeof val !== 'string' || !val?.trim()
                )) && (
                <Text style={[style.r12, { color: '#666', marginTop: 10 }]}>
                  No personal details available. Update your profile for better recommendations.
                </Text>
              )}
            </View>
            {/* Language */}
            <View
              style={{
                marginHorizontal: 20,
                marginBottom: 20,
                backgroundColor: '#fff',
                borderRadius: 16,
                padding: 20,
                shadowRadius: 8,
                borderWidth: 1,
                borderColor: '#E5E5EA',
              }}
            >
              {/* Header Section */}
              <View
                style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}
              >
                <Text style={[style.m18, { color: '#000' }]}>Languages</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Language', { id: userId })}>
                  <Text style={[style.m16, { color: '#14B6AA' }]}>Add</Text>
                </TouchableOpacity>
              </View>

              {/* Language List */}
              {profileDetail?.language?.length > 0 ? (
                profileDetail?.language?.map((item, index) => (
                  <TouchableOpacity
                    key={item.id || index} // Fallback key to prevent crashes
                    onPress={() => navigation.navigate('Language', { language: item, id: userId })}
                    style={{ marginBottom: 12 }}
                  >
                    <Text style={[style.m18, { color: '#333', fontWeight: '400' }]}>
                      {item.language_name || 'Unknown Language'}
                    </Text>
                    <Text style={[style.r12, { color: '#888' }]}>
                      {item.comfortable || 'Not specified'}
                    </Text>
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={[style.r12, { color: '#666' }]}>No languages added.</Text>
              )}
            </View>

            {/* Your prefer career */}
            <View
              style={{
                marginHorizontal: 20,
                marginBottom: 20,
                backgroundColor: '#fff',
                borderRadius: 16,
                padding: 20,
                shadowRadius: 8,
                borderWidth: 1,
                borderColor: '#E5E5EA',
              }}
            >
              {/* Header Section */}
              <View
                style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}
              >
                <Text style={[style.m18, { color: '#000' }]}>Career Preference</Text>
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate('Career', {
                      id: userId,
                      data: profileDetail?.careerPreference,
                    })
                  }
                >
                  <Image
                    source={require('../../../assets/image/editIcon2.png')}
                    style={{ width: 15, height: 15 }}
                  />
                </TouchableOpacity>
              </View>

              {/* Career Details */}
              <View
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  gap: 4,
                }}
              >
                {/* Left Column */}
                <View>
                  <View style={{ marginBottom: 12 }}>
                    <Text style={[style.r11, { color: '#888' }]}>Preferred Location</Text>
                    <Text style={[style.m12, { color: '#333' }]}>
                      {profileDetail?.careerPreference?.prefered_location || 'Not specified'}
                    </Text>
                  </View>

                  <View style={{ marginBottom: 12 }}>
                    <Text style={[style.r11, { color: '#888' }]}>Salary Expectation</Text>
                    <Text style={[style.m12, { color: '#333' }]}>
                      {profileDetail?.careerPreference?.currency || 'N/A'} {' '}
                      {profileDetail?.careerPreference?.current_annual_salary || 'Not specified'}
                    </Text>
                  </View>

                  <View style={{ marginBottom: 12 }}>
                    <Text style={[style.r11, { color: '#888' }]}>Job Type</Text>
                    <Text style={[style.m12, { color: '#333' }]}>
                      {profileDetail?.careerPreference?.job_type || 'Not specified'}
                    </Text>
                  </View>
                </View>

                {/* Right Column */}
                <View>
                  <View style={{ marginBottom: 12 }}>
                    <Text style={[style.r11, { color: '#888' }]}>Preferred Role</Text>
                    <Text style={[style.m12, { color: '#333' }]}>
                      {profileDetail?.careerPreference?.prefered_job_role || 'Not specified'}
                    </Text>
                  </View>

                  <View style={{ marginBottom: 12 }}>
                    <Text style={[style.r11, { color: '#888' }]}>Preferred Shift</Text>
                    <Text style={[style.m12, { color: '#333' }]}>
                      {profileDetail?.careerPreference?.prefered_shift || 'Not specified'}
                    </Text>
                  </View>

                  <View style={{ marginBottom: 12 }}>
                    <Text style={[style.r11, { color: '#888' }]}>Employment Type</Text>
                    <Text style={[style.m12, { color: '#333' }]}>
                      {profileDetail?.careerPreference?.prefered_employment_type || 'Not specified'}
                    </Text>
                  </View>
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
  VideoPop: {
    backgroundColor: 'white',
    padding: 40,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    height: 320,
    position: 'absolute',
    bottom: -25,

    elevation: 5,
    width: '100%',
    marginBottom: 20,
  },
  title: {
    textAlign: 'center',
    fontSize: 25,
    fontWeight: 'bold',
    fontFamily: 'Poppins',
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 12,
    color: '#667085',
    marginTop: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  videoIconButton: {
    borderWidth: 1,
    borderColor: '#DDE0E5',
    borderRadius: 50,
    padding: 20,
  },
  videoIcon: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  buttonText: {
    textAlign: 'center',
    marginTop: 5,
    fontWeight: 'bold',
    fontSize: 14,
  },

  safeArea: {
    flex: 1,
  },
  overlay: {
    bottom: 0,
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // Blackish tint with opacity
    zIndex: 1001, // Ensure it's above other content
  },
  closeOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  sidebarContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: '80%', // 80% of screen width
    zIndex: 1002, // Higher than overlay
    backgroundColor: 'white', // Make sure it has a background
  },
});
