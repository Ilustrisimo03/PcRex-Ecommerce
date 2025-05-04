import { View, Text, FlatList, Image, Dimensions, StyleSheet, TouchableOpacity } from 'react-native'
import React, { useState, useEffect, useRef } from 'react'

const { width } = Dimensions.get('window')

const HeroSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const sliderRef = useRef(null)

  const data = [
    { id: '1', image: 'https://drive.google.com/uc?export=view&id=1-DRFCc57GZ-aJ9M9twwseelZMsrLqgXd' },
    { id: '2', image: 'https://drive.google.com/uc?export=view&id=1ql_JPQPGvRQGdWrOMpwBITuXt5o2whgP' },
    { id: '3', image: 'https://drive.google.com/uc?export=view&id=1P2v12-v_7Dnpnm08wpw3FVhxahXD678x' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prevIndex => (prevIndex + 1) % data.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (sliderRef.current) {
      sliderRef.current.scrollToIndex({ animated: true, index: currentIndex })
    }
  }, [currentIndex])

  const renderItem = ({ item }) => (
    <TouchableOpacity activeOpacity={0.9} style={styles.slide}>
      <Image source={{ uri: item.image }} style={styles.image} />
    </TouchableOpacity>
  )

  const handleScrollEnd = (e) => {
    const contentOffsetX = e.nativeEvent.contentOffset.x
    const index = Math.floor(contentOffsetX / width)
    setCurrentIndex(index)
  }

  return (
    <View style={styles.container}>
      <FlatList
        ref={sliderRef}
        data={data}
        horizontal
        renderItem={renderItem}
        keyExtractor={item => item.id}
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        snapToInterval={width}
        onMomentumScrollEnd={handleScrollEnd}
      />
      <View style={styles.dotsContainer}>
        {data.map((_, index) => (
          <View
            key={index}
            style={[styles.dot, currentIndex === index && styles.activeDot]}
          />
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 200,
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 20,
  },
  slide: {
    width,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  
  dotsContainer: {
    position: 'absolute',
    bottom: 10,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
  },
  activeDot: {
    backgroundColor: '#fff',
    borderRadius: 4,
    width: 10,
    height: 10,
  },
})

export default HeroSlider
