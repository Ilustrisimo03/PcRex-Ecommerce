import React, { useState, useRef, useEffect } from 'react';
import {
  Dimensions,
  StyleSheet,
  ImageBackground,
  View,
  Animated,
  FlatList,
} from 'react-native';

const { width } = Dimensions.get('window');

const heroData = [
  {
    image: 'https://drive.google.com/uc?export=view&id=1Qjt6Z2ib8DtW4D5FX0NMZsxsm0qu5Vcd',
  },
  {
    image: 'https://drive.google.com/uc?export=view&id=1Qjt6Z2ib8DtW4D5FX0NMZsxsm0qu5Vcd',
  },
  {
    image: 'https://drive.google.com/uc?export=view&id=1Qjt6Z2ib8DtW4D5FX0NMZsxsm0qu5Vcd',
  },
  {
    image: 'https://drive.google.com/uc?export=view&id=1Qjt6Z2ib8DtW4D5FX0NMZsxsm0qu5Vcd',
  },
];

const HeroSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null); // Ref for FlatList

  // Handle scroll to update current index
  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: true }
  );

  // Interpolation for pagination dots
  const indicatorWidth = scrollX.interpolate({
    inputRange: [0, width, width * 2, width * 3],
    outputRange: [8, 8, 8, 8], // Same size for each dot
    extrapolate: 'clamp',
  });

  const translateX = scrollX.interpolate({
    inputRange: [0, width, width * 2, width * 3],
    outputRange: [0, 30, 60, 90], // Adjust based on your design
    extrapolate: 'clamp',
  });

  // Update the current index based on scroll position
  useEffect(() => {
    const listener = scrollX.addListener(({ value }) => {
      setCurrentIndex(Math.floor(value / width));
    });
    return () => {
      scrollX.removeListener(listener);
    };
  }, [scrollX]);

  // Auto scroll effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prevIndex => {
        const nextIndex = (prevIndex + 1) % heroData.length;
        flatListRef.current?.scrollToOffset({
          offset: nextIndex * width,
          animated: true,
        });
        return nextIndex;
      });
    }, 3000); // Scroll every 3 seconds (3000ms)

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, []);

  return (
    <View>
      {/* Wrapping FlatList with Animated.createAnimatedComponent */}
      <Animated.FlatList
        ref={flatListRef}
        data={heroData}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => (
          <ImageBackground
            source={{ uri: item.image }}
            style={styles.heroSection}
            imageStyle={styles.imageStyle}
          />
        )}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      />
      <View style={styles.paginationContainer}>
        {heroData.map((_, index) => (
          <View
            key={index}
            style={[styles.indicator, currentIndex === index && styles.activeIndicator]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  heroSection: {
    width: 330, // Set the width to the full screen width
    height: 200,
    marginRight: 30,
    overflow: 'hidden',
    borderRadius: 12,
    marginBottom: 15,
  },
  imageStyle: {
    borderRadius: 12,
    opacity: 0.9,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  activeIndicator: {
    backgroundColor: 'rgba(255, 255, 255, 1)',
  },
});

export default HeroSlider;
