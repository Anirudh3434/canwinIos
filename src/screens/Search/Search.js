import {
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  StatusBar,
  Image,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  Platform,
  BackHandler,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { Colors } from '../../theme/color';
import style from '../../theme/style';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { addSearch } from '../../redux/slice/SearchHistorySlice';
import { useDispatch, useSelector } from 'react-redux';

const { width, height } = Dimensions.get('window');

export default function Search() {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');

  const searchHistory = useSelector((state) => state.searchHistory);

  const handleSearch = () => {
    if (!title.trim() && !location.trim()) {
      Alert.alert('Error', 'Enter all fields');
      return;
    }

    dispatch(
      addSearch({
        id: new Date().getTime(),
        search: title,
        location: location,
        date: new Date().toISOString(),
      })
    );
    navigation.navigate('Job List', { title, location });
  };

  const handleRecentSearchClick = (searchItem) => {
    setTitle(searchItem.search);
    setLocation(searchItem.location);
    navigation.navigate('Job List', {
      title: searchItem.search,
      location: searchItem.location,
    });
  };

  const backAction = () => {
    if (navigation.isFocused()) {
      navigation.navigate('MyTabs');
      return true;
    }
  };

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove();
  }, [navigation]);

  return (
    <SafeAreaView style={[style.area, { backgroundColor: Colors.bg }]}>
      <StatusBar backgroundColor={Colors.bg} translucent={false} barStyle={'dark-content'} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : null}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.navigate('MyTabs')}>
              <Icon name="arrow-back" size={24} />
            </TouchableOpacity>
          </View>

          <View style={styles.titleContainer}>
            <Text style={styles.title}>Search jobs and internships</Text>
          </View>

          <View style={styles.inputSection}>
            <Text style={styles.labelText}>Enter skills, designation, companies</Text>
            <TextInput
              placeholder="Enter skills"
              placeholderTextColor={Colors.disable2}
              selectionColor={Colors.primary}
              value={title}
              onChangeText={setTitle}
              style={styles.input}
            />
          </View>

          <View style={styles.inputSection}>
            <Text style={styles.labelText}>Enter Location</Text>
            <TextInput
              placeholder="Enter Location"
              placeholderTextColor={Colors.disable2}
              selectionColor={Colors.primary}
              value={location}
              onChangeText={setLocation}
              style={styles.input}
            />
          </View>

          <View style={{ alignItems: 'flex-end' }}>
            <TouchableOpacity onPress={handleSearch} style={styles.searchButton}>
              <Text style={styles.searchButtonText}>Search Jobs</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.recentSearchContainer}>
            <Text style={styles.sectionTitle}>Your most recent searches</Text>

            {searchHistory.length > 0 ? (
              <ScrollView horizontal={true} style={styles.recentSearchList}>
                {searchHistory
                  .slice()
                  .reverse()
                  .map((item, index) => (
                    <TouchableOpacity
                      key={item.id || index}
                      style={styles.recentSearchItem}
                      onPress={() => handleRecentSearchClick(item)}
                    >
                      <Icon name="search" size={15} color={Colors.disable2} />
                      <Text style={styles.recentSearchText}>
                        {item.search && item.search + ' ,'} {item.location ? item.location : ' All'}
                      </Text>
                    </TouchableOpacity>
                  ))}
              </ScrollView>
            ) : (
              <View style={styles.recentSearchItem}>
                <Icon name="search" size={15} color={Colors.disable2} />
                <Text style={styles.recentSearchText}>No recent searches</Text>
              </View>
            )}
          </View>

          {/* <View style={styles.companyContainer}>
            <Text style={styles.sectionTitle}>Top companies</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {[...Array(3)].map((_, index) => (
                <View key={index} style={styles.companyCard}>
                  <Image
                    source={require('../../../assets/image/s12.png')}
                    style={styles.companyLogo}
                  />
                  <Text style={styles.companyName}>Bajaj Auto</Text>
                  <View style={styles.ratingContainer}>
                    <Icon name="star" size={16} color="#FFC107" />
                    <Text style={styles.ratingText}>3.9 | 3.4k reviews</Text>
                  </View>
                  <Text style={styles.companyType}>Indian MNC</Text>
                  <TouchableOpacity style={styles.viewJobsButton}>
                    <Text style={styles.viewJobsText}>View Jobs</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View> */}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  titleContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: width < 375 ? 16 : 20,
    fontFamily: 'Poppins-SemiBold',
  },
  inputSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
  },
  ratingText: {
    marginLeft: 5,
  },
  labelText: {
    fontSize: width < 375 ? 12 : 14,
    color: '#848484',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D5D9DF',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: Platform.OS === 'ios' ? 14 : 12,
    fontSize: width < 375 ? 14 : 16,
  },
  searchButton: {
    backgroundColor: Colors.primary,
    width: 120,
    borderRadius: 8,
    paddingVertical: 10,
    marginHorizontal: 15,
    alignItems: 'center',
  },
  searchButtonText: {
    color: 'white',
    fontSize: width < 375 ? 12 : 14,
    fontFamily: 'Poppins-Medium',
  },
  recentSearchContainer: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: width < 375 ? 16 : 18,
    fontWeight: '700',
    marginBottom: 10,
  },
  recentSearchList: {
    maxHeight: 150,
  },
  recentSearchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    padding: 12,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 10,
    marginTop: 10,
    marginLeft: 10,
  },
  recentSearchText: {
    marginLeft: 10,
    fontSize: width < 375 ? 12 : 14,
  },
  companyContainer: {
    marginHorizontal: 20,
    marginTop: 30,
  },
  companyCard: {
    alignItems: 'center',
    width: width * 0.4,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E9E9E9',
    borderRadius: 10,
    padding: 15,
    backgroundColor: 'white',
  },
  companyLogo: {
    width: '100%',
    height: 50,
    resizeMode: 'contain',
  },
  companyName: {
    fontSize: width < 375 ? 14 : 16,
    fontWeight: '600',
    marginTop: 10,
  },
  viewJobsButton: {
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  viewJobsText: {
    color: '#4E65FC',
    fontSize: 12,
    fontWeight: '600',
  },
  companyType: {
    color: '#FFC62F',
    fontSize: 12,
    backgroundColor: '#FFF0C7',
    alignSelf: 'center',
    padding: 4,
    borderRadius: 5,
  },
});
