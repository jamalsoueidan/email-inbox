import { EmailHeader } from "@/components/EmailHeader";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Ionicons } from "@expo/vector-icons";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { TouchableOpacity } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!, {
  unsavedChangesWarning: false,
});

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <ConvexProvider client={convex}>
          <ThemeProvider
            value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
          >
            <Stack
              screenOptions={({ route }) => {
                if (route.name === "conversation/[id]") {
                  console.log(route.params);
                  return {
                    headerShown: true,
                    title: `${route.params?.fromName || "Unknown"}`,
                  };
                }

                if (route.name === "email/[id]") {
                  const { id } = route.params as {
                    id: string;
                  };
                  return {
                    headerShown: true,
                    headerLeft: undefined,
                    headerTitle: () => <EmailHeader id={id} />,
                    headerRight: () => (
                      <TouchableOpacity
                        onPress={() => console.log("Settings pressed")}
                      >
                        <Ionicons
                          name="settings-outline"
                          size={24}
                          color="blue"
                        />
                      </TouchableOpacity>
                    ),
                  };
                }

                return {
                  headerShown: false,
                };
              }}
            >
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="+not-found" />
            </Stack>
            <StatusBar style="auto" />
          </ThemeProvider>
        </ConvexProvider>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
