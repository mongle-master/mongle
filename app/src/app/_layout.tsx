import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// 네이티브 스택 컨테이너. createNativeStackNavigator를 직접 만들지 않고 Expo Router가
// app/ 파일을 native-stack 스크린으로 자동 등록한다 → iOS/Android 전환·엣지 스와이프 백 기본 제공.
// 화면은 딱 2종: index(탭 홈, 스택 바닥)와 webview(상세, url 파라미터만 바꿔 무한 재사용).
export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="webview" />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
