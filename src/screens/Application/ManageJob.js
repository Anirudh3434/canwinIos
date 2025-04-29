import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  TouchableOpacity,
  BackHandler
} from 'react-native';
import style from '../../theme/style';
import JobCard from '../../Components/Cards/JobCard';
import { AppBar } from '@react-native-material/core';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from '../../theme/color';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';

const ManageJob = () => {

    const navigation = useNavigation();

  const job = [
    {
      id: '1',
      title: 'Full Stack Developer',
      location: 'Mohali, Punjab',
      postedDate: '30 Jan 2025',
      salary: '19',
      status: 'Active',
    },
    {
      id: '2',
      title: 'Flutter Developer',
      location: 'Chandigarh',
      postedDate: '15 Feb 2025',
      salary: '22',
      status: 'Inactive',
    },
    {
      id: '3',
      title: 'Backend Engineer',
      location: 'Remote',
      postedDate: '12 Mar 2025',
      salary: '25',
      status: 'Draft',
    },
  ];



  const [sortVisible, setSortVisible] = useState(false);
  const [statusVisible, setStatusVisible] = useState(false);

  const [selectedSort, setSelectedSort] = useState('');

  const toggleSortMenu = () => {
    setSortVisible(!sortVisible);
    setStatusVisible(false);
  };

  const handleStatusOpen = () => {
    setStatusVisible(true);
    setSortVisible(false);
  };

  const handleStatusSelect = (status) => {
    console.log(status);
    setStatusVisible(false);
  };

  return (
    <View style={style.area}>
      <AppBar
        color={Colors.bg}
        elevation={6}
        style={{ paddingHorizontal: 10, paddingVertical: 10 }}
        leading={
          <View style={styles.headerLeading}>
            <TouchableOpacity onPress={() => navigation.navigate('MyTabs')}>
              <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Manage Job Listing</Text>
          </View>
        }
        trailing={
          <View>
            {/* <TouchableOpacity
              onPress={toggleSortMenu}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}
            >
              <Image
                source={require('../../../assets/image/filter.png')}
                style={styles.headerImage}
              />
              <Text style={styles.headerText}>Sort</Text>
            </TouchableOpacity> */}

            {/* Sort Dropdown */}
            {sortVisible && (
              <View style={styles.dropdown}>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    setSelectedSort('status');
                    setStatusVisible(prev => !prev  );
                  }}
                >
                  <View
                    style={[
                      styles.bullet,
                      {
                        backgroundColor:
                          selectedSort === 'status' ? Colors.primary : 'gray',
                      },
                    ]}
                  />
                  <Text style={styles.menuText}>By Status</Text>
                </TouchableOpacity>
                
                {statusVisible && 
                  ['Active', 'Inactive', 'Draft'].map((status) => (
                    <TouchableOpacity 
                      key={status} 
                      style={styles.menuItem}
                      onPress={() => {handleStatusSelect(status); setSortVisible(false)}}
                    >
                      <Text style={styles.menuText}>{status}</Text>
                    </TouchableOpacity>
                  ))
                }

                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    setSelectedSort('date');
                    console.log('Sort by Date');
                    setSortVisible(false);
                  }}
                >
                  <View
                    style={[
                      styles.bullet,
                      {
                        backgroundColor:
                          selectedSort === 'date' ? Colors.primary : 'gray',
                      },
                    ]}
                  />
                  <Text style={styles.menuText}>By Date</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        }
      />

      <View style={styles.container}>
        <FlatList
          data={job}
          renderItem={({ item }) => <JobCard job={item} />}
          keyExtractor={(item) => item.id}
        />
      </View>
    </View>
  );
};

export default ManageJob;

const styles = StyleSheet.create({
  headerLeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: Colors.primary,
  },
  container: {
    flex: 1,
    padding: 20,
    gap: 10,
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
  },
  headerImage: {
    width: 14,
    height: 14,
    tintColor: Colors.primary,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  menuText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: Colors.darkText || '#000',
  },
  dropdown: {
    position: 'absolute',
    top: 30,
    right: 0,
    width: 150,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    zIndex: 10,
  },
});