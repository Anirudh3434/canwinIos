// PdfViewer.js
import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Colors } from '../../theme/color';
import { WebView } from 'react-native-webview';

const PdfViewer = ({ route, navigation }) => {
  const { pdfUrl, fileName } = route.params;

  console.log(pdfUrl)



  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={Colors.bg} barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{fileName || 'Resume'}</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.pdfContainer}>
        <WebView
          source={{ uri: `https://docs.google.com/gview?embedded=true&url=${pdfUrl}` }} 
          style={{ flex: 1 }} 
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  pdfContainer: {
    flex: 1,
  },
  pdf: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  pageIndicator: {
    padding: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  pageText: {
    fontSize: 14,
    color: '#666',
  },
});

export default PdfViewer;