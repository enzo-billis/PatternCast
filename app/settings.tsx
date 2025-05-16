import { getAuth, onAuthStateChanged } from "@/adapters/auth.adapter";
import { Button, ButtonSpinner, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { CloseIcon, Icon } from "@/components/ui/icon";
import { Input, InputField } from "@/components/ui/input";
import {
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@/components/ui/modal";
import { Text } from "@/components/ui/text";
import {
  Toast,
  ToastDescription,
  ToastTitle,
  useToast,
} from "@/components/ui/toast";
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
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const toast = useToast();

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

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      await user?.delete();
      router.push("/auth/login");
      toast.show({
        placement: "bottom",
        render: () => {
          return (
            <Toast action="success">
              <VStack space="xs">
                <ToastTitle className="font-semibold ">
                  Compte supprimé avec succès
                </ToastTitle>
                <ToastDescription>A bientôt !</ToastDescription>
              </VStack>
            </Toast>
          );
        },
      });
    } catch (e) {
      console.log("Error deleting account", e);
      toast.show({
        placement: "bottom",
        render: () => {
          return (
            <Toast action="error">
              <VStack space="xs">
                <ToastTitle className="font-semibold ">
                  Erreur lors de la suppression de votre compte
                </ToastTitle>
                <ToastDescription>
                  Merci de vous déconnecter, reconnecter et réessayer la
                  suppression du compte. Si cela ne fonctionne toujours pas,
                  merci d'envoyer un email à enzo.billis@gmail.com
                </ToastDescription>
              </VStack>
            </Toast>
          );
        },
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteAccountModal(false);
    }
  };

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
        {!!auth?.currentUser && (
          <>
            <Button onPress={() => setShowDeleteAccountModal(true)}>
              <ButtonText>Supprimer mon compte</ButtonText>
            </Button>
            <Modal
              isOpen={showDeleteAccountModal}
              onClose={() => {
                setShowDeleteAccountModal(false);
              }}
              size="md"
            >
              <ModalBackdrop />
              <ModalContent>
                <ModalHeader>
                  <Heading size="md" className="text-typography-950">
                    Supprimer mon compte
                  </Heading>
                  <ModalCloseButton>
                    <Icon
                      as={CloseIcon}
                      size="md"
                      className="stroke-background-400 group-[:hover]/modal-close-button:stroke-background-700 group-[:active]/modal-close-button:stroke-background-900 group-[:focus-visible]/modal-close-button:stroke-background-900"
                    />
                  </ModalCloseButton>
                </ModalHeader>
                <ModalBody>
                  <Text size="sm" className="text-typography-500">
                    Êtes-vous sûr de vouloir supprimer votre compte ? Votre
                    compte ainsi que l'ensemble de vos données (patrons...)
                    seront supprimées ! Cette action est irréversible.
                  </Text>
                </ModalBody>
                <ModalFooter>
                  <Button
                    variant="outline"
                    action="secondary"
                    onPress={() => {
                      setShowDeleteAccountModal(false);
                    }}
                  >
                    <ButtonText>Annuler</ButtonText>
                  </Button>
                  <Button
                    onPress={() => {
                      handleDeleteAccount();
                    }}
                  >
                    {!isDeleting && <ButtonText>Supprimer</ButtonText>}
                    {!!isDeleting && <ButtonSpinner />}
                  </Button>
                </ModalFooter>
              </ModalContent>
            </Modal>
          </>
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
