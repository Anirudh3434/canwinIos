"use client"

import React, { useState, useRef, useEffect } from "react"
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  Dimensions,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import DocumentPicker from "react-native-document-picker"
import { launchCamera } from "react-native-image-picker"
import Ionicons from "react-native-vector-icons/Ionicons"
import DropDownPicker from "react-native-dropdown-picker"
import RNFS from "react-native-fs"
import { useSelector } from "react-redux"
import axios from "axios"
import { API_ENDPOINTS } from "../../../api/apiConfig"
import AsyncStorage from "@react-native-async-storage/async-storage"

const { width, height } = Dimensions.get("window")



const MAX_FILES = 1

const documentCategories = [
  {
    id: "company-identity",
    section: 1,
    title: "Company Identity & Legitimacy",
    required: true,
    documents: [
      { id: "incorporation", label: "Certificate of Incorporation / Business Registration", required: true },
      { id: "gst", label: "GST Registration Certificate", required: true },
      { id: "pan", label: "PAN Card (Company PAN)", required: true },
      { id: "shop", label: "Shop & Establishment License", required: false },
      { id: "udyam", label: "Udyam Registration (for MSMEs)", required: false },
    ],
  },
  {
    id: "address-proof",
    section: 2,
    title: "Proof of Address",
    required: true,
    documents: [
      { id: "utility", label: "Recent Utility Bill (not older than 3 months)", required: true },
      { id: "rent", label: "Rent Agreement / Ownership Deed", required: false },
      { id: "photos", label: "Office Location Photos", required: false },
    ],
  },
  {
    id: "signatory",
    section: 3,
    title: "Authorized Signatory Verification",
    required: true,
    documents: [
      { id: "authorization", label: "Letter of Authorization on Company Letterhead", required: true },
      { id: "id-proof", label: "Government ID Proof of Director/Owner", required: true },
      { id: "employee-id", label: "Recruiter's Company Employee ID Card", required: false },
    ],
  },
  {
    id: "online-presence",
    section: 4,
    title: "Website & Online Presence",
    required: true,
    documents: [
      { id: "email", label: "Official Company Email Address", required: true },
      { id: "website", label: "Active Company Website Link", required: true },
    ],
  },
  {
    id: "financial",
    section: 5,
    title: "Financial Legitimacy (Optional)",
    required: false,
    documents: [
      { id: "cheque", label: "Cancelled Cheque or Bank Statement", required: false },
      { id: "tax", label: "Latest Income Tax Return Acknowledgement", required: false },
    ],
  },
  {
    id: "recruitment",
    section: 6,
    title: "Recruitment Business Specific",
    required: false,
    documents: [
      { id: "license", label: "Recruitment/Staffing License", required: false },
      { id: "clients", label: "List of Client Contracts or Letters of Intent", required: false },
    ],
  },
  {
    id: "declaration",
    section: 7,
    title: "Declaration Documents",
    required: true,
    documents: [
      {
        id: "self-declaration",
        label: "Self-Declaration Letter",
        description: "Confirming adherence to ethical hiring practices and compliance with portal terms and conditions",
        required: true,
      },
    ],
  },
]

