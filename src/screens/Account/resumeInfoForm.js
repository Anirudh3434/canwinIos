'use client';

import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useFetchProfileDetail } from '../../hooks/profileData';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSelector } from 'react-redux';
import { Item } from 'react-native-paper/lib/typescript/components/Drawer/Drawer';
import { Colors } from '../../theme/color';

const PersonalDetails = () => {
  const [userId, setUserId] = useState();
  // Track which fields have been touched
  const [touched, setTouched] = useState({
    fullName: false,
    email: false,
    phone: false,
    state: false,
    city: false,
  });

  const SocialLinks = useSelector((state) => state.socialLink);

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('userId');
        if (storedUserId) {
          const id = Number.parseInt(storedUserId);
          setUserId(+id);
        }
      } catch (error) {
        console.error('Failed to retrieve userId:', error);
      }
    };

    fetchUserId();
  }, []);

  // Fetch profile data directly
  const { profileDetail, isLoading, isError } = useFetchProfileDetail(userId);

  const navigation = useNavigation();

  // Form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');

  // Define missing variables
  const [employmentList, setEmploymentList] = useState([]);
  const [educationList, setEducationList] = useState([]);
  const [projectList, setProjectList] = useState([]);
  const [skillList, setSkillList] = useState([]);

  // ✅ Update form state when profileDetail changes
  useEffect(() => {
    if (profileDetail) {
      setFullName(profileDetail?.introduction?.full_name || '');
      setEmail(profileDetail?.basicDetails?.email || '');
      setPhone(profileDetail?.basicDetails?.mobile_number || '');
      setState(profileDetail?.basicDetails?.current_state || '');
      setCity(profileDetail?.basicDetails?.current_city || '');

      // Also update the other lists
      setEducationList(profileDetail?.education || []);
      setEmploymentList(profileDetail?.employment || []);
      setProjectList(profileDetail?.projects || []);
      setSkillList(profileDetail?.skill || []);

      console.log('Profile data loaded:', profileDetail);
    }
  }, [profileDetail]);

  console.log('FullName:', fullName);
  console.log('Email:', email);
  console.log('Phone:', phone);
  console.log('State:', state);
  console.log('City:', city);

  // Animation state
  const [expanded, setExpanded] = useState(false);
  const widthAnim = useRef(new Animated.Value(30)).current;
  const heightAnim = useRef(new Animated.Value(40)).current;

  const toggleExpand = () => {
    Animated.timing(widthAnim, {
      toValue: expanded ? 30 : 220,
      duration: 300,
      useNativeDriver: false,
    }).start();

    Animated.timing(heightAnim, {
      toValue: expanded ? 50 : 50,
      duration: 300,
      useNativeDriver: false,
    }).start();

    setExpanded(!expanded);
  };

  // Function to handle field blur
  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  // Function to check if a field has an error
  const hasError = (value, fieldName) => {
    const isEmpty = !value.trim();
    const isTouched = touched[fieldName];
    return isEmpty && isTouched;
  };

  // Validate all fields before preview
  const validateAllFields = () => {
    // Mark all fields as touched
    setTouched({
      fullName: true,
      email: true,
      phone: true,
      state: true,
      city: true,
    });

    // Check if required fields are empty
    if (!fullName.trim()) {
      return false;
    } else if (!email.trim()) {
      return false;
    } else if (!phone.trim()) {
      return false;
    } else if (!state.trim()) {
      return false;
    } else if (!city.trim()) {
      return false;
    }

    return true;
  };

  const handlePreviewAndDownload = () => {
    if (!validateAllFields()) return;

    // Navigate to Resume Template with all the data as params
    navigation.navigate('ResumeTemplete', {
      personalData: {
        fullName: fullName,
        email: email,
        phone: phone,
        state: state,
        city: city,
      },
      employmentData: employmentList,
      educationData: educationList,
      projectData: projectList,
      skillData: skillList,
      // Add social links if needed
      socialLinks: {
        linkedin: '', // Add default or fetch from somewhere
        github: '', // Add default or fetch from somewhere
      },
    });
  };

  // Render input field with error handling
  const renderInputField = (label, value, setValue, fieldName, keyboardType = 'default') => {
    const isError = hasError(value, fieldName);

    return (
      <View style={styles.inputContainer}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={[styles.input, isError && styles.inputError]}
            placeholder={label}
            value={value}
            onChangeText={setValue}
            keyboardType={keyboardType}
            onBlur={() => handleBlur(fieldName)}
          />
          {isError && (
            <View style={styles.errorIconContainer}>
              <Text style={styles.errorIcon}>!</Text>
            </View>
          )}
        </View>
        {isError && <Text style={styles.errorText}>This field is required</Text>}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>
        {renderInputField('Full Name', fullName, setFullName, 'fullName')}
        {renderInputField('Email', email, setEmail, 'email', 'email-address')}
        {renderInputField('Phone', phone, setPhone, 'phone', 'phone-pad')}
        {renderInputField('State', state, setState, 'state')}
        {renderInputField('City', city, setCity, 'city')}

        {/* Rest of the component remains the same */}
        <View style={styles.sectionContainer}>
          <Text style={styles.titleLabel}>Employment History</Text>

          {employmentList && employmentList.length > 0 ? (
            <View
              style={{
                borderWidth: 1,
                borderColor: 'lightgrey',
                borderRadius: 8,
                padding: 16,
                marginTop: 10,
              }}
            >
              {employmentList.map((emp, index) => (
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate('Employment', { emp: emp, req: 'ResumeLocal' })
                  }
                  key={emp.emp_id || index}
                  style={{
                    marginBottom: 12,
                    borderBottomWidth: index !== employmentList.length - 1 ? 1 : 0,
                    borderColor: '#f0f0f0',
                    paddingBottom: index !== employmentList.length - 1 ? 20 : 1,
                  }}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Text style={[{ fontSize: 16, color: 'black', fontWeight: '600' }]}>
                      {emp.curr_job_title}
                    </Text>
                  </View>

                  <Text style={[{ fontSize: 12, color: '#888', padding: 2 }]}>
                    {emp.curr_company_name}
                  </Text>
                  <Text style={[{ fontSize: 12, color: '#888' }]}>
                    {`${emp.joining_date} (${emp.total_exp_in_years}y ${emp.total_exp_in_months}m)`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View>
              <Text style={styles.subheading}>
                List your previous jobs, key responsibilities, and achievements.
              </Text>
            </View>
          )}
          <TouchableOpacity
            onPress={() => navigation.navigate('Employment', { req: 'ResumeLocal' })}
            style={styles.addButton}
          >
            <Text style={styles.addMoreText}>+ Add Employment</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.titleLabel}>Education</Text>

          {educationList && educationList.length > 0 ? (
            <View
              style={{
                borderWidth: 1,
                borderColor: 'lightgrey',
                borderRadius: 8,
                padding: 16,
                marginTop: 10,
              }}
            >
              {educationList.map((edu, index) => (
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
                    <Text style={{ fontSize: 12, color: '#888' }}>{edu.institute_name || ''}</Text>
                  )}
                  <Text style={{ fontSize: 12, color: '#888' }}>
                    {edu.year_of_completion || ''}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <Text style={styles.subheading}>
              Add your degrees, universities and relevant coursework.
            </Text>
          )}
          <TouchableOpacity
            onPress={() => navigation.navigate('Education', { req: 'ResumeLocal' })}
            style={styles.addButton}
          >
            <Text style={styles.addMoreText}>+ Add Education</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.titleLabel}>Projects</Text>
          <View>
            {projectList && projectList.length > 0 ? (
              <View
                style={{
                  borderWidth: 1,
                  borderColor: 'lightgrey',
                  borderRadius: 8,
                  padding: 16,
                  marginTop: 10,
                }}
              >
                {projectList.map((project, index) => (
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate('ProjectDetail', { project: project, req: 'ResumeLocal' })
                    }
                    key={project.id || index}
                    style={{
                      marginBottom: 12,
                      borderBottomWidth: index !== projectList.length - 1 ? 1 : 0,
                      borderColor: '#f0f0f0',
                      paddingBottom: index !== projectList.length - 1 ? 20 : 0,
                    }}
                  >
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
                    </View>
                    <Text style={[{ fontSize: 12, color: '#888' }]}>{project.project_status}</Text>
                    <Text style={[{ fontSize: 12, color: '#888' }]}>
                      {project.work_from} - {project.work_till ? project.work_till : 'Present'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View>
                <Text style={styles.subheading}>
                  Add your projects to showcase your work experience
                </Text>
              </View>
            )}
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('ProjectDetail', { req: 'ResumeLocal' })}
            style={styles.addButton}
          >
            <Text style={styles.addMoreText}>+ Add Projects</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.titleLabel}>Skills</Text>
          {skillList && skillList.length > 0 ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {skillList.map((skill, index) => (
                <View
                  key={index}
                  style={{
                    borderWidth: 1,
                    borderColor: '#E5E5EA',
                    borderRadius: 10,
                    paddingHorizontal: 6,
                    paddingVertical: 4,
                    alignSelf: 'flex-start',
                    backgroundColor: '#F6F6F6',
                  }}
                >
                  <Text
                    style={[
                      {
                        color: '#555',
                        textTransform: 'uppercase',
                        fontWeight: '500',
                        fontSize: 12,
                      },
                    ]}
                  >
                    {skill}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.subheading}>Add your top skill to stand out</Text>
          )}
          <TouchableOpacity
            onPress={() => navigation.navigate('Skills', { req: 'ResumeLocal' })}
            style={styles.addButton}
          >
            <Text style={styles.addMoreText}>+ Add Skill</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.titleLabel}>Website & Social Links</Text>
          <Text style={styles.subheading}>
            Showcase your online presence and professional brand. Add relevant links to help
            recruiters find you.
          </Text>

          <View
            style={{
              borderWidth: 1,
              borderColor: 'lightgrey',
              borderRadius: 8,
              padding: 10,
              marginTop: 10,
            }}
          >
            {Object.entries(SocialLinks).map(([key, value]) =>
              value.trim() ? (
                <View key={key} style={styles.linkContainer}>
                  <Text style={styles.linkLabel}>
                    {key.charAt(0).toUpperCase() + key.slice(1)}:
                  </Text>
                  <Text style={styles.linkValue}>{value}</Text>
                </View>
              ) : null
            )}
          </View>

          <TouchableOpacity
            onPress={() => navigation.navigate('SocialLinks', { req: 'ResumeLocal' })}
            style={styles.addButton}
          >
            <Text style={styles.addMoreText}>+ Add Link</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.floatingButtonContainer}>
        <Animated.View style={[styles.expandingView, { width: widthAnim, height: heightAnim }]}>
          <TouchableOpacity>
            {expanded && (
              <TouchableOpacity onPress={handlePreviewAndDownload}>
                <Text style={{ color: 'white', fontSize: 12 }}>Preview & Download</Text>
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        </Animated.View>
        <TouchableOpacity style={styles.floatingButton} onPress={toggleExpand}>
          <Image
            source={require('../../../assets/image/FileIcon.png')}
            style={styles.floatingIcon}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    height: '100%',
    flex: 1,
    padding: 20,
    paddingBottom: 20,
    
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 10,
    marginTop: 10,
  },
  headerContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 5,
  },
  headerTitle: {
    fontFamily: 'Poppins-Medium',
    fontSize: 18,
    fontWeight: '600',
  },
  label: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    marginBottom: 5,
  },
  titleLabel: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputWrapper: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    color: '#9F9F9F',
    borderWidth: 1,
    borderColor: '#D5D9DF',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 18,
    marginTop: 10,
  },
  // Enhanced error style for inputs
  inputError: {
    borderColor: '#FF3B30',
    borderWidth: 1.5,
    backgroundColor: 'rgba(255, 59, 48, 0.05)',
  },
  errorIconContainer: {
    position: 'absolute',
    right: 12,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorIcon: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 11,
    marginTop: 4,
    marginLeft: 2,
  },
  photoContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    marginBottom: 20,
  },
  profilePlaceholder: {
    width: 60,
    height: 60,
    objectFit: 'contain',
    borderRadius: 5,
    backgroundColor: '#eee',
    marginBottom: 10,
  },
  profileSummaryArea: {
    padding: 10,
    marginTop: 20,
    backgroundColor: '#EEF3FA',
    marginBottom: 20,
    height: 200,
    borderWidth: 1,
    borderColor: '#D5D9DF',
    borderRadius: 8,
  },
  subheading: {
    color: '#9F9F9F',
    fontFamily: 'Poppins-Regular',
  },
  uploadText: {
    color: 'blue',
  },
  floatingButtonContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    zIndex: 10,
  },
  expandingView: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    backgroundColor: '#7D53A1',
    borderRadius: 50,
    width: 30,
    height: 30,
    bottom: 0,
    right: 10,
    zIndex: 1,
  },
  floatingButton: {
    position: 'absolute',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
    height: 50,
    borderRadius: 30,
    backgroundColor: '#7D53A1',
    alignItems: 'center',
    justifyContent: 'center',
    bottom: 0,
    right: 0,
    zIndex: 2,
  },
  floatingIcon: {
    objectFit: 'contain',
    width: 30,
    height: 30,
    tintColor: '#fff',
  },
  sectionContainer: {
    marginBottom: 20,
  },
  addMoreButton: {
    marginTop: 4,
    marginBottom: 20,
  },
  addMoreText: {
    color: '#006AF9',
  },
  addButton: {
    marginTop: 10,
    marginBottom: 20,
  },
  textFormatTools: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  linkLabel: {
    color: Colors.primary,
    fontWeight: '600',
  },
  linkValue: {
    color: Colors.disable2,
  },
  linkContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
});

export default PersonalDetails;
