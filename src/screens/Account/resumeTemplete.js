import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Linking,
  TouchableOpacity,
  PermissionsAndroid,
  Alert,
  Platform,
  NativeModules,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import RNFetchBlob from 'react-native-blob-util';
import { useSelector } from 'react-redux';

const { PermissionFileModule } = NativeModules;

const ResumeTemplate = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const resumeRef = useRef(null);

  // Extract data from route params
  const {
    personalData = {},
    educationData = [],
    employmentData = [],
    projectData = [],
    skillData = [],
  } = route.params || {};

  const socialLinks = useSelector((state) => state.socialLink);

  console.log(socialLinks);

  // Format data for the resume
  const resumeData = {
    name: personalData.fullName || '',
    location: (personalData.city || '') + ' , ' + (personalData.state || ''),
    contact: {
      phone: personalData.phone || '',
      email: personalData.email || '',
      linkedin: socialLinks.linkedin || '',
      github: socialLinks.github || '',
    },
    education: educationData || [],
    certifications: [], // Add this if you have certifications data
    experience: employmentData || [],
    projects: projectData || [],
    skills: skillData || [],
  };

  const requestStoragePermission = async () => {
    if (Platform.OS !== 'android') {
      return true;
    }

    try {
      // First try using our native module if available
      if (PermissionFileModule) {
        const hasPermission = await PermissionFileModule.checkStoragePermission();

        if (!hasPermission) {
          await PermissionFileModule.requestStoragePermission();
          // Check again after request
          return await PermissionFileModule.checkStoragePermission();
        }

        return hasPermission;
      }

      // Fallback to the standard React Native approach
      const androidVersion = Platform.Version;

      if (androidVersion >= 33) {
        // For Android 13+ (API 33+)
        const permissions = [
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO,
        ];

        const statuses = await PermissionsAndroid.requestMultiple(permissions);

        return (
          statuses[PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          statuses[PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          statuses[PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO] ===
            PermissionsAndroid.RESULTS.GRANTED
        );
      } else {
        // For Android 12 and below
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission Required',
            message: 'This app needs access to your storage to download the PDF',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );

        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
    } catch (err) {
      console.warn('Permission request error:', err);
      return false;
    }
  };

  const handleContactPress = (type, value) => {
    switch (type) {
      case 'phone':
        Linking.openURL(`tel:${value}`);
        break;
      case 'email':
        Linking.openURL(`mailto:${value}`);
        break;
      case 'linkedin':
      case 'github':
        Linking.openURL(`https://${value}`);
        break;
      default:
        break;
    }
  };

  // Function to generate HTML content for PDF
  const generateHTML = () => {
    const educationHTML = resumeData.education
      .map(
        (edu) => `
    <div style="margin-bottom: 10px;">
      <div style="display: flex; justify-content: space-between;">
        <div style="font-weight: bold; font-size: 14px;">${
          edu.instituteName || edu.institute_name || ''
        }</div>
        <div style="font-size: 12px; color: #555;">${
          edu?.education === 'X' || edu?.education === 'XII'
            ? edu?.yearOfCompletion || edu?.year_of_completion || ''
            : (edu?.startYear || '') +
              ' - ' +
              (edu?.yearOfCompletion || edu?.year_of_completion || '')
        }</div>
      </div>
      <div style="font-size: 13px;">${
        edu?.education === 'X' || edu?.education === 'XII'
          ? edu?.education || ''
          : (edu?.course || edu?.course_name || '') +
            ' in ' +
            (edu?.specialization || edu?.specialization_name || '')
      }</div>
      <div style="font-size: 12px; color: #555;">Marks: ${edu.marks || ''}</div>
    </div>
  `
      )
      .join('');

    const certificationsHTML =
      resumeData.certifications.length > 0
        ? `
    <div style="margin-top: 20px;">
      <h3 style="font-size: 16px; margin-bottom: 5px;">Certifications</h3>
      <div style="height: 1px; background-color: #ddd; margin-bottom: 12px;"></div>
      <div style="display: flex; flex-wrap: wrap;">
        ${resumeData.certifications
          .map(
            (cert) => `
          <div style="display: flex; align-items: center; width: 50%; margin-bottom: 8px;">
            <div style="width: 5px; height: 5px; border-radius: 2.5px; background-color: #555; margin-right: 8px;"></div>
            <div style="font-size: 12px;">${cert}</div>
          </div>
        `
          )
          .join('')}
      </div>
    </div>
  `
        : '';

    const experienceHTML = resumeData.experience
      .map(
        (exp) => `
    <div style="margin-bottom: 18px;">
      <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
        <div>
          <div style="font-size: 14px; font-weight: bold;">${
            exp.CompanyName || exp.curr_company_name || ''
          }</div>
          <div style="font-size: 13px;">${exp.CurrentJobTitle || exp.curr_job_title || ''}</div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 12px; color: #555;">${
            exp.JoiningDate || exp.joining_date || ''
          } - ${
          exp.isCurrent === 'Yes' ? 'Present' : exp.LeavingDate || exp.leaving_date || 'NA'
        }</div>
          <div style="font-size: 12px; color: #555;">${exp.location || ''}</div>
        </div>
      </div>
    </div>
  `
      )
      .join('');

    const projectsHTML = resumeData.projects
      .map(
        (project) => `
    <div style="margin-bottom: 16px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
        <div style="display: flex; align-items: center; flex-wrap: wrap;">
          <div style="font-size: 14px; font-weight: bold; margin-right: 5px;">${
            project.projectTitle || project.project_title || ''
          }</div>
        </div>
        <div style="font-size: 12px; color: #555;">${
          project?.projectStatus === 'In-Progress' || project?.project_status === 'In-Progress'
            ? 'Ongoing'
            : (project.workFrom || project.work_from || '') +
              '-' +
              (project.workTill || project.work_till || '')
        }</div>
      </div>
      <div style="margin-top: 4px;">
        <div style="font-size: 12px; line-height: 20px;">${(
          project.projectDetail ||
          project.project_detail ||
          ''
        ).slice(0, 200)}...</div>
      </div>
    </div>
  `
      )
      .join('');

    const skillsHTML = `
    <div style="margin-top: 5px; display: flex; flex-direction: row;">
      ${resumeData.skills
        .map(
          (skill) => `
        <span style="font-size: 13px; margin-bottom: 6px;">${
          skill.skillName || skill || ''
        } | </span>
      `
        )
        .join('')}
    </div>
  `;

    return `
    <html>
      <head>
        <style>
          body { font-family: 'Helvetica', sans-serif; padding: 20px; }
          .resume-container { max-width: 800px; margin: 0 auto; }
            padding: 20px; }
          .resume-container { max-width: 800px; margin: 0 auto; }
          .header-section { text-align: center; margin-bottom: 20px; }
          .name { font-size: 24px; font-weight: bold; margin-bottom: 5px; }
          .contact-info { display: flex; flex-wrap: wrap; justify-content: center; }
          .contact-item { display: flex; align-items: center; margin: 5px 10px; }
          .section { margin-bottom: 20px; }
          .section-title { font-size: 16px; font-weight: bold; margin-bottom: 5px; }
          .divider { height: 1px; background-color: #ddd; margin-bottom: 12px; }
        </style>
      </head>
      <body>
        <div class="resume-container">
          <div class="header-section">
            <div class="name">${resumeData.name}</div>
            <div style="display: flex; align-items: center; justify-content: center;">
              <span style="font-size: 12px; color: #555;">${resumeData.location}</span>
            </div>
            <div class="contact-info">
              <div class="contact-item">
                <span style="font-size: 12px; color: #555; margin-right: 5px;">📞</span>
                <span style="font-size: 12px; color: #555;">${resumeData.contact.phone}</span>
              </div>
              <div class="contact-item">
                <span style="font-size: 12px; color: #555; margin-right: 5px;">✉️</span>
                <span style="font-size: 12px; color: #555;">${resumeData.contact.email}</span>
              </div>
              <div class="contact-item">
                <span style="font-size: 12px; color: #555; margin-right: 5px;">🔗</span>
                <span style="font-size: 12px; color: #555;">${resumeData.contact.linkedin}</span>
              </div>
              <div class="contact-item">
                <span style="font-size: 12px; color: #555; margin-right: 5px;">💻</span>
                <span style="font-size: 12px; color: #555;">${resumeData.contact.github}</span>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Education</div>
            <div class="divider"></div>
            ${educationHTML}
          </div>

          ${certificationsHTML}

          <div class="section">
            <div class="section-title">Experience</div>
            <div class="divider"></div>
            ${experienceHTML}
          </div>

          <div class="section">
            <div class="section-title">Projects</div>
            <div class="divider"></div>
            ${projectsHTML}
          </div>

          <div class="section">
            <div class="section-title">Technical Skills</div>
            <div class="divider"></div>
            ${skillsHTML}
          </div>
        </div>
      </body>
    </html>
  `;
  };

  // In the downloadPDF function, modify the code to ensure the PDF is properly saved to Downloads
  const downloadPDF = async () => {
    try {
      const hasPermission = await requestStoragePermission();
      if (!hasPermission && Platform.OS === 'android') {
        Alert.alert(
          'Permission Required',
          'Storage permission is needed to save your resume. Please enable it in settings.',
          [{ text: 'Open Settings', onPress: () => Linking.openSettings() }]
        );
        return;
      }

      // Show alert
      Alert.alert('Generating PDF', 'Please wait while your resume is being generated...');

      const fileName = `${resumeData.name.replace(/\s+/g, '_')}_Resume_${Date.now()}.pdf`;

      // Generate PDF
      const options = {
        html: generateHTML(),
        fileName,
        directory: Platform.OS === 'android' ? 'Download' : undefined,
        base64: false,
      };

      const file = await RNHTMLtoPDF.convert(options);

      if (file && file.filePath) {
        let downloadPath = file.filePath;

        if (Platform.OS === 'android') {
          const newPath = `${RNFS.DownloadDirectoryPath}/${fileName}`;
          await RNFS.moveFile(file.filePath, newPath);
          downloadPath = newPath;

          // Make file visible in Downloads
          await RNFetchBlob.fs.scanFile([{ path: newPath, mime: 'application/pdf' }]);
        }

        // ✅ Success Alert with "Go to Download" Message
        Alert.alert('PDF Saved Successfully', 'Go to Downloads to see your resume.', [
          { text: 'OK', style: 'default', onPress: () => navigation.navigate('MyTabs') },
          { text: 'Share', onPress: () => sharePDF(downloadPath) },
        ]);
      } else {
        throw new Error('PDF file path is undefined');
      }
    } catch (error) {
      console.error('PDF Generation Error:', error);
      Alert.alert('Error', 'Failed to generate PDF. Please try again.');
    }
  };

  // Share PDF
  const sharePDF = async (filePath) => {
    try {
      await Share.open({
        url: `file://${filePath}`,
        type: 'application/pdf',
        title: 'Share Resume PDF',
      });
    } catch (error) {
      console.error('Share Error:', error);
      Alert.alert('Share Error', 'Could not share the PDF.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.title}>Resume</Text>
        </View>
        <TouchableOpacity></TouchableOpacity>
      </View>
      <ScrollView style={{ marginBottom: 50 }}>
        <View style={styles.resumeContainer} ref={resumeRef}>
          {/* Header Section */}
          <View style={styles.headerSection}>
            <View style={styles.nameSection}>
              <Text style={styles.name}>{resumeData.name}</Text>
              <View style={styles.locationContainer}>
                <Icon name="map-pin" size={8} color="#555" />
                <Text style={styles.location}>{resumeData.location}</Text>
              </View>
            </View>

            {/* Contact Information */}
            <View style={styles.contactInfo}>
              <View
                style={styles.contactItem}
                onTouchEnd={() => handleContactPress('phone', resumeData.contact.phone)}
              >
                <Icon name="phone" size={8} color="#555" />
                <Text style={styles.contactText}>{resumeData.contact.phone}</Text>
              </View>
              <View
                style={styles.contactItem}
                onTouchEnd={() => handleContactPress('email', resumeData.contact.email)}
              >
                <Icon name="mail" size={8} color="#555" />
                <Text style={styles.contactText}>{resumeData.contact.email}</Text>
              </View>
              <View
                style={styles.contactItem}
                onTouchEnd={() => handleContactPress('linkedin', resumeData.contact.linkedin)}
              >
                <Icon name="linkedin" size={8} color="#555" />
                <Text style={styles.contactText}>{resumeData.contact.linkedin}</Text>
              </View>
              <View
                style={styles.contactItem}
                onTouchEnd={() => handleContactPress('github', resumeData.contact.github)}
              >
                <Icon name="github" size={8} color="#555" />
                <Text style={styles.contactText}>{resumeData.contact.github}</Text>
              </View>
            </View>
          </View>

          {/* Education Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            <View style={styles.divider} />
            {resumeData.education.map((edu, index) => (
              <View key={index} style={styles.educationItem}>
                <View style={styles.educationHeader}>
                  <Text style={styles.institutionName}>
                    {edu.instituteName || edu.institute_name || ''}
                  </Text>
                  <Text style={styles.educationPeriod}>
                    {edu?.education === 'X' || edu?.education === 'XII'
                      ? edu?.yearOfCompletion || edu?.year_of_completion || ''
                      : (edu?.startYear || '') +
                        ' - ' +
                        (edu?.yearOfCompletion || edu?.year_of_completion || '')}
                  </Text>
                </View>
                <Text style={styles.degree}>
                  {edu?.education === 'X' || edu?.education === 'XII'
                    ? edu?.education || ''
                    : (edu?.course || edu?.course_name || '') +
                      ' in ' +
                      (edu?.specialization || edu?.specialization_name || '')}
                </Text>
                <Text style={styles.educationLocation}>{'Marks: ' + (edu.marks || '')}</Text>
              </View>
            ))}
          </View>

          {/* Certifications Section */}
          {resumeData.certifications.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Certifications</Text>
              <View style={styles.divider} />
              <View style={styles.certificationsContainer}>
                {resumeData.certifications.map((cert, index) => (
                  <View key={index} style={styles.certificationItem}>
                    <View style={styles.bullet} />
                    <Text style={styles.certificationText}>{cert}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Experience Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Experience</Text>
            <View style={styles.divider} />
            {resumeData.experience.map((exp, index) => (
              <View key={index} style={styles.experienceItem}>
                <View style={styles.experienceHeader}>
                  <View>
                    <Text style={styles.companyName}>
                      {exp.CompanyName || exp.curr_company_name || ''}
                    </Text>
                    <Text style={styles.jobTitle}>
                      {exp.CurrentJobTitle || exp.curr_job_title || ''}
                    </Text>
                  </View>
                  <View style={styles.periodLocationContainer}>
                    <Text style={styles.periodText}>
                      {exp.JoiningDate || exp.joining_date || ''} -{' '}
                      {exp.isCurrent === 'Yes'
                        ? 'Present'
                        : exp.LeavingDate || exp.leaving_date || 'NA'}
                    </Text>
                    <Text style={styles.locationText}>{exp.location || ''}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* Projects Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Projects</Text>
            <View style={styles.divider} />
            {resumeData.projects.map((project, index) => (
              <View key={index} style={styles.projectItem}>
                <View style={styles.projectHeader}>
                  <View style={styles.projectNameTechContainer}>
                    <Text style={styles.projectName}>
                      {project.projectTitle || project.project_title || ''}
                    </Text>
                  </View>
                  <Text style={styles.projectPeriod}>
                    {project?.projectStatus === 'In-Progress' ||
                    project?.project_status === 'In-Progress'
                      ? 'Ongoing'
                      : (project.workFrom || project.work_from || '') +
                        '-' +
                        (project.workTill || project.work_till || '')}
                  </Text>
                </View>
                <View style={styles.projectDescriptionContainer}>
                  <Text style={styles.descriptionText}>
                    {(project.projectDetail || project.project_detail || '').slice(0, 200)}...
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* Technical Skills Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Technical Skills</Text>
            <View style={styles.divider} />
            <View style={styles.skillsContainer}>
              {resumeData.skills.map((skill, index) => (
                <Text key={index} style={[styles.skillItem]}>
                  {(skill.skillName || skill || '') + ' | '}
                </Text>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
      <View
        style={{
          position: 'absolute',
          width: '100%',
          zIndex: 10000,
          bottom: 10,
          display: 'flex',
          paddingHorizontal: 20,
          flexDirection: 'row',
          justifyContent: 'center',
          gap: 10,
        }}
      >
        <TouchableOpacity
          onPress={downloadPDF}
          style={{
            backgroundColor: '#14B6AA',
            width: '80%',
            padding: 20,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 10,
          }}
        >
          <Text style={{ color: 'white' }}>Download PDF</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    marginTop: 20,
    padding: 20,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  title: {
    fontFamily: 'Poppins-Medium',
    fontSize: 20,
    fontWeight: '600',
  },
  saveButton: {
    color: '#14B6AA',
    fontSize: 18,
    borderWidth: 1,
    borderColor: '#14B6AA',
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 5,
  },
  resumeContainer: {
    flex: 1,
    backgroundColor: 'white',
    margin: 15,
    padding: 20,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerSection: {
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 20,
  },
  nameSection: {
    marginBottom: 15,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'Poppins-SemiBold',
    color: '#222',
    marginBottom: 5,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  location: {
    fontSize: 10,
    color: '#555',
    marginLeft: 5,
  },
  contactInfo: {
    paddingLeft: 30,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    width: '48%',
  },
  contactText: {
    fontSize: 6,
    color: '#555',
    marginLeft: 5,
    flex: 1,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 5,
  },
  divider: {
    height: 1,
    backgroundColor: '#ddd',
    marginBottom: 12,
  },
  educationItem: {
    marginBottom: 10,
  },
  educationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  institutionName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  educationPeriod: {
    fontSize: 8,
    color: '#555',
  },
  degree: {
    fontSize: 10,
    color: '#333',
    marginBottom: 2,
  },
  educationLocation: {
    fontSize: 10,
    color: '#555',
  },
  certificationsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  certificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    marginBottom: 8,
  },
  bullet: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#555',
    marginRight: 8,
  },
  certificationText: {
    fontSize: 10,
    color: '#333',
  },
  experienceItem: {
    marginBottom: 18,
  },
  experienceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  companyName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  jobTitle: {
    fontSize: 10,
    color: '#333',
  },
  periodLocationContainer: {
    alignItems: 'flex-end',
  },
  periodText: {
    fontSize: 8,
    color: '#555',
    marginBottom: 2,
  },
  locationText: {
    fontSize: 8,
    color: '#555',
  },
  responsibilitiesContainer: {
    marginTop: 5,
  },
  responsibilityItem: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  bulletPoint: {
    fontSize: 14,
    color: '#333',
    marginRight: 5,
    width: 15,
  },
  responsibilityText: {
    fontSize: 10,
    color: '#333',
    flex: 1,
    lineHeight: 20,
  },
  projectItem: {
    marginBottom: 16,
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  projectNameTechContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  projectName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginRight: 5,
  },
  projectTech: {
    fontSize: 10,
    color: '#555',
  },
  projectPeriod: {
    fontSize: 8,
    color: '#555',
  },
  projectDescriptionContainer: {
    marginTop: 4,
  },
  descriptionItem: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  descriptionText: {
    fontSize: 10,
    color: '#333',
    flex: 1,
    lineHeight: 20,
  },
  skillsContainer: {
    marginTop: 5,
    flexDirection: 'row',
  },
  skillItem: {
    fontSize: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 6,
  },
  skillCategory: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  skillList: {
    fontSize: 10,
    color: '#333',
    flex: 1,
  },
});

export default ResumeTemplate;
