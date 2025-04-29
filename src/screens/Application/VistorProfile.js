import React from 'react';
import { StyleSheet, Text, View, Image, ScrollView, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Colors } from '../../theme/color';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

const VisitorProfile = () => {
  const navigation = useNavigation();

  return (
    <View style={[styles.container, { backgroundColor: 'white', paddingBottom: 30 }]}>
      <LinearGradient
        colors={['#14B6AA', '#61709F', '#80559A']}
        start={{ x: 0, y: 1.5 }}
        end={{ x: 1, y: 0 }}
        style={styles.headerBackground}
      >
        <Ionicons name="arrow-back" size={24} color="white" style={styles.backIcon} />
        <View style={styles.profileHeaderContent}>
          <Image source={require('../../../assets/image/a4.png')} style={styles.profileImage} />
        </View>
      </LinearGradient>

      <View style={styles.profileInfoContainer}>
        <View style={styles.profileInfo}>
          <Text style={styles.name}>Henry</Text>
          <Text style={styles.role}>UI/UX Designer</Text>
        </View>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('ManageApplication');
          }}
          style={styles.manageApplication}
        >
          <Text style={styles.manageApplicationText}>Manage Application</Text>
        </TouchableOpacity>
      </View>

      <ScrollView>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Details</Text>
          <View style={styles.sectionItemContainer}>
            <Text style={styles.sectionItemLabel}>Location</Text>
            <Text style={styles.sectionItemValue}>Chandigarh</Text>
          </View>
          <View style={styles.sectionItemContainer}>
            <Text style={styles.sectionItemLabel}>Experience</Text>
            <Text style={styles.sectionItemValue}>2 years</Text>
          </View>
          <View style={styles.sectionItemContainer}>
            <Text style={styles.sectionItemLabel}>Current Company</Text>
            <Text style={styles.sectionItemValue}>Canwinn</Text>
          </View>
          <View style={styles.sectionItemContainer}>
            <Text style={styles.sectionItemLabel}>Expected Salary</Text>
            <Text style={styles.sectionItemValue}>250,000</Text>
          </View>
          <View style={[styles.sectionItemContainer, { borderBottomWidth: 0 }]}>
            <Text style={styles.sectionItemLabel}>Availability</Text>
            <Text style={styles.sectionItemValue}>Open to work</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Short Bio</Text>
          <Text style={styles.bioText}>
            UI/UX Designer with 2 years of experience in creating user-centered designs. Skilled in
            Figma, Canva, Corel draw, Adobe Photoshop, and Adobe Illustrator.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skills</Text>
          <View style={styles.skillsContainer}>
            {['Figma', 'Canva', 'Corel draw', 'Adobe Photoshop', 'Adobe Illustrator'].map(
              (skill, index) => (
                <View key={index} style={styles.skillPill}>
                  <Text style={styles.skillText}>{skill}</Text>
                </View>
              )
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Work Experience</Text>
          <View style={styles.jobEntry}>
            <View style={styles.jobTitleContainer}>
              <Text style={styles.companyName}>PixelCraft Studio</Text>
              <Text style={styles.jobPeriod}>2021 - Present</Text>
            </View>
            <Text style={styles.jobDescription}>
              • Designed and launched 15+ mobile & web applications improved user engagement by 30%
              through intuitive UI improvements.
            </Text>
          </View>
          <View style={styles.jobEntry}>
            <View style={styles.jobTitleContainer}>
              <Text style={styles.companyName}>BrightWeb Solutions</Text>
              <Text style={styles.jobPeriod}>2019 - 2021</Text>
            </View>
            <Text style={styles.jobDescription}>
              • Assisted in developing design components for client projects • Conducted usability
              testing and implemented feedback
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Education</Text>
          <Text style={styles.educationText}>
            • BFA in Graphic Design - University of California, Berkeley (2019)
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Portfolio</Text>
          <View style={styles.sectionItemContainer}>
            <Text style={styles.sectionItemLabel}>Portfolio</Text>
            <Text style={styles.sectionItemValue}>www.canwinn.com</Text>
          </View>
          <View style={styles.sectionItemContainer}>
            <Text style={styles.sectionItemLabel}>Email</Text>
            <Text style={styles.sectionItemValue}>henry@canwinn.com</Text>
          </View>
          <View style={[styles.sectionItemContainer, { borderBottomWidth: 0 }]}>
            <Text style={styles.sectionItemLabel}>Phone</Text>
            <Text style={styles.sectionItemValue}>+1 234 567 890</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  headerBackground: {
    position: 'relative',
    width: '90%',
    height: 120,
    paddingBottom: 20,
    borderRadius: 30,
    marginTop: 10,
    marginBottom: 40,
    alignSelf: 'center',
  },
  backIcon: {
    position: 'absolute',
    top: 20,
    left: 20,
  },
  profileHeaderContent: {
    alignItems: 'center',
    paddingTop: 40,
  },
  profileImage: {
    position: 'absolute',
    top: 70,
    left: 20,
    width: 74,
    height: 74,
    borderRadius: 50,
  },
  profileInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  profileInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#333',
  },
  role: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#666',
  },
  manageApplication: {
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  manageApplicationText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    color: Colors.primary,
  },
  section: {
    backgroundColor: 'white',
    padding: 20,
    marginVertical: 10,
    marginHorizontal: 15,
    borderRadius: 10,
    borderColor: '#E6E6E6',
    borderWidth: 1,
  },
  sectionTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  sectionItemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  sectionItemLabel: {
    fontSize: 12,
    color: '#667085',
    fontFamily: 'Poppins-Medium',
  },
  sectionItemValue: {
    fontSize: 12,
    color: 'black',
    fontFamily: 'Poppins-Regular',
    textAlign: 'left',
  },
  bioText: {
    fontSize: 12,
    color: 'black',
    lineHeight: 22,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  skillPill: {
    borderWidth: 1,
    borderColor: '#DFDFDF',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  skillText: {
    color: '#667085',
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
  },
  jobEntry: {
    marginBottom: 15,
    paddingBottom: 15,
  },
  jobTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  companyName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'Poppins-Regular',
  },
  jobPeriod: {
    color: '#888',
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
  },
  jobDescription: {
    color: '#666',
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    lineHeight: 20,
  },
  educationText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Poppins-Regular',
  },
});

export default VisitorProfile;
