import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import React from 'react';

const ProfileImageFallback = ({ fullname, size, fontSize, press }) => {
  return (
    <TouchableOpacity
      onPress={press}
      style={[styles.profileImageContainer, { width: size, height: size }]}
    >
      <Text style={[styles.profileImageText, { fontSize: fontSize }]}>
        {fullname
          ?.split(' ')
          .filter((word) => word.length > 0)
          .slice(0, 2)
          .map((word) => word.charAt(0).toUpperCase())
          .join('')}
      </Text>
    </TouchableOpacity>
  );
};

export default ProfileImageFallback;

const styles = StyleSheet.create({
  profileImageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#80559A',
    borderWidth: 4,
    borderColor: 'white',

    borderRadius: 50,
    marginRight: 15,
  },
  profileImageText: {
    color: 'white',
  },
});
