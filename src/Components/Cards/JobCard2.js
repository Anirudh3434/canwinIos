import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const JobCard2 = ({
  companyLogoStyle,
  jobTitle,
  companyName,
  location,
  timeAgo,
  rating,
  onPress,
}) => {
  return (
    <TouchableOpacity style={styles.jobCard} onPress={onPress}>
      <View style={companyLogoStyle} />

      <View style={styles.titleContainer}>
        <Text style={styles.jobTitle}>{jobTitle}</Text>
        {rating && (
          <View style={styles.ratingRow}>
            <FontAwesome name="star" size={14} color="gold" />
            <Text style={styles.ratingText}>{rating}</Text>
          </View>
        )}
      </View>

      <Text style={styles.companyName}>{companyName}</Text>

      <View style={styles.locationRow}>
        <Ionicons name="location-outline" size={14} color="#666" />
        <Text style={styles.locationText}>{location}</Text>
      </View>

      <Text style={styles.timeAgo}>{timeAgo}</Text>
    </TouchableOpacity>
  );
};

export default JobCard2;

const styles = StyleSheet.create({
  jobCard: {
    width: 280,
    borderColor: '#E9E9E9',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  jobTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 2,
  },
  companyName: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#666',
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  locationText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Poppins-Regular',
    marginLeft: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  timeAgo: {
    fontSize: 12,
    color: '#999',
  },
});
