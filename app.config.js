export default {
  expo: {
    name: "BeatMotion",
    slug: "BeatMotion-Diria",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/BeatMotionLogo.png",
    scheme: "beatmotiondiria",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      bundleIdentifier: "com.andreydev.beatmotion",
      supportsTablet: true,
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
      },
    },
    owner: "beatmotion",
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/BeatMotionLogo.png",
        backgroundColor: "#000000",
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      package: "com.andreydev.BeatMotionDiria",
    },
    web: {
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
          dark: {
            backgroundColor: "#000000",
          },
        },
      ],
      "expo-web-browser",
      [
        "expo-notifications",
        {
          icon: "./assets/images/BeatMotionLogo.png",
          color: "#000000",
        },
      ],
      [
        "@sentry/react-native/expo",
        {
          url: "https://sentry.io/",
          project: "react-native",
          organization: "beatmotion",
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: false,
    },
    extra: {
      eas: {
        projectId: "e88f7e8e-f8d4-4a7f-bd33-507f1afc4cf2",
      },
    },
  },
};
