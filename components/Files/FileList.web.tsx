import {
  getStorage,
  isWebListResult,
  isWebRef,
  list,
  ref,
} from "@/adapters/storage.adapter";
import { FirebaseAuthTypes } from "@react-native-firebase/auth";
import * as DocumentPicker from "expo-document-picker";
import { useRouter } from "expo-router";
import {
  getDownloadURL,
  StorageReference,
  uploadBytes,
} from "firebase/storage";
import { ChevronRightCircle, CloudUpload } from "lucide-react-native";
import { useEffect, useState } from "react";
import colors from "tailwindcss/colors";
import { Box } from "../ui/box";
import {
  Button,
  ButtonGroup,
  ButtonIcon,
  ButtonSpinner,
  ButtonText,
} from "../ui/button";
import { HStack } from "../ui/hstack";
import { Spinner } from "../ui/spinner";
import { Text } from "../ui/text";
import { VStack } from "../ui/vstack";

type PropTypes = {
  user: FirebaseAuthTypes.User;
};

const FilesList = ({ user }: PropTypes) => {
  const [files, setFiles] = useState<StorageReference[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpening, setIsOpening] = useState<string>();

  const [nextPageToken, setNextPageToken] = useState<string>();
  const router = useRouter();
  const storage = getStorage();

  const getFiles = async (newPageToken?: string) => {
    const reference = ref(storage, `/user_files/${user?.uid}`);
    try {
      setIsLoading(true);
      const result = await list(reference, {
        pageToken: newPageToken,
        maxResults: 10,
      });

      if (!isWebListResult(result)) return;

      setNextPageToken(result?.nextPageToken || undefined);

      if (newPageToken) {
        setFiles([...files, ...result?.items]);
      } else {
        setFiles(result?.items);
      }
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getFiles();
  }, [user]);

  const uploadFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        multiple: false, // Allows the user to select any file
        type: "application/pdf",
      });
      if (!result.canceled) {
        const tempFile = result.assets[0];
        const reference = ref(
          storage,
          `/user_files/${user?.uid}/${tempFile.name}`
        );
        setIsUploading(true);
        if (isWebRef(reference) && tempFile?.file) {
          await uploadBytes(reference, tempFile?.file);
          getFiles();
        }
      } else {
        console.log("Document selection cancelled.");
      }
    } catch (error) {
      console.log("Error uploading documents:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleOpenFile = async (file: StorageReference) => {
    try {
      setIsOpening(file.name);
      const reference = ref(storage, `/user_files/${user?.uid}/${file.name}`);
      if (!isWebRef(reference)) return;

      const url = await getDownloadURL(reference);
      router.push({
        pathname: "/",
        params: { fileURI: encodeURIComponent(url), fileName: file.name },
      });
    } catch (e) {
      console.log(e);
    } finally {
      setIsOpening(undefined);
    }
  };

  return (
    <VStack className="gap-y-5">
      <Button className="mt-6" size="xl" onPress={() => uploadFile()}>
        {isUploading && <ButtonSpinner color={colors.gray[400]} />}

        {!isUploading ? (
          <>
            <ButtonIcon as={CloudUpload} />
            <ButtonText>Envoyer un fichier</ButtonText>
          </>
        ) : null}
      </Button>
      {isLoading && <Spinner />}
      {!isLoading && !files?.length ? (
        <Text>Aucun fichier enregistré</Text>
      ) : null}

      <VStack className="gap-y-5 overflow-auto">
        {!!files?.length &&
          files.map((e) => (
            <ButtonGroup key={e.name}>
              <Button
                onPress={() => handleOpenFile(e)}
                variant="outline"
                style={{ width: "100%", justifyContent: "space-between" }}
              >
                <ButtonText
                  className="w-80 whitespace-nowrap overflow-hidden"
                  numberOfLines={1}
                >
                  {e.name}
                </ButtonText>
                <Box>
                  {isOpening !== e.name && (
                    <ButtonIcon as={ChevronRightCircle} />
                  )}
                  {isOpening === e.name && <ButtonSpinner />}
                </Box>
              </Button>
            </ButtonGroup>
          ))}
      </VStack>
      {nextPageToken && (
        <HStack className="w-full justify-between">
          <Button className="w-full" onPress={() => getFiles(nextPageToken)}>
            <ButtonText>Voir plus</ButtonText>
          </Button>
        </HStack>
      )}
    </VStack>
  );
};

export default FilesList;
