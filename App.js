import { useContext, useCallback, useEffect, useMemo, useState } from "react";
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import Constants from "expo-constants";
import * as SplashScreen from "expo-splash-screen";
import { Animated, StyleSheet, View} from "react-native";

import { Colors } from './src/constants/styles';
import LoginScreen from './src/screens/LoginScreen';
import PrincipalScreen from './src/screens/PrincipalScreen';
import AuthContextProvider, { AuthContext } from './src/store/auth-context';
import IconButton from './src/components/ui/IconButton';
import { useFonts, Monda_400Regular, Monda_700Bold } from '@expo-google-fonts/monda';

// Inicializar App y Auth
import './src/util/auth'


// Instruct SplashScreen not to hide yet, we want to do this manually
SplashScreen.preventAutoHideAsync().catch(() => {
  /* reloading the app might trigger some race conditions, ignore them */
});
const Stack = createNativeStackNavigator();


function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: Colors.muyClaro },
        headerTintColor: Colors.muyOscuro,
        contentStyle: { backgroundColor: Colors.claro },
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} options={{
        title: 'Ingreso',
        headerTitleStyle: {
          fontFamily: 'Monda_700Bold'
        }
      }}/>
    </Stack.Navigator>
  );
}

function AuthenticatedStack() {
  const authCtx = useContext(AuthContext);
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: Colors.muyClaro },
        headerTintColor: Colors.muyOscuro,
        contentStyle: { backgroundColor: Colors.claro },
      }}
    >
      <Stack.Screen
        name="Cuenta"
        component={PrincipalScreen}
        options={{
          headerTitleStyle: {
            fontFamily: 'Monda_700Bold'
          },
          headerRight: ({ tintColor }) => (
            <IconButton
              icon="exit"
              color={tintColor}
              size={24}
              onPress={authCtx.logout}
            />
          ),
        }}
      />
    </Stack.Navigator>
  );
}

function Navigation() {
  const authCtx = useContext(AuthContext);

  return (
    <NavigationContainer>
      {!authCtx.email && <AuthStack />}
      {!!authCtx.email && <AuthenticatedStack />}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <>
      <AnimatedSplashScreen image={require('./assets/splash.png')}>
        <StatusBar />
        <MainScreen />
      </AnimatedSplashScreen>
    </>
  );
}

function AnimatedSplashScreen({ children, image }) {
  let [fontsLoaded] = useFonts({
      Monda_400Regular,
      Monda_700Bold
  });

  const animation = useMemo(() => new Animated.Value(1), []);
  const [isAppReady, setAppReady] = useState(false);
  const [isSplashAnimationComplete, setAnimationComplete] = useState(false);

  const onImageLoaded = useCallback(async () => {
    try {
      setTimeout(() => SplashScreen.hideAsync(), 300);
    } catch (e) {

    } finally {
      setAppReady(true);
    }
  }, []);

  useEffect(() => {
    if (isAppReady) {
      Animated.timing(animation, {
        toValue: 8,
        duration: 700,
        useNativeDriver: true,
      }).start(() => setAnimationComplete(true));
    }
  }, [isAppReady]);

  return (
    <View style={{ flex: 1 }}>
      {isAppReady && children}
      {!isSplashAnimationComplete && fontsLoaded && (
        <Animated.View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: Constants.manifest.splash.backgroundColor,
              // opacity: animation,
            },
          ]}
        >
          <Animated.Image
            style={{
              width: "100%",
              height: "100%",
              resizeMode: Constants.manifest.splash.resizeMode || "contain",
              transform: [
                {
                  scale: animation,
                },
              ],
            }}
            source={image}
            onLoadEnd={onImageLoaded}
            fadeDuration={0}
          />
        </Animated.View>
      )}
    </View>
  );
}

function MainScreen() {
  return (
    <AuthContextProvider>
      <Navigation />
    </AuthContextProvider>
  );
}
