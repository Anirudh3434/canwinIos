import React, { useEffect, useState, useCallback, memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  FlatList,
  Dimensions,
  ActivityIndicator,
  Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { toggleSidebar } from '../redux/slice/sideBarSlice';
import { API_ENDPOINTS } from '../api/apiConfig';
import ProfileImageFallback from './profileImageFallback';
import axios from 'axios';

// Navigation items based on role
const getNavItems = (roleId) => {
  if (roleId === '1') {
    return [
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
        type: 'recommended',
      },
      { id: 3, name: 'Saved jobs', icon: require('../../assets/image/saveJob.png'), route: 'SaveJob' },
      {
        id: 4,
        name: 'Settings',
        icon: require('../../assets/image/setting.png'),
        route: 'setting',
      },
      { id: 5, name: 'About Us', icon: require('../../assets/image/AboutUs.png'), route: '' },
      {
        id: 6,
        name: 'Write to us',
        icon: require('../../assets/image/writeToUs.png'),
        route: '',
      },
    ];
  } else {
    return [
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
      {
        id: 4,
        name: 'Settings',
        icon: require('../../assets/image/setting.png'),
        route: 'setting',
      },
    ];
  }
};

// Skeleton loading component
const SkeletonLoading = () => {
  // Create placeholder items for navigation menu
  const placeholderItems = Array(5).fill(0).map((_, index) => ({ id: index }));
  
  return (
    <View style={styles.container}>
      <View style={[styles.sidebar, Platform.OS === 'ios' && styles.sidebarIOS]}>
        {/* Skeleton Profile Section */}
        <View style={styles.profileSection}>
          <View style={[styles.profileImage, styles.skeleton]} />
          <View style={styles.profileDetails}>
            <View>
              <View style={[styles.skeletonText, { width: 120, height: 20 }]} />
              <View style={[styles.skeletonText, { width: 100, height: 16, marginTop: 5 }]} />
            </View>
            <View style={[styles.arrowIcon, styles.skeleton]} />
          </View>
        </View>
        
        <View style={styles.divider} />
        
        {/* Skeleton Navigation Items */}
        <View style={styles.navList}>
          {placeholderItems.map(item => (
            <View key={item.id} style={styles.item}>
              <View style={[styles.itemIcon, styles.skeleton]} />
              <View style={[styles.skeletonText, { width: 150, height: 16 }]} />
            </View>
          ))}
        </View>
        
        {/* Skeleton Logout Button */}
        <View style={styles.logoutContainer}>
          <View style={[styles.logoutButton, styles.skeleton]} />
        </View>
        
        <View style={styles.divider} />
      </View>
    </View>
  );
};

// Memoized NavItem component for better performance
const NavItem = memo(({ item, onItemPress }) => (
  <TouchableOpacity style={styles.item} onPress={() => onItemPress(item.route, item.type)}>
    <Image source={item.icon} style={styles.itemIcon} />
    <Text style={styles.itemText}>{item.name}</Text>
  </TouchableOpacity>
));

// Memoized Profile component
const ProfileSection = memo(({ name, companyName, roleId, profileUrl, onClose }) => (
  <View style={styles.profileSection}>
    {profileUrl ? (
      <Image
        source={{ uri: profileUrl }}
        style={styles.profileImage}
      />
    ) : (
      <ProfileImageFallback fullname={name} size={45} fontSize={20} />
    )}
    <View style={styles.profileDetails}>
      <View>
        <Text style={styles.profileName}>{name}</Text>
        {roleId === '2' && companyName && (
          <Text style={styles.companyName}>{companyName}</Text>
        )}
      </View>
      <TouchableOpacity onPress={onClose}>
        <Image
          source={require('../../assets/image/arrow-right.png')}
          style={styles.arrowIcon}
        />
      </TouchableOpacity>
    </View>
  </View>
));

