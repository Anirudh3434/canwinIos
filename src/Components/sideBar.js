import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  FlatList,
  Dimensions,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { toggleSidebar } from '../redux/slice/sideBarSlice';
import { API_ENDPOINTS } from '../api/apiConfig';
import ProfileImageFallback from './profileImageFallback';
import axios from 'axios';

const Sidebar = () => {
  const navigation = useNavigation();
  const [isOpen, setIsOpen] = useState(false);
  const [isFeedbackSelected, setIsFeedbackSelected] = useState(null);
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [docs, setDocs] = useState();
  const [roleId, setRoleId] = useState(null);
  const dispatch = useDispatch();
  const fullname = name ? name.split(' ') : [];

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedRoleId = await AsyncStorage.getItem('roleId');
        setRoleId(storedRoleId);
        const storedUserId = await AsyncStorage.getItem('userId');
        if (storedUserId) {
          const response = await axios.get(`${API_ENDPOINTS.INTRODUCTION}?user_id=${storedUserId}`);
          const docsResponse = await axios.get(`${API_ENDPOINTS.DOCS}?user_id=${storedUserId}`);
          console.log(docsResponse.data.data);
          setDocs(docsResponse.data.data);
          setName(response.data.data.full_name);
          
          // Fetch company details if roleId is 2
          if (storedRoleId === '2') {
            const companyResponse = await axios.get(`${API_ENDPOINTS.COMPANY_DETAILS}?user_id=${storedUserId}`);
            if (companyResponse.data && companyResponse.data.data) {
              setCompanyName(companyResponse.data.data.company_name || '');
            }
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    fetchUserData();
  }, []);

  const navItems =
    roleId === '1'
      ? [
          {
            id: 1,
            name: 'Search Jobs',
            icon: require('../../assets/image/searchJob.png'),
            route: 'Search',
          },
          {
            id: 2,
            name: 'Recommended jobs',
            icon: require('../../assets/image/recommend.png'),
            route: 'recommendedJobsList',
            type: 'recommended'
          },
          { id: 3, name: 'Saved jobs', icon: require('../../assets/image/saveJob.png'), route: '' },
          { id: 4, name: 'Settings', icon: require('../../assets/image/setting.png'), route: 'setting' },
          { id: 5, name: 'About Us', icon: require('../../assets/image/AboutUs.png'), route: '' },
          {
            id: 6,
            name: 'Write to us',
            icon: require('../../assets/image/writeToUs.png'),
            route: '',
          },
        ]
      : [
          {
            id: 1,
            name: 'Manage Job Listing',
            icon: require('../../assets/image/filter.png'),
            route: 'Manage Job Listing',
          },
          {
            id: 2,
            name: 'Application Received',
            icon: require('../../assets/image/recommend.png'),
            route: '',
          },
          {
            id: 3,
            name: 'Interview Scheduler',
            icon: require('../../assets/image/schedule.png'),
            route: '',
          },
          { id: 4, name: 'Settings', icon: require('../../assets/image/setting.png'), route: 'setting' },
        ];

  const handleNavigation = (route , type) => {
    navigation.navigate(route , { type: type });
    setIsOpen(false);
  };

  const handleFeedback = (selected) => {
    setIsFeedbackSelected(selected);
    // TODO: Implement feedback submission logic
  };

  if (roleId === null) {
    return null; // Or return a loading indicator if you have one
  }

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.item} onPress={() => {handleNavigation(item.route , item.type); dispatch(toggleSidebar())}}>
      <Image source={item.icon} style={styles.itemIcon} />
      <Text style={styles.itemText}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.sidebar}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          { docs ? <Image source={{ uri: roleId == 1 ? docs.pp_url : docs.comp_url }} style={styles.profileImage} /> : <ProfileImageFallback fullname={name} size={45} fontSize={20} />}
          <View style={styles.profileDetails}>
            <View>
              <Text style={styles.profileName}>{name}</Text>
              {roleId === '2' && companyName && (
                <Text style={styles.companyName}>{companyName}</Text>
              )}
            </View>
            <TouchableOpacity onPress={() => dispatch(toggleSidebar())}>
              <Image
                source={require('../../assets/image/arrow-right.png')}
                style={styles.arrowIcon}
              />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.divider} />
        {/* Navigation Items */}
        <FlatList
          data={navItems}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          style={styles.navList}
        />
        <View style={styles.logoutContainer}>
          <TouchableOpacity
            onPress={async () => {
              try {
                await AsyncStorage.removeItem('userId');
                await AsyncStorage.removeItem('lastTab');
                dispatch(toggleSidebar())
                navigation.navigate('Login');
              } catch (error) {
                console.error('Error during logout:', error);
              }
            }}
            style={styles.logoutButton}
          >
            <Text style={styles.logoutButtonText}>Log Out</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.divider} />
        {/* Feedback Section */}
        {/* <View style={styles.feedbackSection}>
         <Text>Finding this app useful?</Text>
         <View style={styles.feedbackButtons}>
         <TouchableOpacity
         style={[styles.feedbackButton, isFeedbackSelected === 'Yes' && styles.selectedButton]}
         onPress={() => handleFeedback('Yes')}
         >
         <Text style={styles.feedbackButtonText}>Yes</Text>
         </TouchableOpacity>
         <TouchableOpacity
         style={[styles.feedbackButton, isFeedbackSelected === 'No' && styles.selectedButton]}
         onPress={() => handleFeedback('No')}
         >
         <Text style={styles.feedbackButtonText}>No</Text>
         </TouchableOpacity>
         </View>
         </View> */}
      </View>
    </View>
  );
};

const { height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    zIndex: 1000,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 50,
    marginRight: 5
  },
  sidebar: {
    width: '100%',
    height: height - 10,
    backgroundColor: '#FFFFFF',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    gap: 10
  },
  icon: {
    width: 1,
    height: 1,
    objectFit: 'contain',
  },
  profileImageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#80559A',
    width: 50,
    height: 50,
    borderRadius: 50,
    marginRight: 15,
  },
  profileImageText: {
    color: 'white',
    fontSize: 20,
  },
  profileDetails: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Regular',
  },
  companyName: {
    fontSize: 14,
    color: '#555',
    fontFamily: 'Poppins-Regular',
    marginTop: 2,
  },
  arrowIcon: {
    width: 12,
    height: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#ddd',
  },
  navList: {
    padding: 20,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  itemIcon: {
    width: 14,
    height: 14,
    marginRight: 20,
    objectFit: 'contain'
  },
  itemText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
  },
  logoutContainer: {
    padding: 20,
  },
  logoutButton: {
    width: '100%',
    paddingVertical: 8,
    borderRadius: 5,
    backgroundColor: '#80559A',
    alignItems: 'center',
  },
  logoutButtonText: {
    fontSize: 16,
    color: 'white',
  },
  feedbackSection: {
    padding: 20,
  },
  feedbackButtons: {
    flexDirection: 'row',
    marginTop: 10,
  },
  feedbackButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 5,
    backgroundColor: 'transparent',
    marginRight: 10,
  },
  selectedButton: {
    backgroundColor: '#80559A',
  },
  feedbackButtonText: {
    fontSize: 16,
    color: 'white',
  },
});

export default Sidebar;