const KycDocumentForm = ({ navigation }) => {
  const isMounted = useRef(true)

  const companyData = useSelector((state) => state.companyDetail)

  // Form state
  const [gstNumber, setGstNumber] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)




  // Updated file storage structure
  const [formattedFiles, setFormattedFiles] = useState([])

  const [uploadedFiles, setUploadedFiles] = useState({})

  const [expandedSections, setExpandedSections] = useState({})

  const [selectedDocuments, setSelectedDocuments] = useState({})

  const [documentDropdownOpen, setDocumentDropdownOpen] = useState({})

  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const initialSelectedDocs = {}
    documentCategories.forEach((category) => {
      if (category.documents.length > 0) {
        initialSelectedDocs[category.id] = category.documents[0].id
      }
    })
    setSelectedDocuments(initialSelectedDocs)

    return () => {
      isMounted.current = false
    }
  }, [])



  const fetchUserData = async () => {
    try {
      const storedUserId = await AsyncStorage.getItem('userId');
      if (!storedUserId) {
        Alert.alert('Error', 'User not logged in');
        navigation.navigate('Login');
        return;
      }

      const parsedUserId = parseInt(storedUserId, 10);
      setUserId(parsedUserId);

      
    } catch (error) {
      console.error('Error fetching user data:', error);
      Alert.alert('Error', 'Could not retrieve user information');
    }
  };


  useEffect(() => {
    fetchUserData();
  }, [ ])


  console.log ("User ID:", userId);



  // Process uploaded files into the required format whenever uploadedFiles changes
  useEffect(() => {
    const formatted = []
    
    // Loop through each category
    documentCategories.forEach(category => {
      const docId = selectedDocuments[category.id]
      if (!docId) return
      
      // Find the document details
      const selectedDoc = category.documents.find(doc => doc.id === docId)
      if (!selectedDoc) return
      
      // Get the files for this document type
      const key = `${category.id}-${docId}`
      const files = uploadedFiles[key] || []
      
      // Add each file to our formatted array
      files.forEach(file => {
        formatted.push({
          section: category.section,
          name: selectedDoc.label,
          data: file.data, // The blob data
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          uri: file.uri
        })
      })
    })
    
    setFormattedFiles(formatted)
    console.log("Formatted files updated:", formatted)
  }, [uploadedFiles, selectedDocuments])

  // Toggle section expansion
  const toggleSection = (sectionId) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }))
  }

  // Set dropdown open state for a specific category
  const setDropdownOpen = (categoryId, isOpen) => {
    setDocumentDropdownOpen((prev) => ({
      ...prev,
      [categoryId]: isOpen,
    }))

    // Close other dropdowns when one is opened
    if (isOpen) {
      Object.keys(documentDropdownOpen).forEach((key) => {
        if (key !== categoryId && documentDropdownOpen[key]) {
          setDocumentDropdownOpen((prev) => ({
            ...prev,
            [key]: false,
          }))
        }
      })

      // Also close ID proof dropdown if it's open
      if (idProofOpen) {
        setIdProofOpen(false)
      }
    }
  }

  // Check if form is valid for submission
  const isFormValid = () => {
    // Check GST number
    if (gstNumber.trim().length !== 15) {
      return false
    }


    // Check required documents
    let valid = true
    documentCategories.forEach((category) => {
      if (category.required) {
        const selectedDocId = selectedDocuments[category.id]
        if (!selectedDocId) {
          valid = false
          return
        }

        const selectedDoc = category.documents.find((doc) => doc.id === selectedDocId)
        if (selectedDoc && selectedDoc.required) {
          const key = `${category.id}-${selectedDocId}`
          if (!uploadedFiles[key] || uploadedFiles[key].length === 0) {
            valid = false
          }
        }
      }
    })

    return valid
  }

  const readFileAsBase64 = async (uri) => {
    try {
      const filePath = uri.replace("file://", "")
      return await RNFS.readFile(filePath, "base64")
    } catch (error) {
      console.error("Error reading file:", error)
      throw error
    }
  }

  const handleFileUpload = async (categoryId, documentId) => {
    const key = `${categoryId}-${documentId}`
    const currentFiles = uploadedFiles[key] || []

    if (currentFiles.length >= MAX_FILES) {
      Alert.alert("File Limit Reached", `You can only upload ${MAX_FILES} documents per type`)
      return
    }

    try {
      setIsUploading(true)
      const result = await DocumentPicker.pick({
        type: [
          DocumentPicker.types.pdf,
          DocumentPicker.types.images,
          DocumentPicker.types.doc,
          DocumentPicker.types.docx,
        ],
        allowMultiSelection: currentFiles.length === 0,
      })

      if (result && result.length > 0) {
        const newFiles = []
        const availableSlots = MAX_FILES - currentFiles.length
        const filesToProcess = result.slice(0, availableSlots)

        for (const file of filesToProcess) {
          const base64Data = await readFileAsBase64(file.uri)

          const blob = {
            name: file.name,
            type: file.type,
            size: file.size,
            uri: file.uri,
            data: base64Data,
          }
          newFiles.push(blob)
        }

        if (isMounted.current) {
          setUploadedFiles((prev) => ({
            ...prev,
            [key]: [...(prev[key] || []), ...newFiles],
          }))
        }
      }
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        console.log("User cancelled file selection")
      } else {
        console.error("Error uploading file:", err)
        if (isMounted.current) {
          Alert.alert("File Selection Error", "There was a problem selecting or processing your file")
        }
      }
    } finally {
      if (isMounted.current) {
        setIsUploading(false)
      }
    }
  }

  const updateUserProgress = async () => {
    try {
      // Get current step
      const getStepsResponse = await axios.get(`${API_ENDPOINTS.STEP}?user_id=${userId}`);
      if (getStepsResponse.data.status !== 'success') {
        throw new Error('Could not retrieve user progress');
      }

      // Update step
      const currentStep = +getStepsResponse.data.data.steps;
      const postStepResponse = await axios.post(API_ENDPOINTS.STEP, {
        user_id: userId,
        steps: currentStep + 1,
      });

      if (postStepResponse.data.status !== 'success') {
        throw new Error('Could not update user progress');
      }

      return true;
    } catch (error) {
      console.error('Error updating progress:', error);
      throw error;
    }
  };

  const handleOpenCamera = async (categoryId, documentId) => {
    const key = `${categoryId}-${documentId}`
    const currentFiles = uploadedFiles[key] || []

    if (currentFiles.length >= MAX_FILES) {
      Alert.alert("File Limit Reached", `You can only upload ${MAX_FILES} documents per type`)
      return
    }

    const options = {
      mediaType: "photo",
      maxWidth: 1024,
      maxHeight: 1024,
      quality: 0.8,
      includeBase64: true,
    }

    try {
      setIsUploading(true)
      launchCamera(options, async (response) => {
        if (response.didCancel) {
          console.log("User cancelled camera")
          if (isMounted.current) setIsUploading(false)
        } else if (response.errorCode) {
          console.log("Camera Error: ", response.errorMessage)
          if (isMounted.current) {
            Alert.alert("Camera Error", response.errorMessage)
            setIsUploading(false)
          }
        } else if (response.assets && response.assets.length > 0) {
          const asset = response.assets[0]

          let base64Data = asset.base64
          if (!base64Data) {
            try {
              base64Data = await readFileAsBase64(asset.uri)
            } catch (error) {
              if (isMounted.current) {
                Alert.alert("Error", "Failed to process camera image")
                setIsUploading(false)
              }
              return
            }
          }

          const blob = {
            name: asset.fileName || `camera_image_${Date.now()}.jpg`,
            type: asset.type || "image/jpeg",
            size: asset.fileSize,
            uri: asset.uri,
            data: base64Data,
          }

          if (isMounted.current) {
            setUploadedFiles((prev) => ({
              ...prev,
              [key]: [...(prev[key] || []), blob],
            }))
            setIsUploading(false)
          }
        }
      })
    } catch (error) {
      console.error("Camera handling error:", error)
      if (isMounted.current) {
        Alert.alert("Error", "Failed to process camera image")
        setIsUploading(false)
      }
    }
  }

  const removeFile = (categoryId, documentId, indexToRemove) => {
    const key = `${categoryId}-${documentId}`
    setUploadedFiles((prev) => {
      const updatedFiles = [...(prev[key] || [])]
      updatedFiles.splice(indexToRemove, 1)
      return {
        ...prev,
        [key]: updatedFiles,
      }
    })
  }

  const handleSubmit = async () => {
    if (!isFormValid()) {
      Alert.alert("Missing Information", "Please fill in all required fields and upload all required documents.");
      return;
    }
    
    setIsLoading(true);
    try {
      const companyPayload = {
        ...companyData,
        company_gstin: gstNumber,
      };

      console.log("Company Payload:", companyPayload);
      const companyResponse = await axios.post(API_ENDPOINTS.COMPANY_DETAILS, companyPayload);
      if (companyResponse.data.status !== 'success') {
        throw new Error(companyResponse.data.message || 'Company registration failed');
      }
      const companyId = companyResponse.data.company_id;
      
      // Step 2: Create employer association
      const employerPayload = {
        user_id: userId,
        company_id: companyId,
        user_company_role: 'Admin',
      };
      const empResponse = await axios.post(API_ENDPOINTS.EMPLOYER, employerPayload);

      console.log("Employer Response:", empResponse.data);
      if (empResponse.data.status !== 'success') {
        throw new Error(empResponse.data.message || 'Employer registration failed');
      }
      
      // Step 3: Upload KYC documents using the actual companyId
      await Promise.all(formattedFiles.map((file) => {
        return axios.post(API_ENDPOINTS.VERIFY_DOCS, {
          doc_type: file.name,
          mime_type: file.fileType,
          blob_file: file.data,
          section_id: file.section,
          company_id: companyId,
        });
      }));
      
      // Step 4: Update user progress
      await updateUserProgress();
      
      // Success - show message and navigate
      Alert.alert('Success', 'Registration and KYC documents submitted successfully!');
      if (isMounted.current) {
        navigation.navigate('Validate');
      }
    } catch (error) {
      console.error("Error during registration process:", error);
      Alert.alert("Submission Error", error.message || "There was a problem with your submission. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  // Render uploaded files for a specific document
  const renderUploadedFiles = (categoryId, documentId) => {
    const key = `${categoryId}-${documentId}`
    const files = uploadedFiles[key] || []

    return files.map((file, index) => (
      <View key={index} style={styles.uploadedFileItem}>
        <View style={styles.fileInfoContainer}>
          <Ionicons name="document" size={20} color="#14B6AA" />
          <Text style={styles.uploadedFileName} numberOfLines={1}>
            {file.name || file.uri.split("/").pop()}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => removeFile(categoryId, documentId, index)}
          disabled={isUploading}
          style={isUploading ? styles.disabledButton : null}
        >
          <Ionicons name="close" size={20} color={isUploading ? "#ccc" : "red"} />
        </TouchableOpacity>
      </View>
    ))
  }

  // Render a document upload section
  const renderDocumentUpload = (category) => {
    const selectedDocId = selectedDocuments[category.id]
    if (!selectedDocId) return null

    const key = `${category.id}-${selectedDocId}`
    const files = uploadedFiles[key] || []

    // Find the selected document object
    const selectedDoc = category.documents.find((doc) => doc.id === selectedDocId)
    if (!selectedDoc) return null

    return (
      <View style={styles.uploadContainer}>
        {selectedDoc.description && <Text style={styles.documentDescription}>{selectedDoc.description}</Text>}

        <TouchableOpacity
          style={[styles.fileUploadButton, (files.length >= MAX_FILES || isUploading) && styles.disabledButton]}
          onPress={() => handleFileUpload(category.id, selectedDocId)}
          disabled={files.length >= MAX_FILES || isUploading}
        >
          <Text style={styles.fileUploadText}>Choose File</Text>
          <Ionicons name="document-outline" size={24} color="#9F9F9F" />
        </TouchableOpacity>

        <View style={styles.cameraButtonContainer}>
          <TouchableOpacity
            style={[styles.cameraUploadButton, (files.length >= MAX_FILES || isUploading) && styles.disabledButton]}
            onPress={() => handleOpenCamera(category.id, selectedDocId)}
            disabled={files.length >= MAX_FILES || isUploading}
          >
            <Text style={[styles.cameraUploadText, (files.length >= MAX_FILES || isUploading) && styles.disabledText]}>
              <Text style={{ color: "#667085" }}>Or</Text> Open Camera
            </Text>
          </TouchableOpacity>
        </View>

        {renderUploadedFiles(category.id, selectedDocId)}
      </View>
    )
  }

  // Render a category section with its documents
  const renderCategory = (category, index) => {
    const isExpanded = expandedSections[category.id]
    const isDropdownOpen = documentDropdownOpen[category.id] || false

    // Convert documents to dropdown items
    const documentItems = category.documents.map((doc) => ({
      label: doc.label + (doc.required ? " *" : ""),
      value: doc.id,
    }))

    return (
      <View key={category.id} style={styles.categoryContainer}>
        <TouchableOpacity style={styles.categoryHeader} onPress={() => toggleSection(category.id)}>
          <View style={styles.categoryTitleContainer}>
            <Text style={styles.categoryTitle}>
              {index + 1}. {category.title}
              {category.required && <Text style={styles.requiredStar}> *</Text>}
            </Text>
          </View>
          <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={24} color="#14B6AA" />
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.categoryContent}>
            <View style={styles.documentSelectorContainer}>
              <Text style={styles.documentSelectorLabel}>Select Document Type:</Text>
              <DropDownPicker
                listMode="SCROLLVIEW"
                scrollViewProps={{ nestedScrollEnabled: true }}
                open={isDropdownOpen}
                value={selectedDocuments[category.id]}
                items={documentItems}
                setOpen={(open) => setDropdownOpen(category.id, open)}
                setValue={(callback) => {
                  setSelectedDocuments((prev) => {
                    const newValue = typeof callback === "function" ? callback(prev[category.id]) : callback
                    return {
                      ...prev,
                      [category.id]: newValue,
                    }
                  })
                }}
                placeholder="Select Document Type"
                style={styles.dropdownStyle}
                dropDownContainerStyle={styles.dropdownContainerStyle}
                placeholderStyle={styles.placeholderStyle}
                zIndex={1000 - index} // Ensure proper z-index stacking
                zIndexInverse={index}
              />
            </View>

            {renderDocumentUpload(category)}
          </View>
        )}
      </View>
    )
  }

 

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>KYC Verification</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.container}>
          <Text style={styles.title}>Complete your KYC</Text>
          <Text style={styles.subtitle}>
            Please provide the following information and documents to complete your KYC verification
          </Text>

          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Basic Information</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                GST Number <Text style={styles.requiredStar}>*</Text>
              </Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter GST Number"
                value={gstNumber}
                onChangeText={setGstNumber}
                maxLength={15}
                keyboardType="default"
              />
              {gstNumber.length > 0 && gstNumber.length !== 15 && (
                <Text style={styles.errorText}>GST Number should be 15 characters</Text>
              )}
            </View>

           
          </View>

          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Document Upload</Text>
            <Text style={styles.sectionSubtitle}>
              Upload clear, legible scans or photos of the following documents. Files must be in PDF, JPG, or PNG format
              and not exceed 4MB each.
            </Text>

            {documentCategories.map(renderCategory)}
          </View>

        

          <TouchableOpacity
            style={[styles.submitButton, (!isFormValid() || isLoading || isUploading) && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={!isFormValid() || isLoading || isUploading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>Submit KYC Documents</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 50,
  },
  header: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: height * 0.02,
    paddingHorizontal: width * 0.05,
    borderBottomWidth: 1,
    borderBottomColor: "#EFEFEF",
  },
  headerTitle: {
    fontSize: width * 0.045,
    fontWeight: "600",
  },
  backButton: {
    padding: 8,
  },
  headerRight: {
    width: 40,
  },
  container: {
    width: "90%",
    alignSelf: "center",
    paddingVertical: height * 0.02,
  },
  title: {
    fontSize: width * 0.06,
    fontWeight: "700",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: width * 0.04,
    color: "#666",
    marginBottom: 24,
  },
  formSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: width * 0.05,
    fontWeight: "600",
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: width * 0.035,
    color: "#666",
    marginBottom: 16,
  },
  inputContainer: {
    width: "100%",
    marginBottom: height * 0.02,
  },
  label: {
    fontSize: width * 0.04,
    fontWeight: "600",
    marginBottom: 8,
  },
  textInput: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ADADAD",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: width * 0.04,
  },
  dropdownStyle: {
    borderColor: "#ADADAD",
    borderRadius: 8,
  },
  dropdownContainerStyle: {
    borderColor: "#ADADAD",
  },
  placeholderStyle: {
    color: "#ADADAD",
  },
  categoryContainer: {
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#EFEFEF",
    borderRadius: 8,
    overflow: "hidden",
  },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#F9F9F9",
  },
  categoryTitleContainer: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: width * 0.045,
    fontWeight: "600",
  },
  categoryContent: {
    padding: 16,
  },
  documentSelectorContainer: {
    marginBottom: 16,
  },
  documentSelectorLabel: {
    fontSize: width * 0.04,
    fontWeight: "500",
    marginBottom: 8,
  },
  documentDescription: {
    fontSize: width * 0.035,
    color: "#666",
    marginBottom: 12,
  },
  uploadContainer: {
    width: "100%",
    marginTop: 8,
  },
  fileUploadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#14B6AA",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 10,
    marginBottom: 8,
  },
  fileUploadText: {
    color: "#9F9F9F",
    fontWeight: "500",
    marginLeft: 8,
  },
  cameraButtonContainer: {
    width: "100%",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  cameraUploadButton: {
    alignItems: "center",
  },
  cameraUploadText: {
    color: "#14B6AA",
    fontWeight: "500",
  },
  uploadedFileItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#14B6AA",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  fileInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  uploadedFileName: {
    flex: 1,
    marginHorizontal: 8,
  },
  submitButton: {
    backgroundColor: "#14B6AA",
    paddingVertical: height * 0.02,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
    marginTop: 24,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: width * 0.045,
    fontWeight: "600",
  },
  disabledButton: {
    backgroundColor: "#ccc",
    opacity: 0.7,
  },
  disabledText: {
    color: "#ccc",
  },
  requiredStar: {
    color: "red",
  },
  errorText: {
    color: "red",
    fontSize: width * 0.035,
    marginTop: 4,
  },
})

export default KycDocumentForm