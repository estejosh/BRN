/**
 * BRN (Burning) App
 * Main application component with navigation
 */

import React from 'react';
import { StatusBar, View, StyleSheet } from 'react-native';
import MainTabNavigator from './navigation/MainTabNavigator';

export default function App() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
      <MainTabNavigator />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
});




