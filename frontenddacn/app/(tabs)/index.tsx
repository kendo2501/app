import React, { useRef } from 'react';
import { View, StyleSheet } from 'react-native';

import InternalAppNavigator from '../../components/InternalAppNavigator';
interface InternalAppNavigatorHandle {
  resetToHomeScreen: () => void;
}

export default function HomeTabScreen() {
  const internalAppRef = useRef<InternalAppNavigatorHandle>(null);

  return (
    <View style={styles.container}>
      <InternalAppNavigator ref={internalAppRef} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
