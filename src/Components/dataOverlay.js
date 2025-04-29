import React, { useRef, useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

const DatePickerOverlay = ({
  onChangeMonth,
  onChangeYear,
  onDateSelect,
  initialMonth,
  initialYear,
}) => {
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sept',
    'Oct',
    'Nov',
    'Dec',
  ];
  const years = Array.from({ length: 12 }, (_, i) => (2024 + i).toString());

  const [month, setMonth] = useState(initialMonth || 'January');
  const [year, setYear] = useState(initialYear || 2024);
  const monthScrollRef = useRef(null);
  const yearScrollRef = useRef(null);
  const ITEM_HEIGHT = 50;

  useEffect(() => {
    if (monthScrollRef.current) {
      const monthIndex = months.indexOf(month);
      if (monthIndex !== -1) {
        monthScrollRef.current.scrollTo({ y: monthIndex * ITEM_HEIGHT, animated: true });
      }
    }
    if (yearScrollRef.current) {
      const yearStr = year.toString();
      const yearIndex = years.indexOf(yearStr);
      if (yearIndex !== -1) {
        yearScrollRef.current.scrollTo({ y: yearIndex * ITEM_HEIGHT, animated: true });
      }
    }
  }, [month, year, months, years]);

  const handleMonthScroll = (event) => {
    const selectedIndex = Math.round(event.nativeEvent.contentOffset.y / ITEM_HEIGHT);
    if (selectedIndex >= 0 && selectedIndex < months.length && months[selectedIndex] !== month) {
      setMonth(months[selectedIndex]);
      if (onChangeMonth) onChangeMonth(months[selectedIndex]);
    }
  };

  const handleYearScroll = (event) => {
    const selectedIndex = Math.round(event.nativeEvent.contentOffset.y / ITEM_HEIGHT);
    if (selectedIndex >= 0 && selectedIndex < years.length) {
      const newYear = parseInt(years[selectedIndex]);
      if (newYear !== year) {
        setYear(newYear);
        if (onChangeYear) onChangeYear(newYear);
      }
    }
  };

  const handleConfirm = () => {
    if (onDateSelect) {
      onDateSelect(month, year);
    }
  };

  const renderScrollItems = (items, selectedItem) => {
    return items.map((item) => (
      <View key={item} style={styles.scrollItem}>
        <Text
          style={[
            styles.scrollItemText,
            item === selectedItem ? styles.selectedItemText : styles.unselectedItemText,
          ]}
        >
          {item}
        </Text>
      </View>
    ));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>
        {month} {year}
      </Text>
      <View style={styles.pickerContainer}>
        <View style={styles.scrollViewWrapper}>
          <ScrollView
            ref={monthScrollRef}
            showsVerticalScrollIndicator={false}
            snapToInterval={ITEM_HEIGHT}
            decelerationRate="fast"
            onScroll={handleMonthScroll}
            scrollEventThrottle={16}
            contentContainerStyle={styles.scrollViewContent}
          >
            {renderScrollItems(months, month)}
          </ScrollView>
          <View style={styles.highlightedMiddle} pointerEvents="none" />
        </View>
        <View style={styles.scrollViewWrapper}>
          <ScrollView
            ref={yearScrollRef}
            showsVerticalScrollIndicator={false}
            snapToInterval={ITEM_HEIGHT}
            decelerationRate="fast"
            onScroll={handleYearScroll}
            scrollEventThrottle={16}
            contentContainerStyle={styles.scrollViewContent}
          >
            {renderScrollItems(years, year.toString())}
          </ScrollView>
          <View style={styles.highlightedMiddle} pointerEvents="none" />
        </View>
      </View>
      <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
        <Text style={styles.confirmButtonText}>Confirm</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    height: 340,
    padding: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  pickerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 40,
  },
  scrollViewWrapper: {
    height: 150,
    width: 100,
    position: 'relative',
  },
  scrollViewContent: {
    paddingVertical: 50,
  },
  scrollItem: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollItemText: {
    fontSize: 24,
  },
  unselectedItemText: {
    fontSize: 18,
    color: 'lightgrey',
  },
  selectedItemText: {
    fontSize: 22,
    color: 'black',
    fontWeight: '700',
  },
  highlightedMiddle: {
    position: 'absolute',
    top: '50%',
    left: 23,
    right: 0,
    height: 50,
    width: 55,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#2D5DE4',
    transform: [{ translateY: -25 }],
  },
  confirmButton: {
    marginTop: 20,
    backgroundColor: '#14B6AA',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default DatePickerOverlay;
