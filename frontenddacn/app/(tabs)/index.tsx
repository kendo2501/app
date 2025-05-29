// app/(tabs)/index.tsx
import React, { useRef } from 'react'; // Bỏ useCallback và useFocusEffect
import { View, StyleSheet } from 'react-native';

import InternalAppNavigator from '../../components/InternalAppNavigator';

interface InternalAppNavigatorHandle {
  resetToHomeScreen: () => void;
}

export default function HomeTabScreen() {
  // Ref vẫn có thể hữu ích nếu bạn muốn gọi resetToHomeScreen từ đây vì một lý do nào đó khác
  const internalAppRef = useRef<InternalAppNavigatorHandle>(null);

  // KHÔNG CÒN useFocusEffect ở đây nữa

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
