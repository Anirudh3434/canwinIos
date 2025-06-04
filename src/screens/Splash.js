import { View, Dimensions, SafeAreaView, Image, StatusBar, Text } from 'react-native';
import React from 'react';
import style from '../theme/style';
import { Colors } from '../theme/color';
import { useNavigation } from '@react-navigation/native';

const width = Dimensions.get('screen').width;
const height = Dimensions.get('screen').height;

export default function Splash() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={[style.area, { backgroundColor: '#ffffff', flex: 1 }]}>
      <StatusBar translucent={true} backgroundColor={Colors.bg} barStyle="dark-content" />
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Image
          source={require('../../assets/image/canwinLogo3x.png')}
          resizeMode="center"
          style={{
            width: width / 1,
            height: height / 3.5,
            resizeMode: 'stretch',
            alignSelf: 'center',
            marginLeft: 10,
          }}
        />
        <Text style={[style.apptitle, { textAlign: 'center', color: Colors.active }]}>
          Job Finder App
        </Text>
      </View>
    </SafeAreaView>
  );
}
