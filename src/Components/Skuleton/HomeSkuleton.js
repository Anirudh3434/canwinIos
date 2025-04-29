// HomeSkeleton.js
import React from 'react';
import { View, Dimensions, ScrollView, StyleSheet, StatusBar, SafeAreaView } from 'react-native';
import { Colors } from '../../theme/color';
import style from '../../theme/style';
import { AppBar } from '@react-native-material/core';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder'; // Popular skeleton package

const width = Dimensions.get('screen').width;
const height = Dimensions.get('screen').height;

export default function HomeSkeleton() {
  return (
    <SafeAreaView style={[style.area, { backgroundColor: Colors.bg }]}>
      <StatusBar backgroundColor={Colors.bg} translucent={false} barStyle="dark-content" />
      <View style={{ flex: 1 }}>
        {/* Header Skeleton */}
        <AppBar
          color={Colors.bg}
          elevation={6}
          style={{ paddingHorizontal: 10, paddingVertical: 10 }}
          leading={
            <View style={{ width: 300, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <SkeletonPlaceholder>
                <SkeletonPlaceholder.Item width={20} height={20} borderRadius={4} />
              </SkeletonPlaceholder>
              <SkeletonPlaceholder>
                <SkeletonPlaceholder.Item width={280} height={40} borderRadius={20} marginLeft={20} />
              </SkeletonPlaceholder>
            </View>
          }
          trailing={
            <SkeletonPlaceholder>
              <SkeletonPlaceholder.Item width={22} height={22} borderRadius={4} />
            </SkeletonPlaceholder>
          }
        />

        <View style={{ backgroundColor: Colors.bg, flex: 1, paddingBottom: 10 }}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 0 }}>
            {/* User Cards Skeleton */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 20, paddingHorizontal: 15 }}>
              {[1, 2, 3].map((_, index) => (
                <View key={index} style={styles.card}>
                  <SkeletonPlaceholder>
                    <SkeletonPlaceholder.Item flexDirection="row" alignItems="center">
                      <SkeletonPlaceholder.Item width={40} height={40} borderRadius={20} />
                      <SkeletonPlaceholder.Item marginLeft={20}>
                        <SkeletonPlaceholder.Item width={100} height={12} borderRadius={4} />
                        <SkeletonPlaceholder.Item marginTop={6} width={80} height={8} borderRadius={4} />
                        <SkeletonPlaceholder.Item marginTop={10} width={60} height={10} borderRadius={4} />
                      </SkeletonPlaceholder.Item>
                    </SkeletonPlaceholder.Item>
                  </SkeletonPlaceholder>
                </View>
              ))}
            </ScrollView>

            {/* For You Section Skeleton */}
            <SkeletonPlaceholder>
              <SkeletonPlaceholder.Item marginTop={15} marginLeft={15}>
                <SkeletonPlaceholder.Item width={120} height={18} borderRadius={4} />
              </SkeletonPlaceholder.Item>
            </SkeletonPlaceholder>

            <View style={{ alignItems: 'center', marginTop: 10 }}>
              <SkeletonPlaceholder>
                <SkeletonPlaceholder.Item width={width - 30} height={height / 5} borderRadius={8} />
              </SkeletonPlaceholder>
            </View>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 10,
              }}>
              <View style={[style.indicator]}></View>
              <View style={[style.indicator]}></View>
              <View style={[style.indicator, { paddingHorizontal: 16, backgroundColor: Colors.primary }]}></View>
            </View>

            {/* Recommended Jobs Skeleton */}
            <SkeletonPlaceholder>
              <SkeletonPlaceholder.Item marginTop={20} marginLeft={15}>
                <SkeletonPlaceholder.Item width={180} height={18} borderRadius={4} />
              </SkeletonPlaceholder.Item>
            </SkeletonPlaceholder>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingHorizontal: 10, marginTop: 10 }}>
              {[1, 2, 3].map((_, index) => (
                <View key={`recommended-${index}`} style={styles.jobCardContainer}>
                  <SkeletonPlaceholder>
                    <SkeletonPlaceholder.Item width={250} height={160} borderRadius={8}>
                      <SkeletonPlaceholder.Item width={35} height={35} borderRadius={5} />
                      <SkeletonPlaceholder.Item marginTop={12}>
                        <SkeletonPlaceholder.Item width={150} height={16} borderRadius={4} />
                        <SkeletonPlaceholder.Item marginTop={6} width={100} height={12} borderRadius={4} />
                        <SkeletonPlaceholder.Item marginTop={12} flexDirection="row" alignItems="center">
                          <SkeletonPlaceholder.Item width={12} height={12} borderRadius={6} />
                          <SkeletonPlaceholder.Item marginLeft={5} width={80} height={10} borderRadius={4} />
                        </SkeletonPlaceholder.Item>
                        <SkeletonPlaceholder.Item marginTop={8} flexDirection="row" alignItems="center">
                          <SkeletonPlaceholder.Item width={12} height={12} borderRadius={6} />
                          <SkeletonPlaceholder.Item marginLeft={5} width={60} height={10} borderRadius={4} />
                        </SkeletonPlaceholder.Item>
                      </SkeletonPlaceholder.Item>
                    </SkeletonPlaceholder.Item>
                  </SkeletonPlaceholder>
                </View>
              ))}
            </ScrollView>

            {/* Recent Jobs Skeleton */}
            <SkeletonPlaceholder>
              <SkeletonPlaceholder.Item marginTop={20} marginLeft={15}>
                <SkeletonPlaceholder.Item width={120} height={18} borderRadius={4} />
              </SkeletonPlaceholder.Item>
            </SkeletonPlaceholder>

            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              style={{ paddingHorizontal: 10, marginTop: 10, paddingBottom: 20 }}
            >
              {[1, 2, 3].map((_, index) => (
                <View key={`recent-${index}`} style={styles.jobCardContainer}>
                  <SkeletonPlaceholder>
                    <SkeletonPlaceholder.Item width={250} height={160} borderRadius={8}>
                      <SkeletonPlaceholder.Item width={35} height={35} borderRadius={5} />
                      <SkeletonPlaceholder.Item marginTop={12}>
                        <SkeletonPlaceholder.Item width={150} height={16} borderRadius={4} />
                        <SkeletonPlaceholder.Item marginTop={6} width={100} height={12} borderRadius={4} />
                        <SkeletonPlaceholder.Item marginTop={12} flexDirection="row" alignItems="center">
                          <SkeletonPlaceholder.Item width={12} height={12} borderRadius={6} />
                          <SkeletonPlaceholder.Item marginLeft={5} width={80} height={10} borderRadius={4} />
                        </SkeletonPlaceholder.Item>
                        <SkeletonPlaceholder.Item marginTop={8} flexDirection="row" alignItems="center">
                          <SkeletonPlaceholder.Item width={12} height={12} borderRadius={6} />
                          <SkeletonPlaceholder.Item marginLeft={5} width={60} height={10} borderRadius={4} />
                        </SkeletonPlaceholder.Item>
                      </SkeletonPlaceholder.Item>
                    </SkeletonPlaceholder.Item>
                  </SkeletonPlaceholder>
                </View>
              ))}
            </ScrollView>
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  card: {
    minWidth: 220,
    height: 80,
    borderWidth: 1,
    borderColor: '#E8E8E8FF',
    borderRadius: 8,
    shadowColor: Colors.active,
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 5,
    padding: 10,
    backgroundColor: '#FFFFFF',
  },
  jobCardContainer: {
    padding: 5,
    marginBottom: 5,
    marginRight: 10,
  }
});