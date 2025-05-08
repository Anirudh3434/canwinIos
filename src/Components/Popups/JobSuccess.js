import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { styles } from '../../screens/Search/JobList';

const JobSuccess = ({ setSuccessPop }) => {
  return (
    <View style={styles.modalOverlay}>
      <View style={styles.modalContainer}>
        <Image source={require('../../../assets/image/success1.png')} style={styles.modalImage} />
        <Text style={styles.modalTitle}>Apply Success</Text>
        <Text style={styles.modalMessage}>
          Your job application has been submitted successfully.
        </Text>
        <TouchableOpacity style={styles.closeButton} onPress={() => setSuccessPop(false)}>
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default JobSuccess;
