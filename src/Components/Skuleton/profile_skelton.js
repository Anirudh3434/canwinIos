"use client"
import { View, SafeAreaView, Dimensions, StatusBar, ScrollView, StyleSheet, Animated, Easing } from "react-native"
import { useEffect, useRef } from "react"
import style from "../../theme/style"
import { Colors } from "../../theme/color"

const { width } = Dimensions.get("window")

const SkeletonPlaceholder = ({ width, height, style }) => {
  const animatedValue = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.loop(
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 1500,
        easing: Easing.bezier(0.4, 0.0, 0.2, 1),
        useNativeDriver: false,
      }),
    ).start()
  }, [])

  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ["#E5E5EA", "#F2F2F7", "#E5E5EA"],
  })

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius: 4,
          backgroundColor,
        },
        style,
      ]}
    />
  )
}

export default function ProfileSkeleton() {
  return (
    <SafeAreaView style={[style.area, { backgroundColor: Colors.bg, padding: 0 }]}>
      <StatusBar backgroundColor="#FFFDF7" translucent={false} barStyle={"dark-content"} />
      <ScrollView showsVerticalScrollIndicator={false} style={{ paddingBottom: 60 }}>
        <View style={{ backgroundColor: Colors.bg }}>
          {/* Menu Icon Placeholder */}
          <View
            style={{
              position: "absolute",
              zIndex: 123,
              top: 17,
              left: 5,
              height: 40,
              width: 40,
            }}
          >
            <SkeletonPlaceholder width={16} height={16} style={{ margin: 12 }} />
          </View>

          {/* Background Blur Image */}
          <View style={[style.blurPic, { height: 200, backgroundColor: "#FFFDF7", opacity: 0.9 }]}>
            <SkeletonPlaceholder width={"100%"} height={"100%"} style={{}} />
          </View>

          {/* Profile Section */}
          <View
            style={{
              alignItems: "center",
              marginTop: 160,
              backgroundColor: "#fff",
              borderRadius: 20,
              padding: 16,
            }}
          >
            {/* Profile Image */}
            <View
              style={{
                top: -80,
                alignSelf: "center",
                position: "absolute",
                height: 140,
                width: 140,
                borderRadius: 70,
                overflow: "hidden",
                marginBottom: 16,
              }}
            >
              <SkeletonPlaceholder width={"100%"} height={"100%"} style={{ borderRadius: 70 }} />
            </View>

            {/* Name */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 8,
                marginTop: 70,
                width: "100%",
              }}
            >
              <SkeletonPlaceholder width={150} height={24} style={{ marginRight: 8 }} />
              <SkeletonPlaceholder width={15} height={15} style={{}} />
            </View>

            {/* Headline */}
            <SkeletonPlaceholder width={"80%"} height={40} style={{ marginTop: 8 }} />
          </View>

          {/* Job Search Status */}
          <View
            style={{
              height: 40,
              marginHorizontal: 20,
              marginVertical: 24,
              borderRadius: 30,
            }}
          >
            <SkeletonPlaceholder width={"100%"} height={"100%"} style={{ borderRadius: 30 }} />
          </View>

          {/* Profile Performance Card */}
          <View
            style={{
              marginHorizontal: 20,
              marginBottom: 16,
              borderRadius: 16,
              padding: 20,
            }}
          >
            <SkeletonPlaceholder width={"70%"} height={20} style={{ marginBottom: 16 }} />

            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <SkeletonPlaceholder width={56} height={56} style={{ borderRadius: 30, marginRight: 16 }} />

              <View style={{ flex: 1 }}>
                <SkeletonPlaceholder width={"80%"} height={20} style={{ marginBottom: 4 }} />
                <SkeletonPlaceholder width={"60%"} height={16} style={{ marginBottom: 12 }} />
                <SkeletonPlaceholder width={80} height={16} style={{}} />
              </View>
            </View>
          </View>

          {/* Basic Details Card */}
          <View
            style={{
              marginHorizontal: 20,
              marginBottom: 16,
              borderRadius: 16,
              padding: 20,
            }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 20 }}>
              <SkeletonPlaceholder width={120} height={22} style={{}} />
              <SkeletonPlaceholder width={15} height={15} style={{}} />
            </View>

            <View style={{ gap: 12 }}>
              {[1, 2, 3, 4, 5].map((_, index) => (
                <View key={index} style={{ flexDirection: "row", alignItems: "center" }}>
                  <SkeletonPlaceholder width={24} height={18} style={{ marginRight: 12 }} />
                  <SkeletonPlaceholder width={"70%"} height={16} style={{}} />
                </View>
              ))}
            </View>
          </View>

          {/* Resume Card */}
          <View
            style={{
              marginHorizontal: 20,
              marginBottom: 20,
              borderRadius: 16,
              padding: 20,
            }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 16 }}>
              <SkeletonPlaceholder width={80} height={22} style={{}} />
              <SkeletonPlaceholder width={60} height={16} style={{}} />
            </View>

            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <SkeletonPlaceholder width={48} height={48} style={{ borderRadius: 8, marginRight: 12 }} />
              <View>
                <SkeletonPlaceholder width={200} height={16} style={{ marginBottom: 4 }} />
                <SkeletonPlaceholder width={100} height={14} style={{}} />
              </View>
            </View>
          </View>

          {/* Video Profile */}
          <View
            style={{
              marginHorizontal: 20,
              marginBottom: 20,
              borderRadius: 16,
              padding: 20,
            }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 16 }}>
              <SkeletonPlaceholder width={120} height={22} style={{}} />
              <SkeletonPlaceholder width={40} height={16} style={{}} />
            </View>

            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <SkeletonPlaceholder width={48} height={48} style={{ borderRadius: 8, marginRight: 12 }} />
              <View style={{ flex: 1 }}>
                <SkeletonPlaceholder width={"90%"} height={16} style={{ marginBottom: 4 }} />
                <SkeletonPlaceholder width={"60%"} height={14} style={{}} />
              </View>
            </View>
          </View>

          {/* Profile Summary */}
          <View
            style={{
              marginHorizontal: 20,
              marginBottom: 20,
              borderRadius: 16,
              padding: 20,
            }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 20 }}>
              <SkeletonPlaceholder width={150} height={22} style={{}} />
              <SkeletonPlaceholder width={15} height={15} style={{}} />
            </View>
            <SkeletonPlaceholder width={"100%"} height={60} style={{}} />
          </View>

          {/* Professional Details */}
          <View
            style={{
              marginHorizontal: 20,
              marginBottom: 20,
              borderRadius: 16,
              padding: 20,
            }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 20 }}>
              <SkeletonPlaceholder width={180} height={22} style={{}} />
              <SkeletonPlaceholder width={15} height={15} style={{}} />
            </View>

            {[1, 2, 3, 4].map((_, index) => (
              <View key={index} style={{ marginBottom: index !== 3 ? 12 : 0 }}>
                <SkeletonPlaceholder width={120} height={14} style={{ marginBottom: 4 }} />
                <SkeletonPlaceholder width={"70%"} height={16} style={{}} />
              </View>
            ))}
          </View>

          {/* Key Skills */}
          <View
            style={{
              marginHorizontal: 20,
              borderRadius: 16,
              padding: 20,
            }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 20 }}>
              <SkeletonPlaceholder width={100} height={22} style={{}} />
              <SkeletonPlaceholder width={15} height={15} style={{}} />
            </View>

            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {[1, 2, 3, 4, 5].map((_, index) => (
                <SkeletonPlaceholder key={index} width={80} height={28} style={{ borderRadius: 16 }} />
              ))}
            </View>
          </View>

          {/* Employment Details */}
          <View
            style={{
              marginHorizontal: 20,
              marginBottom: 20,
              marginTop: 20,
              borderRadius: 16,
              padding: 20,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 16,
              }}
            >
              <SkeletonPlaceholder width={120} height={22} style={{}} />
              <SkeletonPlaceholder width={40} height={16} style={{}} />
            </View>

            {[1, 2].map((_, index) => (
              <View
                key={index}
                style={{
                  marginBottom: 12,
                  paddingBottom: 20,
                }}
              >
                <SkeletonPlaceholder width={"60%"} height={18} style={{ marginBottom: 8 }} />
                <SkeletonPlaceholder width={"40%"} height={14} style={{ marginBottom: 4 }} />
                <SkeletonPlaceholder width={"30%"} height={14} style={{}} />
              </View>
            ))}
          </View>

          {/* Projects */}
          <View
            style={{
              marginHorizontal: 20,
              marginBottom: 20,
              borderRadius: 16,
              padding: 20,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 16,
              }}
            >
              <SkeletonPlaceholder width={80} height={22} style={{}} />
              <SkeletonPlaceholder width={40} height={16} style={{}} />
            </View>

            {[1, 2].map((_, index) => (
              <View
                key={index}
                style={{
                  marginBottom: 12,
                  paddingBottom: 20,
                }}
              >
                <SkeletonPlaceholder width={"70%"} height={18} style={{ marginBottom: 8 }} />
                <SkeletonPlaceholder width={"40%"} height={14} style={{ marginBottom: 4 }} />
                <SkeletonPlaceholder width={"50%"} height={14} style={{}} />
              </View>
            ))}
          </View>

          {/* Education */}
          <View
            style={{
              marginHorizontal: 20,
              marginBottom: 20,
              borderRadius: 16,
              padding: 20,
            }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 16 }}>
              <SkeletonPlaceholder width={100} height={22} style={{}} />
              <SkeletonPlaceholder width={40} height={16} style={{}} />
            </View>

            {[1, 2].map((_, index) => (
              <View
                key={index}
                style={{
                  marginBottom: 12,
                  paddingBottom: 10,
                }}
              >
                <View
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >
                  <SkeletonPlaceholder width={"80%"} height={18} style={{}} />
                  <SkeletonPlaceholder width={15} height={15} style={{}} />
                </View>
                <SkeletonPlaceholder width={"60%"} height={14} style={{ marginBottom: 4 }} />
                <SkeletonPlaceholder width={"30%"} height={14} style={{}} />
              </View>
            ))}
          </View>

          {/* Personal Details */}
          <View
            style={{
              marginHorizontal: 20,
              marginBottom: 20,
              borderRadius: 16,
              padding: 20,
            }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 20 }}>
              <SkeletonPlaceholder width={150} height={22} style={{}} />
              <SkeletonPlaceholder width={15} height={15} style={{}} />
            </View>

            {[1, 2, 3, 4, 5].map((_, index) => (
              <View key={index} style={{ marginBottom: 12 }}>
                <SkeletonPlaceholder width={80} height={14} style={{ marginBottom: 4 }} />
                <SkeletonPlaceholder width={"50%"} height={16} style={{}} />
              </View>
            ))}
          </View>

          {/* Languages */}
          <View
            style={{
              marginHorizontal: 20,
              marginBottom: 20,
              borderRadius: 16,
              padding: 20,
            }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 16 }}>
              <SkeletonPlaceholder width={100} height={22} style={{}} />
              <SkeletonPlaceholder width={40} height={16} style={{}} />
            </View>

            {[1, 2].map((_, index) => (
              <View key={index} style={{ marginBottom: 12 }}>
                <SkeletonPlaceholder width={120} height={18} style={{ marginBottom: 4 }} />
                <SkeletonPlaceholder width={80} height={14} style={{}} />
              </View>
            ))}
          </View>

          {/* Career Preference */}
          <View
            style={{
              marginHorizontal: 20,
              marginBottom: 20,
              borderRadius: 16,
              padding: 20,
            }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 20 }}>
              <SkeletonPlaceholder width={160} height={22} style={{}} />
              <SkeletonPlaceholder width={15} height={15} style={{}} />
            </View>

            <View
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                gap: 4,
              }}
            >
              {/* Left Column */}
              <View style={{ width: "48%" }}>
                {[1, 2, 3].map((_, index) => (
                  <View key={index} style={{ marginBottom: 12 }}>
                    <SkeletonPlaceholder width={"80%"} height={12} style={{ marginBottom: 4 }} />
                    <SkeletonPlaceholder width={"90%"} height={14} style={{}} />
                  </View>
                ))}
              </View>

              {/* Right Column */}
              <View style={{ width: "48%" }}>
                {[1, 2, 3].map((_, index) => (
                  <View key={index} style={{ marginBottom: 12 }}>
                    <SkeletonPlaceholder width={"80%"} height={12} style={{ marginBottom: 4 }} />
                    <SkeletonPlaceholder width={"90%"} height={14} style={{}} />
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
})
