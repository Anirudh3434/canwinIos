import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from '../../theme/color';

const VisiblityOptions = ({ navigation }) => {
  const menuItems = [
    { id: 1, title: 'Profile viewing options', route: 'Visiblity' },
    { id: 2, title: 'Profile visit visibility', route: 'ProfileVisitVisibility' },
    { id: 3, title: 'Profile discovery using phone number', route: 'DiscoverByPhone' },
    { id: 4, title: 'Profile discovery using email address', route: 'DiscoverByEmail' },
  ];

  const handleMenuPress = (item) => {
    if (item.route) {
      navigation.navigate(item.route);
    }
  };

  const handleBackPress = () => {
    // Go back to the previous screen
    navigation.goBack();
  };

  const handleLogout = () => {
    console.log('Logging out...');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />

      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <Ionicons name="arrow-back" size={20} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Visibility of your profile & Network</Text>
      </View>

      {/* Menu items */}
      <View style={styles.menuContainer}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.menuItem}
            onPress={() => handleMenuPress(item)}
          >
            <Text style={styles.menuItemText}>{item.title}</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  header: {
    flexDirection: 'column',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 24,
    fontWeight: '400',
  },
  headerTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  menuContainer: {
    marginTop: 16,
    gap: 20,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 1,
    marginHorizontal: 16,
    borderRadius: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
  },
  menuItemText: {
    fontSize: 16,
    color: '#000',
    fontFamily: 'Poppins-Regular',
  },
  chevron: {
    fontSize: 18,
    color: '#aaa',
  },
  logoutContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  logoutButton: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  logoutText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 20,
    color: '#000',
  },
});

export default VisiblityOptions;
