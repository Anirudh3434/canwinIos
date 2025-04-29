import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const JobSeekerCard = ({ seeker, onSeeResume, onSeeDetails }) => {
  const { width } = useWindowDimensions(); // ✅ Use dynamic width

  if (!seeker) {
    return <Text style={styles.noData}>No data available</Text>;
  }

  return (
    <View style={[styles.cardContainer, { width: width - 40 }]}>
      {/* Header Section */}
      <View style={styles.cardHeaderSection}>
        <View style={styles.cardHeader}>
          <Image style={styles.seekerImage} source={require('../../../assets/image/a16.png')} />
          <View>
            <Text style={styles.seekerName}>{seeker.name}</Text>
            <Text style={styles.seekerDate}>Applied on: {seeker.date}</Text>
          </View>
        </View>
        <Image style={styles.cardImage} source={require('../../../assets/image/meesageIcon.png')} />
      </View>

      <View style={styles.divider} />

      {/* Seeker Details */}
      <View style={styles.detailsContainer}>
        {[
          seeker.location || 'No location',
          seeker.role || 'No role specified',
          `Applied ${seeker.date ? seeker.date : 'N/A'}`,
        ].map((item, index) => (
          <View key={index} style={styles.detailItem}>
            <View style={styles.dot} />
            <Text style={styles.detailText}>{item}</Text>
          </View>
        ))}
      </View>

      {/* Skills Section */}
      {seeker.skills && seeker.skills.length > 0 ? (
        <View style={styles.skillsContainer}>
          {seeker.skills.map((skill, index) => (
            <View key={index} style={styles.skillBadge}>
              <Ionicons name="checkmark" size={12} color="black" />
              <Text style={styles.skillText}>{skill}</Text>
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.noSkills}>No skills provided</Text>
      )}

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <TouchableOpacity style={styles.resumeButton} onPress={onSeeResume}>
          <Text style={styles.buttonText}>See Resume</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.detailsButton} onPress={onSeeDetails}>
          <Text style={styles.buttonTextSecondary}>See Details</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 8,
    padding: 15,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
    marginRight: 10,
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
    width: 50,
    height: 50,
    marginRight: 10,
    borderRadius: 25,
  },
  seekerName: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: '#333',
  },
  seekerDate: {
    fontFamily: 'Poppins-Regular',
    color: '#94A3B8',
    fontSize: 12,
  },
  cardImage: {
    width: 40,
    height: 40,
  },
  divider: {
    borderTopColor: '#F0F0F0',
    borderTopWidth: 1,
    marginVertical: 15,
  },
  detailsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
    marginBottom: 15,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#80559A',
    marginRight: 5,
  },
  detailText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#555',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 15,
  },
  skillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DFFAF6',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    gap: 5,
  },
  skillText: {
    fontFamily: 'Poppins-Regular',
    color: 'black',
    fontSize: 12,
  },
  noSkills: {
    fontFamily: 'Poppins-Italic',
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 15,
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  resumeButton: {
    backgroundColor: '#14B6AA',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    width: '48%',
  },
  detailsButton: {
    backgroundColor: '#F9FFFE',
    borderWidth: 1,
    borderColor: '#14B6AA',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    width: '48%',
  },
  buttonText: {
    fontFamily: 'Poppins-SemiBold',
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
  },
  buttonTextSecondary: {
    fontFamily: 'Poppins-SemiBold',
    color: '#14B6AA',
    fontSize: 14,
    textAlign: 'center',
  },
  noData: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    marginVertical: 10,
  },
});

export default JobSeekerCard;
