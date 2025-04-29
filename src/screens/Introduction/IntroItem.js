import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Image,
  StatusBar,
  Dimensions,
  StyleSheet,
  Platform,
  Animated,
} from "react-native"
import { Colors } from "../../theme/color"
import { useNavigation } from "@react-navigation/native"

const { width, height } = Dimensions.get("screen")

export default function IntroItem({ item, largeCircleSize, smallCircleSize, largeCircleZIndex, smallCircleZIndex }) {
  const navigation = useNavigation()

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: "#F5FBF6" }]}>
      <StatusBar backgroundColor="#F5FBF6" translucent={true} barStyle="dark-content" />
      <TouchableOpacity style={styles.skipButton} onPress={() => navigation.navigate("On1")}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>
      <View style={styles.imageContainer}>
        <Animated.View
          style={[
            styles.largeCircle,
            {
              width: largeCircleSize,
              height: largeCircleSize,
              borderRadius: Animated.divide(largeCircleSize, 2),
              zIndex: largeCircleZIndex,
            },
          ]}
        />
        <Animated.View
          style={[
            styles.smallCircle,
            {
              width: smallCircleSize,
              height: smallCircleSize,
              borderRadius: Animated.divide(smallCircleSize, 2),
              zIndex: smallCircleZIndex,
            },
          ]}
        />
        <Image source={item.bg} style={styles.image} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.subtitle}>{item.subtitle}</Text>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    width: width,
    backgroundColor: Colors.bg,
  },
  skipButton: {
    position: "absolute",
    top: Platform.OS === "android" ? StatusBar.currentHeight + 10 : 10,
    right: 20,
    zIndex: 10,
  },
  skipText: {
    color: Colors.active,
    fontSize: 16,
  },
  imageContainer: {
    height: "100%",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  largeCircle: {
    backgroundColor: "#F5FBF6",
    position: "absolute",
    marginBottom: 10,
  },
  smallCircle: {
    backgroundColor: "#D9F2EC",
    position: "absolute",
  },
  image: {
    width: width / 1.5,
    height: height / 3,
    resizeMode: "contain",
    zIndex: 3,
  },
  textContainer: {
    position: "absolute",
    bottom: -10,
    height: 250,
    backgroundColor: "white",
    width: "100%",
    paddingHorizontal: 15,
    flex: 0.4,
    justifyContent: "center",
    borderTopRightRadius: 60,
    borderTopLeftRadius: 60,
    marginBottom: 10,
  },
  title: {
    width: 300,
    fontSize: 40,
    fontWeight: "bold",
    color: Colors.active,
    textAlign: "left",
    fontFamily: "Poppins-Bold",
  },
  subtitle: {
    width: 300,
    textAlign: "left",
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "#000000",
    marginTop: 15,
  },
})
