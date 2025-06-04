import React, { useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, BackHandler } from 'react-native';
// Import vector icons from react-native-vector-icons instead of Expo
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Colors } from '../../../theme/color';
import JobCard from '../../../Components/Cards/JobCard2'; // Import the JobCard component
import { FlatList } from 'react-native';
import Speedometer from 'react-native-speedometer-chart';
import LineChart from 'react-native-gifted-charts';
import { useNavigation } from '@react-navigation/native';

const ProfilePerformance = () => {
  const navigation = useNavigation();

  const EarlyAccessRole = [
    {
      jobTitle: 'Database Engineer',
      companyName: 'Trumands Software',
      location: 'London, United Kingdom',
      timeAgo: '1d ago',
    },
    {
      jobTitle: 'Software Engineer',
      companyName: 'Google',
      location: 'Mountain View, California, USA',
      timeAgo: '1d ago',
    },
    {
      jobTitle: 'Data Scientist',
      companyName: 'Microsoft',
      location: 'Redmond, Washington, USA',
      timeAgo: '1d ago',
    },
    {
      jobTitle: 'Software Engineer',
      companyName: 'Amazon',
      location: 'Seattle, Washington, USA',
      timeAgo: '1d ago',
    },
  ];

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
    <ScrollView style={styles.container}>
      {/* Header with back button and save */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('MyTabs')} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {/* Profile Performance Title */}
      <Text style={styles.title}>Profile Performance</Text>
      <Text style={styles.subtitle}>How your profile is performing among recruiters</Text>

      {/* Discovery Score Meter */}
      <View style={styles.meterContainer}>
        <Speedometer internalColor={Colors.primary} value={50} size={60} totalValue={100} />
        <View style={styles.meterTextContainer}>
          <Text style={styles.meterTitle}>Maintain your high discovery score</Text>
          <Text style={styles.meterTip}>Follow these tips</Text>
        </View>

        <TouchableOpacity>
          <Ionicons name="chevron-down" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Search Appearances */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>You appeared in recruiter searches</Text>

        <View style={styles.searchContainer}>
          <View style={styles.statRow}>
            <Text style={styles.statNumber}>54 Search appearances in 90 days</Text>
            <TouchableOpacity>
              <Ionicons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
          </View>
          <Text style={styles.statPositive}>50% more actions since last week</Text>
        </View>
      </View>

      {/* Early Access Roles */}
      <View style={styles.sectionContainer}>
        <View style={styles.rowBetween}>
          <View>
            <Text style={styles.sectionTitle}>Early access roles</Text>
            <Text style={styles.sectionSubtitle}>Fresh roles recruiter searches</Text>
          </View>
          <TouchableOpacity>
            <Text style={styles.viewAllLink}>View All</Text>
          </TouchableOpacity>
        </View>

        {/* Job Cards */}
        <View style={styles.jobCardsContainer}>
          {/* Job Card 1 */}
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={EarlyAccessRole}
            renderItem={({ item }) => (
              <JobCard
                companyLogoStyle={styles.companyLogo1}
                jobTitle={item.jobTitle}
                companyName={item.companyName}
                location={item.location}
                timeAgo={item.timeAgo}
                rating={item.rating}
                onPress={() => console.log('Job card 1 pressed')}
              />
            )}
            keyExtractor={(item, index) => `job-card-${index}`}
          />
        </View>
      </View>

      {/* Recruiter Action */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>19 Recruiter action in 90 days</Text>
        <Text style={styles.statNegative}>42% less action since last week</Text>

        {/* Action Buttons */}
        <View style={styles.actionButtonsRow}>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Total actions (19)</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Resume downloaded (2)</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Profile views (5)</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* HR Recruiter */}
      <TouchableOpacity style={styles.hrRecruiterButton}>
        <View style={styles.recruiterContainer}>
          <View>
            <Text style={styles.recruiterTitle}>HR Recruiter</Text>
            <Text style={styles.recruiterCompany}>Connecting the Dots</Text>
          </View>
          <View style={styles.companyLogo1} />
        </View>

        <View style={styles.recruiterActionRow}>
          <MaterialIcons name="file-download" size={15} color={Colors.primary} />
          <Text style={styles.recruiterActionText}>Downloaded resume 6d ago</Text>
        </View>

        <View>
          <Text style={styles.otherActionBadge}>+1 Other Action</Text>
        </View>
      </TouchableOpacity>
      <View
        style={{
          height: 30,
        }}
      />
    </ScrollView>
  );
};

export default ProfilePerformance;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#667085',
    fontFamily: 'Poppins-Regular',
    marginBottom: 20,
  },
  meterContainer: {
    flexDirection: 'row',
    backgroundColor: '#F5F8FF',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  meter: {
    height: 12,
    backgroundColor: '#E0E0E0',
    borderRadius: 6,
    marginBottom: 12,
    position: 'relative',
  },
  meterFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '75%',
    backgroundColor: Colors.primary,
    borderRadius: 6,
  },
  meterIndicator: {
    position: 'absolute',
    left: '75%',
    top: -4,
    width: 20,
    height: 20,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'white',
  },
  meterTextContainer: {
    width: '70%',
    alignItems: 'start',
    marginBottom: 4,
  },
  meterTitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
  },
  meterHigh: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: Colors.primary,
    fontWeight: '600',
    marginRight: 4,
  },
  meterTip: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#666',
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
    fontFamily: 'Poppins-Medium',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#979FB1',
    marginBottom: 4,
    fontFamily: 'Poppins-Regular',
  },
  statRow: {
    backgroundColor: '#F5F8FF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  statNumber: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
  },
  statPositive: {
    fontSize: 12,
    color: Colors.primary,
    fontFamily: 'Poppins-Regular',
  },
  statNegative: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#E53935',
    marginBottom: 16,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  viewAllLink: {
    color: '#0077B5',
    fontWeight: '500',
  },
  jobCardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  companyLogo1: {
    width: 32,
    height: 32,
    backgroundColor: '#0077B5',
    borderRadius: 6,
    marginBottom: 8,
  },
  companyLogo2: {
    width: 32,
    height: 32,
    backgroundColor: '#333',
    borderRadius: 6,
    marginBottom: 8,
  },
  searchContainer: {
    backgroundColor: '#F5F8FF',
    borderRadius: 12,
    padding: 12,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionButton: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  actionButtonText: {
    fontSize: 12,
    color: '#666',
  },
  recruiterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  recruiterTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  recruiterCompany: {
    fontSize: 14,
    color: '#666',
  },
  recruiterActionRow: {
    backgroundColor: '#14B6AA17',
    borderRadius: 12,
    alignSelf: 'flex-start',
    padding: 5,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  recruiterActionText: {
    fontSize: 10,
    color: '#666',
    marginLeft: 8,
  },
  otherActionBadge: {
    fontSize: 10,
    color: '#005EE7',
    fontFamily: 'Poppins-Regular',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  hrRecruiterButton: {
    borderColor: '#E0E0E0',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  meterTip: {
    fontSize: 12,
    color: '#8193B9',
    fontFamily: 'Poppins-Regular',
  },
});
