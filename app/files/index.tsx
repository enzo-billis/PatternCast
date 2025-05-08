import FilesList from "@/components/Files/FileList";
import { Button, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import {
  FirebaseAuthTypes,
  getAuth,
  onAuthStateChanged,
} from "@react-native-firebase/auth";
import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";

export default function FilesScreen() {
  const auth = getAuth();
  const router = useRouter();
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);

  useEffect(() => {
    function handleAuthChange(user: FirebaseAuthTypes.User | null) {
      setUser(user);
    }

    const subscriber = onAuthStateChanged(auth, (e) => handleAuthChange(e));
    return subscriber; // unsubscribe on unmount
  }, []);

  return (
    <VStack className="w-full px-5 pt-5 gap-y-10">
      <Stack.Screen options={{ title: "Vos fichiers" }} />
      <Heading className="text-3xl ">Cloud</Heading>
      <VStack className="gap-y-2">
        <Text className="text-typography-500">
          {!!auth?.currentUser
            ? `Voici l'ensemble de vos fichiers en ligne`
            : "Vous devez être connecté pour profiter de vos fichiers en ligne"}
        </Text>
        {!auth?.currentUser && (
          <Button onPress={() => router.push("/auth/login")}>
            <ButtonText>Se connecter</ButtonText>
          </Button>
        )}
        {!!user && <FilesList user={user} />}
      </VStack>
    </VStack>
  );
}
