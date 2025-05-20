import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { View } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#2E4E1E', 
        tabBarInactiveTintColor: '#888', 
        tabBarStyle: {
          backgroundColor: '#F2E9D8', 
          borderTopWidth: 0.5,
          borderTopColor: '#B8B8B8', 
          height: 50,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '',
          tabBarIcon: ({ color }) => (
            <Ionicons name="home" size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: '',
          tabBarIcon: ({ color }) => (
            <View
              style={{
                backgroundColor: '#6E8642',
                borderRadius: 12,
                width: 34,
                height: 34,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Ionicons name="add" size={22} color="#fff" />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}