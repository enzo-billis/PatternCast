import PDFViewer from "@/components/PDFViewer";
import { Center } from "@/components/ui/center";
import * as DocumentPicker from "expo-document-picker";
import { useState } from "react";
import { Button } from "react-native";

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
        <Button onPress={() => pickDocuments()} title="Pick document" />
      )}
      {!!selectedDocuments && <PDFViewer document={selectedDocuments} />}
    </Center>
  );
}
