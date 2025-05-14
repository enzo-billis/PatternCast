import { getAuth, onAuthStateChanged } from "@/adapters/auth.adapter";
import { Button, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Input, InputField } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { CACHE_SCALE_KEY } from "@/utils/constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FirebaseAuthTypes } from "@react-native-firebase/auth";
import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";

export default function SettingScreen() {
  const auth = getAuth();
  const router = useRouter();

  const [cacheScale, setCacheScale] = useState(1);
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);

  useEffect(() => {
    const fetchCacheScale = async () => {
      const newCacheScale = await AsyncStorage.getItem(CACHE_SCALE_KEY);
      const parsedNewCacheScale = parseFloat(newCacheScale || "1");
      if (isNaN(parsedNewCacheScale)) return;
      setCacheScale(parsedNewCacheScale);
    };
    fetchCacheScale();
  }, []);

  const handleChangeCacheScale = async (e: string) => {
    const newCacheScale = parseFloat(e || "1");

    if (isNaN(newCacheScale)) return;

    setCacheScale(parseFloat(e || "1"));
    await AsyncStorage.setItem(CACHE_SCALE_KEY, `${newCacheScale}`);
  };

  useEffect(() => {
    function handleAuthChange(user: FirebaseAuthTypes.User | null) {
      setUser(user);
    }

    const subscriber = onAuthStateChanged(auth, (e: any) =>
      handleAuthChange(e)
    );
    return subscriber; // unsubscribe on unmount
  }, []);

  return (
    <VStack className="w-full px-5 pt-5 gap-y-10">
      <Stack.Screen options={{ title: "Paramètres" }} />
      <Heading>Paramètres</Heading>
      <VStack className="gap-y-2">
        <Text className="text-typography-500">
          {!!auth?.currentUser
            ? `Bonjour ${
                auth.currentUser?.displayName || auth.currentUser?.email
              }`
            : "Vous n'êtes pas connecté !"}
        </Text>
        {!auth?.currentUser && (
          <Button onPress={() => router.push("/auth/login")}>
            <ButtonText>Se connecter</ButtonText>
          </Button>
        )}
        {!!auth?.currentUser && (
          <Button onPress={() => auth.signOut()}>
            <ButtonText>Se déconnecter</ButtonText>
          </Button>
        )}
      </VStack>
      <VStack>
        <Text className="text-typography-500">
          Zoom automatique à l'échelle (auto):
        </Text>
        <HStack className="w-full">
          <Input className="w-full" isDisabled>
            <InputField
              onChangeText={(e) => handleChangeCacheScale(e)}
              value={`${cacheScale}`}
              type="text"
              inputMode="numeric"
            />
          </Input>
        </HStack>
      </VStack>
    </VStack>
  );
}
