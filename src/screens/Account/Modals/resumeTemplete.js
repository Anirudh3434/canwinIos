"use client"

import { useRef } from "react"
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
  StatusBar,
} from "react-native"
import Icon from "react-native-vector-icons/Feather"
import Ionicons from "react-native-vector-icons/Ionicons"
import RNHTMLtoPDF from "react-native-html-to-pdf"
import RNFS from "react-native-fs"
import Share from "react-native-share"
import RNFetchBlob from "react-native-blob-util"

const { PermissionFileModule } = NativeModules

const ResumeTemplate = ({ route, navigation }) => {
  const resumeRef = useRef(null)

  // Extract data from route params
  const {
    personalData = {},
    educationData = [],
    employmentData = [],
    projectData = [],
    skillData = [],
    socialLinks = { linkedin: "", github: "" },
  } = route?.params || {}

  // Format data for the resume
  const resumeData = {
    name: personalData.fullName || "",
    location:
      (personalData.city || "") + (personalData.city && personalData.state ? ", " : "") + (personalData.state || ""),
    contact: {
      phone: personalData.phone || "",
      email: personalData.email || "",
      linkedin: socialLinks.linkedin || "",
      github: socialLinks.github || "",
    },
    education: educationData || [],
    experience: employmentData || [],
    projects: projectData || [],
    skills: skillData || [],
  }

  const requestStoragePermission = async () => {
    if (Platform.OS !== "android") {
      return true
    }

    try {
      // First try using our native module if available
      if (PermissionFileModule) {
        const hasPermission = await PermissionFileModule.checkStoragePermission()

        if (!hasPermission) {
          await PermissionFileModule.requestStoragePermission()
          // Check again after request
          return await PermissionFileModule.checkStoragePermission()
        }

        return hasPermission
      }

      // Fallback to the standard React Native approach
      const androidVersion = Platform.Version

      if (androidVersion >= 33) {
        // For Android 13+ (API 33+)
        const permissions = [
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO,
        ]

        const statuses = await PermissionsAndroid.requestMultiple(permissions)

        return (
          statuses[PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES] === PermissionsAndroid.RESULTS.GRANTED &&
          statuses[PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO] === PermissionsAndroid.RESULTS.GRANTED &&
          statuses[PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO] === PermissionsAndroid.RESULTS.GRANTED
        )
      } else {
        // For Android 12 and below
        const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE, {
          title: "Storage Permission Required",
          message: "This app needs access to your storage to download the PDF",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK",
        })

        return granted === PermissionsAndroid.RESULTS.GRANTED
      }
    } catch (err) {
      console.warn("Permission request error:", err)
      return false
    }
  }

  const handleContactPress = (type, value) => {
    switch (type) {
      case "phone":
        Linking.openURL(`tel:${value}`)
        break
      case "email":
        Linking.openURL(`mailto:${value}`)
        break
      case "linkedin":
        Linking.openURL(`https://${value}`)
        break
      case "github":
        Linking.openURL(`https://${value}`)
        break
      default:
        break
    }
  }

  // Function to generate HTML content for PDF
  const generateHTML = () => {
    const educationHTML = resumeData.education
      .map(
        (edu) => `
    <div style="margin-bottom: 16px;">
      <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
        <div style="font-weight: 600; font-size: 15px; color: #333;">${
          edu.instituteName || edu.institute_name || ""
        }</div>
        <div style="font-size: 13px; color: #555;">${
          edu?.education === "X" || edu?.education === "XII"
            ? edu?.yearOfCompletion || edu?.year_of_completion || ""
            : (edu?.startYear || edu?.year_of_start || "") +
              " - " +
              (edu?.yearOfCompletion || edu?.year_of_completion || "")
        }</div>
      </div>
      <div style="font-size: 14px; color: #444; margin-bottom: 2px;">${
        edu?.education === "X" || edu?.education === "XII"
          ? edu?.education || ""
          : (edu?.course || edu?.course_name || "") +
            (
              edu?.specialization || edu?.specialization_name
                ? " in " + (edu?.specialization || edu?.specialization_name)
                : ""
            )
      }</div>
      <div style="font-size: 13px; color: #666;">Marks: ${edu.marks || ""}</div>
    </div>
  `,
      )
      .join("")

    const experienceHTML = resumeData.experience
      .map(
        (exp) => `
    <div style="margin-bottom: 20px;">
      <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
        <div>
          <div style="font-size: 15px; font-weight: 600; color: #333; margin-bottom: 2px;">${
            exp.CompanyName || exp.curr_company_name || ""
          }</div>
          <div style="font-size: 14px; color: #444;">${exp.CurrentJobTitle || exp.curr_job_title || ""}</div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 13px; color: #555; margin-bottom: 2px;">${
            exp.JoiningDate || exp.joining_date || ""
          }  ${exp.isCurrent === "Yes" ? "Present" :""}</div>
          <div style="font-size: 13px; color: #555;">${exp.location || ""} ${
            exp.total_exp_in_years || exp.total_exp_in_months
              ? `• ${exp.total_exp_in_years || "0"}y ${exp.total_exp_in_months || "0"}m`
              : ""
          }</div>
        </div>
      </div>
    </div>
  `,
      )
      .join("")

    const projectsHTML = resumeData.projects
      .map(
        (project) => `
    <div style="margin-bottom: 20px;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;">
        <div style="font-size: 15px; font-weight: 600; color: #333; margin-right: 10px;">${
          project.projectTitle || project.project_title || ""
        }</div>
        <div style="font-size: 13px; color: #555; white-space: nowrap;">${
          project?.projectStatus === "In-Progress" || project?.project_status === "In-Progress"
            ? "Ongoing"
            : (project.workFrom || project.work_from || "") + " - " + (project.workTill || project.work_till || "")
        }</div>
      </div>
      <div style="margin-top: 4px;">
        <div style="font-size: 13px; line-height: 1.5; color: #444;">${
          project.projectDetail || project.project_detail || ""
        }</div>
      </div>
    </div>
  `,
      )
      .join("")

    const skillsHTML = `
    <div style="display: flex; flex-wrap: wrap; gap: 8px;">
      ${resumeData.skills
        .map(
          (skill) => `
        <span style="font-size: 14px; color: #444;">${
          skill.skillName || skill || ""
        }${resumeData.skills.indexOf(skill) < resumeData.skills.length - 1 ? " •" : ""}</span>
      `,
        )
        .join(" ")}
    </div>
  `

    return `
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { 
            font-family: 'Helvetica', 'Arial', sans-serif; 
            padding: 30px; 
            color: #333;
            line-height: 1.4;
          }
          .resume-container { 
            max-width: 800px; 
            margin: 0 auto; 
          }
          .header-section { 
            text-align: center; 
            margin-bottom: 25px; 
            padding-bottom: 15px;
            border-bottom: 1px solid #eaeaea;
          }
          .name { 
            font-size: 28px; 
            font-weight: bold; 
            margin-bottom: 8px; 
            color: #222;
          }
          .contact-info { 
            display: flex; 
            flex-wrap: wrap; 
            justify-content: center; 
            gap: 15px;
            margin-top: 12px;
          }
          .contact-item { 
            display: flex; 
            align-items: center; 
          }
          .section { 
            margin-bottom: 25px; 
          }
          .section-title { 
            font-size: 18px; 
            font-weight: bold; 
            margin-bottom: 12px; 
            color: #222;
            padding-bottom: 6px;
            border-bottom: 1px solid #eaeaea;
          }
        </style>
      </head>
      <body>
        <div class="resume-container">
          <div class="header-section">
            <div class="name">${resumeData.name}</div>
            <div style="font-size: 14px; color: #555;">${resumeData.location}</div>
            <div class="contact-info">
              <div class="contact-item">
                <span style="font-size: 14px; color: #555;">📞 ${resumeData.contact.phone}</span>
              </div>
              <div class="contact-item">
                <span style="font-size: 14px; color: #555;">✉️ ${resumeData.contact.email}</span>
              </div>
              ${
                resumeData.contact.linkedin
                  ? `
              <div class="contact-item">
                <span style="font-size: 14px; color: #555;">🔗 ${resumeData.contact.linkedin}</span>
              </div>
              `
                  : ""
              }
              ${
                resumeData.contact.github
                  ? `
              <div class="contact-item">
                <span style="font-size: 14px; color: #555;">💻 ${resumeData.contact.github}</span>
              </div>
              `
                  : ""
              }
            </div>
          </div>

          <div class="section">
            <div class="section-title">Education</div>
            ${educationHTML}
          </div>

          <div class="section">
            <div class="section-title">Experience</div>
            ${experienceHTML}
          </div>

          <div class="section">
            <div class="section-title">Projects</div>
            ${projectsHTML}
          </div>

          <div class="section">
            <div class="section-title">Technical Skills</div>
            ${skillsHTML}
          </div>
        </div>
      </body>
    </html>
  `
  }

  // In the downloadPDF function, modify the code to ensure the PDF is properly saved to Downloads
  const downloadPDF = async () => {
    try {
      const hasPermission = await requestStoragePermission()
      if (!hasPermission && Platform.OS === "android") {
        Alert.alert(
          "Permission Required",
          "Storage permission is needed to save your resume. Please enable it in settings.",
          [{ text: "Open Settings", onPress: () => Linking.openSettings() }],
        )
        return
      }

      // Show loading alert
      Alert.alert("Generating PDF", "Please wait while your resume is being generated...")

      const fileName = `${resumeData.name.replace(/\s+/g, "_")}_Resume_${Date.now()}.pdf`

      // Generate PDF
      const options = {
        html: generateHTML(),
        fileName,
        directory: Platform.OS === "android" ? "Download" : undefined,
        base64: false,
      }

      const file = await RNHTMLtoPDF.convert(options)

      if (file && file.filePath) {
        let downloadPath = file.filePath

        if (Platform.OS === "android") {
          const newPath = `${RNFS.DownloadDirectoryPath}/${fileName}`
          await RNFS.moveFile(file.filePath, newPath)
          downloadPath = newPath

          // Make file visible in Downloads
          await RNFetchBlob.fs.scanFile([{ path: newPath, mime: "application/pdf" }])
        }

        // Success Alert with options
        Alert.alert("PDF Saved Successfully", "Your resume has been saved to your device.", [
          { text: "OK", style: "default" },
          { text: "Share", onPress: () => sharePDF(downloadPath) },
        ])
      } else {
        throw new Error("PDF file path is undefined")
      }
    } catch (error) {
      console.error("PDF Generation Error:", error)
      Alert.alert("Error", "Failed to generate PDF. Please try again.")
    }
  }

  // Share PDF
  const sharePDF = async (filePath) => {
    try {
      await Share.open({
        url: `file://${filePath}`,
        type: "application/pdf",
        title: "Share Resume PDF",
      })
    } catch (error) {
      console.error("Share Error:", error)
      if (error.message !== "User did not share") {
        Alert.alert("Share Error", "Could not share the PDF.")
      }
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#ffffff" barStyle="dark-content" />

     

      {/* Resume Content */}
      <ScrollView style={styles.scrollView}>
        <View style={styles.resumeContainer} ref={resumeRef}>
          {/* Header Section */}
          <View style={styles.resumeHeader}>
            <Text style={styles.name}>{resumeData.name}</Text>

            {resumeData.location ? (
              <View style={styles.locationContainer}>
                <Icon name="map-pin" size={14} color="#666" />
                <Text style={styles.location}>{resumeData.location}</Text>
              </View>
            ) : null}

            {/* Contact Information */}
            <View style={styles.contactInfo}>
              {resumeData.contact.phone ? (
                <TouchableOpacity
                  style={styles.contactItem}
                  onPress={() => handleContactPress("phone", resumeData.contact.phone)}
                >
                  <Icon name="phone" size={14} color="#666" />
                  <Text style={styles.contactText}>{resumeData.contact.phone}</Text>
                </TouchableOpacity>
              ) : null}

              {resumeData.contact.email ? (
                <TouchableOpacity
                  style={styles.contactItem}
                  onPress={() => handleContactPress("email", resumeData.contact.email)}
                >
                  <Icon name="mail" size={14} color="#666" />
                  <Text style={styles.contactText}>{resumeData.contact.email}</Text>
                </TouchableOpacity>
              ) : null}

              {resumeData.contact.linkedin ? (
                <TouchableOpacity
                  style={styles.contactItem}
                  onPress={() => handleContactPress("linkedin", resumeData.contact.linkedin)}
                >
                  <Icon name="linkedin" size={14} color="#666" />
                  <Text style={styles.contactText}>{resumeData.contact.linkedin}</Text>
                </TouchableOpacity>
              ) : null}

              {resumeData.contact.github ? (
                <TouchableOpacity
                  style={styles.contactItem}
                  onPress={() => handleContactPress("github", resumeData.contact.github)}
                >
                  <Icon name="github" size={14} color="#666" />
                  <Text style={styles.contactText}>{resumeData.contact.github}</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>

          {/* Education Section */}
          {resumeData.education.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Education</Text>
              <View style={styles.divider} />

              {resumeData.education.map((edu, index) => (
                <View key={index} style={styles.educationItem}>
                  <View style={styles.educationHeader}>
                    <Text style={styles.institutionName}>{edu.instituteName || edu.institute_name || ""}</Text>
                    <Text style={styles.educationPeriod}>
                      {edu?.education === "X" || edu?.education === "XII"
                        ? edu?.yearOfCompletion || edu?.year_of_completion || ""
                        : (edu?.startYear || edu?.year_of_start || "") +
                          " - " +
                          (edu?.yearOfCompletion || edu?.year_of_completion || "")}
                    </Text>
                  </View>

                  <Text style={styles.degree}>
                    {edu?.education === "X" || edu?.education === "XII"
                      ? edu?.education || ""
                      : (edu?.course || edu?.course_name || "") +
                        (edu?.specialization || edu?.specialization_name
                          ? " in " + (edu?.specialization || edu?.specialization_name)
                          : "")}
                  </Text>

                  <Text style={styles.educationDetails}>{"Marks: " + (edu.marks || "")}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Experience Section */}
          {resumeData.experience.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Experience</Text>
              <View style={styles.divider} />

              {resumeData.experience.map((exp, index) => (
                <View key={index} style={styles.experienceItem}>
                  <View style={styles.experienceHeader}>
                    <View>
                      <Text style={styles.companyName}>{exp.CompanyName || exp.curr_company_name || ""}</Text>
                      <Text style={styles.jobTitle}>{exp.CurrentJobTitle || exp.curr_job_title || ""}</Text>
                    </View>

                    <View style={styles.periodLocationContainer}>
                      <Text style={styles.periodText}>
                        {`${exp.JoiningDate || exp.joining_date || ""}  ${
                          exp.isCurrent === "Yes" ? "Present" : ""
                        }`}
                      </Text>

                      <View style={styles.locationRow}>
                        <Text style={styles.locationText}>{exp.location || ""}</Text>
                        {(exp.total_exp_in_years || exp.total_exp_in_months) && (
                          <Text style={styles.durationText}>
                            {` • ${exp.total_exp_in_years || "0"}y ${exp.total_exp_in_months || "0"}m`}
                          </Text>
                        )}
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Projects Section */}
          {resumeData.projects.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Projects</Text>
              <View style={styles.divider} />

              {resumeData.projects.map((project, index) => (
                <View key={index} style={styles.projectItem}>
                  <View style={styles.projectHeader}>
                    <Text style={styles.projectName}>{project.projectTitle || project.project_title || ""}</Text>

                    <Text style={styles.projectPeriod}>
                      {project?.projectStatus === "In-Progress" || project?.project_status === "In-Progress"
                        ? "Ongoing"
                        : (project.workFrom || project.work_from || "") +
                          " - " +
                          (project.workTill || project.work_till || "")}
                    </Text>
                  </View>

                  <Text style={styles.projectDescription}>{project.projectDetail || project.project_detail || ""}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Technical Skills Section */}
          {resumeData.skills.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Technical Skills</Text>
              <View style={styles.divider} />

              <View style={styles.skillsContainer}>
                {resumeData.skills.map((skill, index) => (
                  <Text key={index} style={styles.skillItem}>
                    {skill.skillName || skill || ""}
                    {index < resumeData.skills.length - 1 ? " • " : ""}
                  </Text>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Download Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={downloadPDF} style={styles.downloadButton} activeOpacity={0.8}>
          <Icon name="download" size={18} color="#fff" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>Download PDF</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#eaeaea",
    elevation: 2,
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  placeholder: {
    width: 24,
  },
  scrollView: {
    flex: 1,
    
  },
  resumeContainer: {
    backgroundColor: "#ffffff",
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resumeHeader: {
    alignItems: "center",
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eaeaea",
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 6,
    textAlign: "center",
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  location: {
    fontSize: 14,
    color: "#666",
    marginLeft: 6,
  },
  contactInfo: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 4,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 8,
    marginBottom: 8,
  },
  contactText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 6,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: "#eaeaea",
    marginBottom: 16,
  },
  educationItem: {
    marginBottom: 16,
  },
  educationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  institutionName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  educationPeriod: {
    fontSize: 14,
    color: "#666",
  },
  degree: {
    fontSize: 15,
    color: "#444",
    marginBottom: 2,
  },
  educationDetails: {
    fontSize: 14,
    color: "#666",
  },
  experienceItem: {
    marginBottom: 20,
  },
  experienceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  companyName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  jobTitle: {
    fontSize: 15,
    color: "#444",
  },
  periodLocationContainer: {
    alignItems: "flex-end",
  },
  periodText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationText: {
    fontSize: 14,
    color: "#666",
  },
  durationText: {
    fontSize: 14,
    color: "#666",
  },
  projectItem: {
    marginBottom: 18,
  },
  projectHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  projectName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    flex: 1,
    marginRight: 8,
  },
  projectPeriod: {
    fontSize: 14,
    color: "#666",
  },
  projectDescription: {
    fontSize: 14,
    color: "#444",
    lineHeight: 20,
  },
  skillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  skillItem: {
    fontSize: 15,
    color: "#444",
  },
  buttonContainer: {
    padding: 16,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#eaeaea",
  },
  downloadButton: {
    backgroundColor: "#14B6AA",
    borderRadius: 10,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
})

export default ResumeTemplate
