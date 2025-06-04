import { StyleSheet, Text, View, Dimensions } from 'react-native';
import React from 'react';
import { useFetchProfileDetail } from '../../hooks/profileData';
import { Image } from 'react-native';
import { TouchableOpacity } from 'react-native';
import { Colors } from '../../theme/color';
import { useNavigation } from '@react-navigation/native';

// Define screen dimensions and check if it's a small screen
const { width, height } = Dimensions.get('window');
const isSmallScreen = width < 375;

const Shortlisted = ({ job }) => {
  const user_id = +job.applicant_user_id;
  const { profileDetail, isLoading, isError, refetch } = useFetchProfileDetail(user_id);
  const navigation = useNavigation();

  return (
    <View style={styles.cardContainer}>
      {/* Header Section */}
      <View style={styles.cardHeaderSection}>
        <View style={styles.cardHeader}>
          <Image
            style={styles.seekerImage}
            source={
              profileDetail?.docs?.pp_url
                ? { uri: profileDetail?.docs?.pp_url }
                : require('../../../assets/image/profileIcon.png')
            }
          />
          <View>
            <Text style={styles.seekerName}>
              {profileDetail?.introduction?.full_name || 'Applicant'}
            </Text>
            <Text style={styles.seekerDate}>{job?.job_title || 'Job Applicant'}</Text>
          </View>
        </View>
        <Image style={styles.cardImage} source={require('../../../assets/image/meesageIcon.png')} />
      </View>

      <View style={styles.divider} />

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={styles.viewButton}
          onPress={() => {
            navigation.navigate('VisitorProfile', { profileDetail });
          }}
        >
          <Text style={styles.viewButtonText}>View Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.resumeButton}
          onPress={() => {
            navigation.navigate('Interview', { profileDetail, job });
          }}
        >
          <Text style={styles.buttonText}>Schedule Interview</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Shortlisted;

const styles = StyleSheet.create({
  area: {
    flex: 1,
  },
  mainContainer: {
    paddingBottom: 50,
    flex: 1,
    width: '100%',
    backgroundColor: 'white',
    padding: 10,
  },
  header: {
    width: 250,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  iconContainer: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameText: {
    marginTop: 5,
    fontSize: isSmallScreen ? 18 : 20,
    fontFamily: 'Poppins-SemiBold',
  },
  cardContainer: {
    marginBottom: 50,
    marginVertical: isSmallScreen ? 5 : 10,
    width: '100%',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 8,
    padding: isSmallScreen ? 10 : 15,
  },
  cardHeaderSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seekerImage: {
    width: isSmallScreen ? 40 : 50,
    height: isSmallScreen ? 40 : 50,
    marginRight: 10,
    borderRadius: isSmallScreen ? 20 : 25,
  },
  seekerName: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: isSmallScreen ? 14 : 20,
    color: '#333',
  },
  seekerDate: {
    fontFamily: 'Poppins-Regular',
    color: '#94A3B8',
    fontSize: isSmallScreen ? 8 : 11,
  },
  cardImage: {
    width: isSmallScreen ? 30 : 40,
    height: isSmallScreen ? 30 : 40,
  },
  divider: {
    borderTopColor: '#F0F0F0',
    borderTopWidth: 1,
    marginVertical: 15,
  },
  dropdownContainer: {
    marginTop: 10,
    marginBottom: 20,
    zIndex: 1000,
  },
  dropdownLabel: {
    fontFamily: 'Poppins-Regular',
    fontSize: isSmallScreen ? 12 : 14,
    color: 'black',
    marginBottom: 5,
  },
  dropdown: {
    height: isSmallScreen ? 40 : 50,
    width: '100%',
    borderColor: Colors.primary,
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
  },
  picker: {
    backgroundColor: 'white',
    borderColor: '#E8E8E8',
    borderRadius: 8,
  },
  dropDownContainer: {
    borderColor: Colors.primary,
    backgroundColor: '#F9FFFE',
    zIndex: 1000,
  },
  actionContainer: {
    flexDirection: 'column',
    gap: 10,
    marginVertical: 10,
  },
  resumeButton: {
    backgroundColor: '#14B6AA',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
  },
  buttonText: {
    fontFamily: 'Poppins-SemiBold',
    color: 'white',
    fontSize: isSmallScreen ? 14 : 16,
    textAlign: 'center',
  },
  scheduleContainer: {
    marginTop: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  dateTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: isSmallScreen ? 10 : 15,
    marginBottom: isSmallScreen ? 15 : 20,
  },
  dateTimeBox: {
    flex: 1,
  },
  timeButton: {
    flexDirection: 'row',
    height: isSmallScreen ? 40 : 50,
    borderWidth: 1,
    borderRadius: 8,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: isSmallScreen ? 8 : 10,
  },
  timeText: {
    fontSize: isSmallScreen ? 14 : 16,
    color: '#333',
    fontFamily: 'Poppins-Regular',
  },
  modeContainer: {
    marginTop: 10,
    zIndex: 1000,
  },
  messageContainer: {
    marginTop: 30,
  },
  textArea: {
    height: isSmallScreen ? 80 : 100,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 8,
    padding: isSmallScreen ? 8 : 10,
    textAlignVertical: 'top',
    backgroundColor: 'white',
    fontFamily: 'Poppins-Regular',
    fontSize: isSmallScreen ? 12 : 14,
    color: '#333',
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: isSmallScreen ? 12 : 14,
    borderRadius: 8,
    alignItems: 'center',
    width: '80%',
  },
  submitContainer: {
    position: 'absolute',
    bottom: 5,
    left: 0,
    right: 0,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewButton: {
    backgroundColor: 'ffff',
    borderWidth: 1,
    borderColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
  },
  viewButtonText: {
    fontFamily: 'Poppins-Regular',
    color: Colors.primary,
    fontSize: isSmallScreen ? 14 : 16,
    textAlign: 'center',
  },
});
