'use client';

import {
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Animated,
} from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { Colors } from '../../theme/color';
import { useNavigation } from '@react-navigation/native';
import IntroItem from './IntroItem';
import Slides from './Slides';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('screen');

export default function Introduction() {
  const navigation = useNavigation();
  const ref = useRef(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Create animated values for circle sizes and z-indices
  const largeCircleSize = useRef(new Animated.Value(700)).current;
  const smallCircleSize = useRef(new Animated.Value(600)).current;
  const largeCircleZIndex = useRef(new Animated.Value(1)).current;
  const smallCircleZIndex = useRef(new Animated.Value(2)).current;

  console.log('Introduction page');

  useEffect(() => {
    const checkUser = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('userId');
        if (storedUserId) {
          navigation.navigate('Validate');
        }
      } catch (error) {
        console.error('❌ Error fetching user ID:', error);
      }
    };
    checkUser();
  }, [navigation]);

  // Animate circle sizes and z-indices based on slide index
  useEffect(() => {
    animateCircles();
  }, [currentSlideIndex]);

  const animateCircles = () => {
    setIsAnimating(true);

    // Different animations for each slide
    const config = {
      duration: 800,
      useNativeDriver: false,
    };

    // Reset z-indices first to avoid visual glitches
    Animated.parallel([
      Animated.timing(largeCircleZIndex, {
        toValue: currentSlideIndex % 2 === 0 ? 1 : 2,
        duration: 0,
        useNativeDriver: false,
      }),
      Animated.timing(smallCircleZIndex, {
        toValue: currentSlideIndex % 2 === 0 ? 2 : 1,
        duration: 0,
        useNativeDriver: false,
      }),
    ]).start();

    // Then animate the sizes
    Animated.parallel([
      Animated.timing(largeCircleSize, {
        toValue: currentSlideIndex % 2 === 0 ? 700 : 400,
        ...config,
      }),
      Animated.timing(smallCircleSize, {
        toValue: currentSlideIndex % 2 === 0 ? 400 : 700,
        ...config,
      }),
    ]).start(() => {
      setIsAnimating(false);
    });
  };

  const Footer = () => {
    return (
      <View style={styles.footer}>
        <View style={styles.indicators}>
          {Slides.map((_, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.indicator, currentSlideIndex === index && styles.activeIndicator]}
              onPress={() => {
                if (!isAnimating) {
                  ref.current?.scrollToOffset({ offset: index * width });
                  setCurrentSlideIndex(index);
                }
              }}
            />
          ))}
        </View>
        <TouchableOpacity onPress={goNextSlide} style={styles.nextButton} disabled={isAnimating}>
          <Text style={styles.nextButtonText}>
            {currentSlideIndex === Slides.length - 1 ? 'NEXT' : 'NEXT'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const updateCurrentSlideIndex = (e) => {
    const contentOffsetX = e.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(contentOffsetX / width);
    setCurrentSlideIndex(currentIndex);
  };

  const goNextSlide = () => {
    if (isAnimating) return;

    const nextSlideIndex = currentSlideIndex + 1;

    // Check if we're at the last slide
    if (nextSlideIndex === Slides.length) {
      navigation.navigate('On1');
      return;
    }

    // Scroll to next slide
    ref.current?.scrollToOffset({
      offset: nextSlideIndex * width,
      animated: true,
    });

    // Update current slide index
    setCurrentSlideIndex(nextSlideIndex);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: '#F5FBF6' }]}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />
      <FlatList
        data={Slides}
        ref={ref}
        renderItem={({ item }) => (
          <IntroItem
            item={item}
            largeCircleSize={largeCircleSize}
            smallCircleSize={smallCircleSize}
            largeCircleZIndex={largeCircleZIndex}
            smallCircleZIndex={smallCircleZIndex}
          />
        )}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        bounces={false}
        keyExtractor={(item) => item.id}
        onMomentumScrollEnd={updateCurrentSlideIndex}
        scrollEnabled={!isAnimating}
      />
      <Footer />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 30,
    paddingHorizontal: 20,
    backgroundColor: Colors.bg,
  },
  indicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  indicator: {
    width: 12,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D6D6D6',
    marginHorizontal: 5,
  },
  activeIndicator: {
    width: 20,
    height: 8,
    borderRadius: 6,
    backgroundColor: Colors.primary,
  },
  nextButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    width: 150,
    paddingHorizontal: 30,
    borderRadius: 10,
    alignItems: 'center',
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
