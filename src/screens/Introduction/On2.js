import {
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  StatusBar,
  Platform,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { Colors } from '../../theme/color';
import style from '../../theme/style';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_ENDPOINTS } from '../../api/apiConfig';

const width = Dimensions.get('screen').width;

const JOB_ROLES = [
  { title: 'Designer', icon: require('../../../assets/image/s1.png') },
  { title: 'Developer', icon: require('../../../assets/image/s2.png') },
  { title: 'Marketing', icon: require('../../../assets/image/s3.png') },
  { title: 'Management', icon: require('../../../assets/image/s4.png') },
  { title: 'Research and Analytics', icon: require('../../../assets/image/s5.png') },
  { title: 'Information Technology', icon: require('../../../assets/image/s6.png') },
];

export default function On2() {
  const navigation = useNavigation();
  const [prefered_job_role, setPreferedJobRole] = useState('');
  const [userid, setUserId] = useState();
  const [roleId, setRoleId] = useState();
  const [step, setStep] = useState(0);

  useEffect(() => {
    const fetchUserId = async () => {
      const userId = await AsyncStorage.getItem('userId');
      const roleId = await AsyncStorage.getItem('roleId');
      setUserId(+userId);
      setRoleId(+roleId);
    };
    fetchUserId();
  }, []);

  const handleSubmit = async () => {
    if (!prefered_job_role) {
      alert('Please select a job role.');
      return;
    }

    const data = {
      userId: userid,
      prefered_job_role: prefered_job_role,
    };

    try {
      const response = await axios.post(API_ENDPOINTS.CAREER, data);
      console.log(response.data);

      if (response.data.status === 'success') {
        try {
          // Fix: Pass user_id as query param
          const getStepResponse = await axios.get(`${API_ENDPOINTS.STEP}?user_id=${userid}`);

          if (getStepResponse.data.status === 'success') {
            const currentStep = getStepResponse.data.data.steps;
            setStep(currentStep);

            // Post new step
            const stepResponse = await axios.post(API_ENDPOINTS.STEP, {
              user_id: userid,
              role_id: roleId,
              steps: currentStep + 1,
            });

            console.log(stepResponse.data);
            if (stepResponse.data.status === 'success') {
              navigation.navigate('Validate');
            }
          }
        } catch (error) {
          console.log('Step update error:', error);
        }
      }
    } catch (error) {
      console.log('Career post error:', error);
    }
  };

  return (
    <SafeAreaView style={[style.area, { backgroundColor: Colors.bg }]}>
      <StatusBar backgroundColor={Colors.bg} translucent barStyle={'dark-content'} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView style={{ flex: 1 }}>
          <View style={[style.main, { backgroundColor: Colors.bg }]}>
            <Text
              style={[style.s22, { color: Colors.txt, marginTop: Platform.OS === 'ios' ? 10 : 30 }]}
            >
              What type of Job are you looking for?
            </Text>

            <View style={{ marginTop: 20 }}>
              {JOB_ROLES.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setPreferedJobRole(item.title)}
                  style={[
                    style.shadow,
                    {
                      backgroundColor: Colors.bg,
                      shadowColor: Colors.active,
                      padding: 15,
                      borderRadius: 30,
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginVertical: 6,
                      borderWidth: prefered_job_role === item.title ? 2 : 0,
                      borderColor: Colors.primary,
                    },
                  ]}
                >
                  <Image
                    source={item.icon}
                    resizeMode="stretch"
                    style={{ height: 30, width: 30 }}
                  />
                  <Text style={[style.r15, { color: Colors.txt1, marginLeft: 10, flex: 1 }]}>
                    {item.title}
                  </Text>
                  {prefered_job_role === item.title && (
                    <Icon name="checkbox" size={24} color={Colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity onPress={handleSubmit} style={[style.btn, { marginVertical: 20 }]}>
              <Text style={[style.btntxt]}>PROCEED</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
