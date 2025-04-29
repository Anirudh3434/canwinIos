import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Linking,
  ActivityIndicator,
  Text,
  Button,
  Image,
  ScrollView,
  StatusBar,
} from 'react-native';
import { WebView } from 'react-native-webview';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

const LinkedInLogin = () => {
  const [userData, setUserData] = useState(null);
  const [apiResponse, setApiResponse] = useState(null); // ✅ To store the raw API response
  const [loading, setLoading] = useState(false);

  const navigation = useNavigation();

  const clientId = '86pg9onlum0hah';
  const redirectUri = 'https://devcrm20.abacasys.com:9100/linkedin/callback';
  const authState = 'test123';
  const scopes = 'openid profile email w_member_social';
  const authorizationUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&state=${authState}&scope=${encodeURIComponent(scopes)}`;

  const handleWebViewNavigationStateChange = async (newNavState) => {
    const { url } = newNavState;

    if (url.startsWith(redirectUri)) {
      const code = new URL(url).searchParams.get('code');

      if (code) {
        setLoading(true);

        try {
          const response = await axios.get(
            `https://linkedinbackend-ndvv.onrender.com/linkedin/callback?code=${code}`
          );

          // ✅ Store the API response and user data
          setUserData(response.data.user);
          setApiResponse(response.data); // Store full API response
          setLoading(false);
        } catch (error) {
          console.error('❌ Error fetching user data:', error);
          setLoading(false);
        }
      }
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" color="white" />
      {loading ? (
        <ActivityIndicator size="large" color="#0073b1" />
      ) : userData ? (
        <ScrollView contentContainerStyle={styles.userInfo}>
          <Text style={styles.title}>
            Welcome, {userData.firstName} {userData.lastName}
          </Text>
          <Text>Email: {userData.email}</Text>

          {userData.picture && (
            <Image source={{ uri: userData.picture }} style={styles.profileImage} />
          )}

          <Text style={styles.sectionTitle}>API Response:</Text>
          <ScrollView style={styles.apiContainer}>
            <Text>{JSON.stringify(apiResponse, null, 2)}</Text>
          </ScrollView>

          <Button
            title="Go to Details"
            onPress={() => navigation.navigate('DetailsScreen', { userData, apiResponse })}
          />
          <Button title="Logout" onPress={() => setUserData(null)} />
        </ScrollView>
      ) : (
        <WebView
          source={{ uri: authorizationUrl }}
          style={styles.webview}
          onNavigationStateChange={handleWebViewNavigationStateChange}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 50 },
  webview: { flex: 1 },
  userInfo: { padding: 20, alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 20 },
  profileImage: { width: 100, height: 100, borderRadius: 50, marginVertical: 10 },
  apiContainer: {
    marginVertical: 10,
    maxHeight: 200,
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 10,
  },
});

export default LinkedInLogin;
