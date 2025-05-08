// ComHomeSkeleton.js
import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Colors } from '../../theme/color';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';

const { width } = Dimensions.get('window');

const JobCardSkeletonItem = () => (
  <View style={styles.jobCardContainer}>
    <SkeletonPlaceholder>
      <View style={styles.jobCard}>
        <View style={styles.jobCardHeader}>
          <View style={styles.logoSkeleton} />
          <View>
            <View style={styles.titleSkeleton} />
            <View style={styles.subtitleSkeleton} />
          </View>
        </View>
        <View style={styles.detailsRow}>
          <View style={styles.detailSkeleton} />
          <View style={styles.detailSkeleton} />
        </View>
        <View style={styles.skillsRow}>
          <View style={styles.skillSkeleton} />
          <View style={styles.skillSkeleton} />
          <View style={styles.skillSkeleton} />
        </View>
        <View style={styles.actionsRow}>
          <View style={styles.actionSkeleton} />
          <View style={styles.actionSkeleton} />
        </View>
      </View>
    </SkeletonPlaceholder>
  </View>
);

const SeekerCardSkeletonItem = () => (
  <View style={styles.seekerCardContainer}>
    <SkeletonPlaceholder>
      <View style={styles.seekerCard}>
        <View style={styles.profileRow}>
          <View style={styles.avatarSkeleton} />
          <View>
            <View style={styles.nameSkeleton} />
            <View style={styles.dateSkeleton} />
          </View>
        </View>
        <View style={styles.skillsRow}>
          <View style={styles.skillSkeleton} />
          <View style={styles.skillSkeleton} />
          <View style={styles.skillSkeleton} />
        </View>
        <View style={styles.actionsRow}>
          <View style={styles.actionSkeleton} />
          <View style={styles.actionSkeleton} />
        </View>
      </View>
    </SkeletonPlaceholder>
  </View>
);

const ComHomeSkeleton = () => {
  return (
    <View style={styles.container}>
      {/* AppBar skeleton */}
      <View style={styles.appBarContainer}>
        <SkeletonPlaceholder>
          <View style={styles.appBar}>
            <View style={styles.appBarLeft}>
              <View style={styles.menuIconSkeleton} />
              <View style={styles.nameSkeleton} />
            </View>
            <View style={styles.appBarRight}>
              <View style={styles.notificationSkeleton} />
              <View style={styles.profileSkeleton} />
            </View>
          </View>
        </SkeletonPlaceholder>
      </View>

      {/* Search box skeleton */}
      <View style={styles.searchBoxContainer}>
        <SkeletonPlaceholder>
          <View style={styles.searchBox} />
        </SkeletonPlaceholder>
      </View>

      {/* Section header skeleton */}
      <View style={styles.sectionContainer}>
        <SkeletonPlaceholder>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleSkeleton} />
            <View style={styles.seeAllSkeleton} />
          </View>
        </SkeletonPlaceholder>
      </View>

      {/* Job cards skeleton */}
      <View style={styles.horizontalList}>
        <JobCardSkeletonItem />
        <JobCardSkeletonItem />
      </View>

      {/* Resume section skeleton */}
      <View style={styles.resumeSectionContainer}>
        <SkeletonPlaceholder>
          <View style={styles.resumeSection} />
        </SkeletonPlaceholder>
      </View>

      {/* Section header skeleton */}
      <View style={styles.sectionContainer}>
        <SkeletonPlaceholder>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleSkeleton} />
            <View style={styles.seeAllSkeleton} />
          </View>
        </SkeletonPlaceholder>
      </View>

      {/* Seeker cards skeleton */}
      <View style={styles.horizontalList}>
        <SeekerCardSkeletonItem />
        <SeekerCardSkeletonItem />
      </View>

      {/* Section header skeleton */}
      <View style={styles.sectionContainer}>
        <SkeletonPlaceholder>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleSkeleton} />
            <View style={styles.seeAllSkeleton} />
          </View>
        </SkeletonPlaceholder>
      </View>

      {/* Seeker cards skeleton */}
      <View style={styles.horizontalList}>
        <SeekerCardSkeletonItem />
        <SeekerCardSkeletonItem />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  appBarContainer: {
    paddingHorizontal: 10,
    paddingVertical: 15,
  },
  appBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '70%',
  },
  menuIconSkeleton: {
    width: 20,
    height: 20,
    borderRadius: 4,
    marginRight: 15,
  },
  nameSkeleton: {
    width: 150,
    height: 20,
    borderRadius: 4,
  },
  appBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationSkeleton: {
    width: 25,
    height: 25,
    borderRadius: 12.5,
    marginRight: 20,
  },
  profileSkeleton: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  searchBoxContainer: {
    paddingHorizontal: 20,
    marginVertical: 10,
  },
  searchBox: {
    width: '100%',
    height: 40,
    borderRadius: 20,
  },
  sectionContainer: {
    paddingHorizontal: 20,
    marginTop: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitleSkeleton: {
    width: 120,
    height: 18,
    borderRadius: 4,
  },
  seeAllSkeleton: {
    width: 50,
    height: 16,
    borderRadius: 4,
  },
  horizontalList: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 10,
  },
  jobCardContainer: {
    width: width * 0.7,
    marginRight: 15,
  },
  jobCard: {
    padding: 15,
    borderRadius: 12,
    height: 180,
  },
  jobCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  logoSkeleton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  titleSkeleton: {
    width: 120,
    height: 16,
    borderRadius: 4,
    marginBottom: 5,
  },
  subtitleSkeleton: {
    width: 80,
    height: 14,
    borderRadius: 4,
  },
  detailsRow: {
    marginBottom: 10,
  },
  detailSkeleton: {
    width: '60%',
    height: 14,
    borderRadius: 4,
    marginBottom: 5,
  },
  skillsRow: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  skillSkeleton: {
    width: 60,
    height: 24,
    borderRadius: 12,
    marginRight: 5,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionSkeleton: {
    width: '45%',
    height: 32,
    borderRadius: 16,
  },
  resumeSectionContainer: {
    paddingHorizontal: 20,
    marginVertical: 15,
  },
  resumeSection: {
    width: '100%',
    height: 50,
    borderRadius: 20,
  },
  seekerCardContainer: {
    width: width * 0.7,
    marginRight: 15,
  },
  seekerCard: {
    padding: 15,
    borderRadius: 12,
    height: 170,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatarSkeleton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  dateSkeleton: {
    width: 80,
    height: 14,
    borderRadius: 4,
  },
});

export default ComHomeSkeleton;
