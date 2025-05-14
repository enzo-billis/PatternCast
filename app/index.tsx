import PDFViewer from "@/components/PDFViewer";
import {
  Button,
  ButtonGroup,
  ButtonIcon,
  ButtonSpinner,
  ButtonText,
} from "@/components/ui/button";
import { Center } from "@/components/ui/center";
import { Image } from "@/components/ui/image";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useShareIntentContext } from "expo-share-intent";
import { ChevronRightCircle } from "lucide-react-native";
import { useEffect, useState } from "react";

const CACHE_KEY = "PREVIOUS_DOCUMENTS";
const MAX_CACHE_SIZE = 5;

export default function HomeScreen() {
  const { fileURI: pathRequestedFileURI, fileName: pathRequestedFileName } =
    useLocalSearchParams<{ fileURI: string; fileName: string }>();
  const router = useRouter();

  const [loadingDocument, setLoadingDocument] = useState(false);

  const [selectedDocuments, setSelectedDocuments] =
    useState<DocumentPicker.DocumentPickerAsset>();
  const [previousDocuments, setPreviousDocuments] =
    useState<DocumentPicker.DocumentPickerAsset[]>();

  const { hasShareIntent, shareIntent, resetShareIntent } =
    useShareIntentContext();

  useEffect(() => {
    const handleShareIntent = async () => {
      if (
        hasShareIntent &&
        shareIntent?.files &&
        shareIntent?.files[0]?.mimeType === "application/pdf"
      ) {
        const tempFile = shareIntent?.files[0];
        const newPath = `${FileSystem.documentDirectory}pattern-${tempFile.fileName}`;

        await FileSystem.copyAsync({
          from: tempFile.path,
          to: newPath,
        });

        setSelectedDocuments({
          uri: newPath,
          name: shareIntent?.files[0].fileName,
        });
        resetShareIntent();
      }
    };
    handleShareIntent();
  }, [hasShareIntent]);

  useEffect(() => {
    const handleRequestFile = async () => {
      try {
        if (pathRequestedFileName && pathRequestedFileURI) {
          setLoadingDocument(true);
          const newPath = `${FileSystem.documentDirectory}pattern-${pathRequestedFileName}`;
          await FileSystem.downloadAsync(pathRequestedFileURI, newPath);

          setSelectedDocuments({
            uri: pathRequestedFileURI,
            name: pathRequestedFileName,
          });
          router.setParams(undefined);
        }
      } catch (e) {
        console.log("Fail to handle request file: ", e);
      } finally {
        setLoadingDocument(false);
      }
    };
    handleRequestFile();
  }, [pathRequestedFileURI, pathRequestedFileName]);

  useEffect(() => {
    const refreshCache = async () => {
      const actualCache = JSON.parse(
        (await AsyncStorage.getItem(CACHE_KEY)) || "[]"
      ) as DocumentPicker.DocumentPickerAsset[];
      setPreviousDocuments(actualCache);

      if (selectedDocuments) {
        const actualCache = JSON.parse(
          (await AsyncStorage.getItem(CACHE_KEY)) || "[]"
        ) as DocumentPicker.DocumentPickerAsset[];

        const existingCacheIndex = actualCache.findIndex(
          (doc) => doc.name === selectedDocuments.name
        );

        if (existingCacheIndex !== -1) {
          actualCache.splice(existingCacheIndex, 1);
        }

        if (actualCache.length >= MAX_CACHE_SIZE) {
          actualCache.pop();
        }
        await AsyncStorage.setItem(
          CACHE_KEY,
          JSON.stringify([selectedDocuments, ...actualCache])
        );
      }
    };
    refreshCache();
  }, [selectedDocuments]);

  const pickDocuments = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        multiple: false, // Allows the user to select any file
        type: "application/pdf",
      });
      if (!result.canceled) {
        const tempFile = result.assets[0];
        const newPath = `${FileSystem.documentDirectory}pattern-${tempFile.name}`;

        await FileSystem.copyAsync({
          from: tempFile.uri,
          to: newPath,
        });

        setSelectedDocuments({ ...tempFile, uri: newPath });
      } else {
        console.log("Document selection cancelled.");
      }
    } catch (error) {
      console.log("Error picking documents:", error);
    }
  };

  const handleFailOpenDocument = async (name: string) => {
    const actualCache = JSON.parse(
      (await AsyncStorage.getItem(CACHE_KEY)) || "[]"
    ) as DocumentPicker.DocumentPickerAsset[];

    const existingCacheIndex = actualCache.findIndex(
      (doc) => doc.name === name
    );

    if (existingCacheIndex !== -1) {
      actualCache.splice(existingCacheIndex, 1);
    }

    if (actualCache.length >= MAX_CACHE_SIZE) {
      actualCache.pop();
    }
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(actualCache));
    setSelectedDocuments(undefined);
  };

  return (
    <Center style={{ height: "100%" }}>
      {!selectedDocuments && (
        <VStack style={{ alignItems: "center" }} space="4xl" className="p-5">
          <VStack style={{ alignItems: "center" }} space="sm">
            <Image
              size="2xl"
              source={require("../assets/images/rounded-icon.png")}
              alt="image"
            />
            <Button className="mt-6" size="xl" onPress={() => pickDocuments()}>
              {!loadingDocument && <ButtonText>Choisir un fichier</ButtonText>}
              {!!loadingDocument && <ButtonSpinner />}
            </Button>
          </VStack>
          {!!previousDocuments?.length && (
            <VStack space="sm">
              <Text>Derniers fichiers consultés</Text>
              <VStack space="md">
                {previousDocuments?.map((e) => (
                  <ButtonGroup key={e.uri}>
                    <Button
                      onPress={() => setSelectedDocuments(e)}
                      variant="outline"
                      style={{
                        width: "100%",
                        justifyContent: "space-between",
                      }}
                    >
                      <ButtonText>{e.name}</ButtonText>
                      <ButtonIcon as={ChevronRightCircle} />
                    </Button>
                  </ButtonGroup>
                ))}
              </VStack>
            </VStack>
          )}
        </VStack>
      )}
      {!!selectedDocuments && (
        <PDFViewer
          document={selectedDocuments}
          onLeave={(widthError) => {
            if (widthError) {
              handleFailOpenDocument(selectedDocuments?.name);
            } else {
              setSelectedDocuments(undefined);
            }
          }}
        />
      )}
    </Center>
  );
}