const Sidebar = () => {
  const navigation = useNavigation();
  const [userData, setUserData] = useState({
    name: '',
    roleId: null,
    companyName: '',
    profileUrl: null
  });
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useDispatch();

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        const storedUserId = await AsyncStorage.getItem('userId');
        if (!storedUserId) {
          setIsLoading(false);
          return;
        }

        const [introResponse, docsResponse, stepResponse] = await Promise.all([
          axios.get(`${API_ENDPOINTS.INTRODUCTION}?user_id=${storedUserId}`),
          axios.get(`${API_ENDPOINTS.DOCS}?user_id=${storedUserId}`),
          axios.get(`${API_ENDPOINTS.STEP}?user_id=${storedUserId}`)
        ]);

        const roleId = stepResponse.data.data.role_id.toString();

        if(roleId) {
          await AsyncStorage.setItem('roleId', roleId);
        }
        const docs = docsResponse.data.data;
        const name = introResponse.data.data.full_name;
        
        const newUserData = {
          name,
          roleId,
          profileUrl: docs ? (roleId === '1' ? docs.pp_url : docs.comp_url) : null
        };

        // Only fetch company details if roleId is 2
        if (roleId === '2') {
          try {
            const companyResponse = await axios.get(
              `${API_ENDPOINTS.COMPANY_DETAILS}?user_id=${storedUserId}`
            );
            if (companyResponse.data.data) {
              newUserData.companyName = companyResponse.data.data.company_name;
            }
          } catch (companyError) {
            console.error('Error fetching company data:', companyError);
          }
        }

        setUserData(newUserData);
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserData();
  }, []);

  const navItems = getNavItems(userData.roleId);

  // Memoized handlers for better performance
  const handleNavigation = useCallback((route, type) => {
    if (!route) return;
    navigation.navigate(route, { type });
    dispatch(toggleSidebar());
  }, [navigation, dispatch]);

  const handleLogout = useCallback(async () => {
    try {
      await AsyncStorage.multiRemove(['userId', 'lastTab']);
      dispatch(toggleSidebar());
      navigation.navigate('Login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }, [dispatch, navigation]);

  const handleCloseMenu = useCallback(() => {
    dispatch(toggleSidebar());
  }, [dispatch]);

  // Memoized render item for FlatList
  const renderItem = useCallback(({ item }) => (
    <NavItem item={item} onItemPress={handleNavigation} />
  ), [handleNavigation]);

  // Show skeleton loading until roleId is available
  if (isLoading || userData.roleId === null) {
    return <SkeletonLoading />;
  }

  return (
    <View style={styles.container}>
      <View style={[styles.sidebar, Platform.OS === 'ios' && styles.sidebarIOS]}>
        <ProfileSection 
          name={userData.name}
          companyName={userData.companyName}
          roleId={userData.roleId}
          profileUrl={userData.profileUrl}
          onClose={handleCloseMenu}
        />
        
        <View style={styles.divider} />
        
        <FlatList
          data={navItems}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          style={styles.navList}
          initialNumToRender={8}
          maxToRenderPerBatch={10}
          windowSize={5}
        />
        
        <View style={styles.logoutContainer}>
          <TouchableOpacity
            onPress={handleLogout}
            style={styles.logoutButton}
          >
            <Text style={styles.logoutButtonText}>Log Out</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.divider} />
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
    marginRight: 5,
  },
  sidebar: {
    width: '100%',
    height: height - 10,
    backgroundColor: '#FFFFFF',
  },
  sidebarIOS: {
    paddingTop: 40, // Safe area padding for iOS
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    gap: 10,
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
    objectFit: 'contain',
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
  // Skeleton styles
  skeleton: {
    backgroundColor: '#E1E9EE',
    borderRadius: 4,
    overflow: 'hidden',
  },
  skeletonText: {
    height: 16,
    borderRadius: 4,
    backgroundColor: '#E1E9EE',
  },
  skeletonPulse: {
    backgroundColor: '#F2F8FC',
    position: 'absolute',
    height: '100%',
    width: '100%',
    opacity: 0,
  }
});

export default memo(Sidebar);