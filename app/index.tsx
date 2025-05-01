import PDFViewer from "@/components/PDFViewer";
import { Button, ButtonText } from "@/components/ui/button";
import { Center } from "@/components/ui/center";
import { Image } from "@/components/ui/image";
import { VStack } from "@/components/ui/vstack";
import * as DocumentPicker from "expo-document-picker";
import { useState } from "react";

export default function HomeScreen() {
  const [selectedDocuments, setSelectedDocuments] =
    useState<DocumentPicker.DocumentPickerAsset>();

  const pickDocuments = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        multiple: false, // Allows the user to select any file
        type: "application/pdf",
      });

      if (!result.canceled) {
        setSelectedDocuments(result?.assets[0]);
      } else {
        console.log("Document selection cancelled.");
      }
    } catch (error) {
      console.log("Error picking documents:", error);
    }
  };
  return (
    <Center style={{ height: "100%" }}>
      {!selectedDocuments && (
        <VStack style={{ alignItems: "center" }} space="lg">
          <Image
            size="lg"
            source={require("../assets/images/icon.png")}
            alt="image"
          />
          <Button onPress={() => pickDocuments()}>
            <ButtonText>Choisir un patron</ButtonText>
          </Button>
        </VStack>
      )}
      {!!selectedDocuments && <PDFViewer document={selectedDocuments} />}
    </Center>
  );
}
