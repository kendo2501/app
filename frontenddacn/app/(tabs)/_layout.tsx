// app/(tabs)/_layout.tsx
import { Tabs, useRouter } from 'expo-router';
import React, { useEffect, useState, useRef } from 'react'; // useRef đã được import
import { Platform, ActivityIndicator, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import eventBus from '../../untils/eventBus'; // Đảm bảo đường dẫn đúng

// Các import khác của bạn
import { HapticTab } from '../../components/HapticTab';
import { IconSymbol } from '../../components/ui/IconSymbol';
import TabBarBackground from '../../components/ui/TabBarBackground';
import { Colors } from '../../constants/Colors';
import { useColorScheme } from '../../hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  // Ref để đếm số lần nhấn tab "Home"
  // 0: chưa nhấn lần nào (hoặc vừa reset xong)
  // 1: đã nhấn 1 lần
  // 2: nhấn lần thứ 2 -> sẽ reset
  const homeTabPressCountRef = useRef(0);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const loggedIn = await AsyncStorage.getItem('isLoggedIn');
        if (loggedIn === 'true') {
          setIsLoggedIn(true);
        } else {
          router.replace('/login');
        }
      } catch (error) {
        console.error('Lỗi kiểm tra đăng nhập:', error);
        router.replace('/login');
      } finally {
        setIsLoading(false);
      }
    };
    checkLoginStatus();
  }, [router]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].tint} />
      </View>
    );
  }

  if (!isLoggedIn) {
     return null;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: { position: 'absolute' },
          default: {},
        }),
      }}>
      <Tabs.Screen
        name="index" // Màn hình "Home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
        listeners={{
          tabPress: (e) => {
            // Tăng bộ đếm
            homeTabPressCountRef.current += 1;

            if (homeTabPressCountRef.current === 2) {
              // Đây là lần nhấn thứ hai
              console.log('[TabLayout] Home tab pressed for the 2nd time. Emitting reset event.');
              eventBus.emit('resetHomeInternalNavigator');
              // Reset bộ đếm về 0 để chu kỳ tiếp theo lại bắt đầu từ đầu
              homeTabPressCountRef.current = 0;
            } else {
              // Đây là lần nhấn đầu tiên (trong chu kỳ 2 lần nhấn)
              console.log('[TabLayout] Home tab pressed for the 1st time. Next press will reset.');
            }
            // Hành vi điều hướng mặc định của tab vẫn xảy ra.
          },
        }}
      />
      <Tabs.Screen
        name="user" // Màn hình "User"
        options={{
          title: 'User',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
        }}
      />
      {/* Các Tabs.Screen khác */}
    </Tabs>
  );
}