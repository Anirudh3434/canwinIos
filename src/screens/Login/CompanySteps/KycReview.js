import { StyleSheet, Text, View, Image, TouchableOpacity , BackHandler, StatusBar } from 'react-native';
import React, { useState, useEffect } from 'react';
import { Colors } from '../../../theme/color';

const KycReview = () => {
  const [verified, setVerified] = useState(false);
  const [alert, setAlert] = useState({
    image: require('../../../../assets/image/a3.png'),
    message: 'GST Certificate uploaded successfully',
     subMessage: 'We will begin verification shortly.',
  
    TextColor: Colors.primary,
  });

  useEffect(() => {
        const backHandler = BackHandler.addEventListener("hardwareBackPress", () => true)
    const timer = setTimeout(() => {
      setAlert({
        image: require('../../../../assets/image/pending.png'),
        message: 'Verification in progress',
        subMessage: 'Please wait while we verify your certificate.',
        TextColor: 'orange',
      });
    }, 2000);

    return () => {
      clearTimeout(timer);
      backHandler.remove();
    };
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={Colors.bg} />
      <Image source={alert.image} style={styles.image} />

      <Text style={[styles.title, { color: alert.TextColor }]}>{alert.message}</Text>
      <Text style={[styles.subTitle, { color: alert.TextColor }]}>{alert.subMessage}</Text>



      {verified && (
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default KycReview;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    backgroundColor: '#fff',
  },
  image: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    fontFamily: 'Poppins-SemiBold',
    marginTop: 60,
  },
  subTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#667085',
    textAlign: 'center',
    marginTop: 20,
  },
  button: {
    marginTop: 30,
    backgroundColor: Colors.primary,
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 10,
    width: 150,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    color: 'white',
    fontFamily: 'Poppins-Medium',
  },
});
