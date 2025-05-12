import { Tabs } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  // const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  // useEffect(() => {
  //   const checkLoginStatus = async () => {
  //     const loggedIn = await AsyncStorage.getItem('isLoggedIn');
  //     if (loggedIn !== 'true') {
  //       router.push('/login'); // Nếu chưa đăng nhập, chuyển đến trang đăng nhập
  //     } else {
  //       setIsLoggedIn(true);
  //     }
  //   };

  //   checkLoginStatus();
  // }, []);

  // if (!isLoggedIn) {
  //   return null; // Hoặc có thể trả về một loading spinner trong khi kiểm tra
  // }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
          },
          default: {},
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="form"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
