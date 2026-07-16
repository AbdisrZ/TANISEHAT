import React from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

import SplashScreen from './src/screens/SplashScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import HomeScreen from './src/screens/HomeScreen';
import ScanScreen from './src/screens/ScanScreen';
import AnalyzingScreen from './src/screens/AnalyzingScreen';
import ResultScreen from './src/screens/ResultScreen';
import RecommendationScreen from './src/screens/RecommendationScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import GuideScreen from './src/screens/GuideScreen';
import ArticleScreen from './src/screens/ArticleScreen';
import AboutScreen from './src/screens/AboutScreen';
import ScanDetailScreen from './src/screens/ScanDetailScreen';
import MyPlantsScreen from './src/screens/MyPlantsScreen';
import PlantCareDetailScreen from './src/screens/PlantCareDetailScreen';
import { COLORS } from './src/constants/colors';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const EmptyScreen = () => <View />;

function ScanTabButton() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const fabBottom = insets.bottom + 14;

  return (
    <TouchableOpacity
      onPress={() => navigation.navigate('Scan')}
      style={{
        width: 58,
        height: 58,
        borderRadius: 29,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: fabBottom,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.45,
        shadowRadius: 8,
        elevation: 8,
      }}
      activeOpacity={0.85}
    >
      <Ionicons name="camera" size={26} color="#fff" />
    </TouchableOpacity>
  );
}

function MainTabs() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = 62 + insets.bottom;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray500,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          height: tabBarHeight,
          paddingTop: 6,
          paddingBottom: insets.bottom || 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
        tabBarIcon: ({ focused, color, size }) => {
          const icons = {
            HomeTab:     focused ? 'home'            : 'home-outline',
            HistoryTab:  focused ? 'time'            : 'time-outline',
            MyPlantsTab: focused ? 'leaf'            : 'leaf-outline',
            GuideTab:    focused ? 'book'            : 'book-outline',
            AboutTab:    focused ? 'information-circle' : 'information-circle-outline',
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
      })}
    >
      {/* Tab 1 — Beranda */}
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{ tabBarLabel: 'Beranda' }}
      />

      {/* Tab 2 — Riwayat */}
      <Tab.Screen
        name="HistoryTab"
        component={HistoryScreen}
        options={{ tabBarLabel: 'Riwayat' }}
      />

      {/* Tab 3 — Scan (FAB tengah) */}
      <Tab.Screen
        name="ScanTab"
        component={EmptyScreen}
        options={{
          tabBarLabel: () => null,
          tabBarButton: () => <ScanTabButton />,
        }}
      />

      {/* Tab 4 — Tanaman Saya */}
      <Tab.Screen
        name="MyPlantsTab"
        component={MyPlantsScreen}
        options={{ tabBarLabel: 'Tanaman' }}
      />

      {/* Tab 5 — Panduan */}
      <Tab.Screen
        name="GuideTab"
        component={GuideScreen}
        options={{ tabBarLabel: 'Panduan' }}
      />

      {/* Tab 6 — Tentang */}
      <Tab.Screen
        name="AboutTab"
        component={AboutScreen}
        options={{ tabBarLabel: 'Tentang' }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="auto" />
        <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen
          name="Scan"
          component={ScanScreen}
          options={{ animation: 'slide_from_bottom' }}
        />
        <Stack.Screen name="Analyzing" component={AnalyzingScreen} />
        <Stack.Screen name="Result" component={ResultScreen} />
        <Stack.Screen name="Recommendation" component={RecommendationScreen} />
        <Stack.Screen name="Article" component={ArticleScreen} />
        <Stack.Screen name="ScanDetail" component={ScanDetailScreen} />
        <Stack.Screen name="MyPlants" component={MyPlantsScreen} />
        <Stack.Screen name="PlantCareDetail" component={PlantCareDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
    </SafeAreaProvider>
  );
}
