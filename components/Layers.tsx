import { Layers2 } from "lucide-react-native";
import { PDFArray, PDFDict, PDFDocument, PDFName, PDFObject } from "pdf-lib";
import { useEffect, useState } from "react";
import { Button, ButtonText } from "./ui/button";
import {
  Checkbox,
  CheckboxIcon,
  CheckboxIndicator,
  CheckboxLabel,
} from "./ui/checkbox";
import {
  Drawer,
  DrawerBackdrop,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
} from "./ui/drawer";
import { Heading } from "./ui/heading";
import { HStack } from "./ui/hstack";
import { CheckIcon, Icon } from "./ui/icon";
import { Text } from "./ui/text";
import { VStack } from "./ui/vstack";

type PropTypes = {
  base64: string;
  onChangePDF: (base64: string) => void;
};
type Layer = {
  name: string;
  ref: PDFObject;
  visible: boolean;
};

const Layers = ({ base64, onChangePDF }: PropTypes) => {
  const [layers, setLayers] = useState<Layer[]>([]);
  const [showDrawer, setShowDrawer] = useState(false);

  useEffect(() => {
    const getLayers = async () => {
      const pdfDoc = await PDFDocument.load(base64);
      const pages = pdfDoc.getPages();
      const firstPage = pages[0];
      const context = firstPage.doc.context;

      const ocProperties = firstPage.doc.catalog.get(
        PDFName.of("OCProperties")
      ) as PDFDict;

      const ocgs = ocProperties.get(PDFName.of("OCGs")) as PDFArray;
      const dDict = ocProperties.get(PDFName.of("D")) as PDFDict;

      const onArray = dDict?.get(PDFName.of("ON")) as PDFArray;
      const visibleRefs = onArray
        ? new Set(onArray.asArray().map((ref) => ref?.toString()))
        : new Set();

      const ocgInfo = ocgs.asArray().map((ref) => {
        const ocgDict = context.lookup(ref, PDFDict) as PDFDict;
        const nameObj = ocgDict.get(PDFName.of("Name"));
        const name = nameObj?.toString() ?? "[Sans nom]";
        const isVisible = visibleRefs.has(ref?.toString());
        return { ref, name, visible: isVisible };
      });

      setLayers(ocgInfo);
    };
    if (showDrawer) {
      getLayers();
    }
  }, [base64, showDrawer]);

  const applyLayers = async () => {
    const pdfDoc = await PDFDocument.load(base64);
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    const context = firstPage.doc.context;

    const ocProperties = firstPage.doc.catalog.get(
      PDFName.of("OCProperties")
    ) as PDFDict;

    const ocgs = ocProperties.get(PDFName.of("OCGs")) as PDFArray;

    const allOCGRefs = ocgs.asArray(); // Toutes les refs connues
    const visibleRefs = layers.filter((l) => l.visible).map((l) => l.ref);
    const hiddenRefs = layers.filter((l) => !l.visible).map((l) => l.ref);

    // 🧱 Créer /D s'il n'existe pas
    let dDict = ocProperties.get(PDFName.of("D")) as PDFDict;
    if (!dDict) {
      dDict = PDFDict.withContext(context);
      ocProperties.set(PDFName.of("D"), dDict);
    }

    // ✅ Met à jour /ON avec les refs visibles
    const onArray = PDFArray.withContext(context);
    visibleRefs.forEach((ref) => onArray.push(ref));
    dDict.set(PDFName.of("ON"), onArray);

    // ✅ Met à jour /OFF avec les refs cachés
    const offArray = PDFArray.withContext(context);
    hiddenRefs.forEach((ref) => offArray.push(ref));
    dDict.set(PDFName.of("OFF"), offArray);

    firstPage.doc.catalog.set(PDFName.of("OCProperties"), ocProperties);

    const pdfBytes = await pdfDoc.saveAsBase64();
    onChangePDF(pdfBytes);
  };

  return (
    <>
      <Button
        onPress={() => {
          setShowDrawer(true);
        }}
      >
        <Icon as={Layers2} className="text-typography-500 m-2 w-4 h-4" />
      </Button>
      <Drawer
        isOpen={showDrawer}
        onClose={() => {
          setShowDrawer(false);
        }}
        size="lg"
        anchor="left"
      >
        <DrawerBackdrop />
        <DrawerContent style={{ paddingTop: 100 }}>
          <DrawerHeader>
            <Heading size="3xl">Calques</Heading>
          </DrawerHeader>
          <DrawerBody>
            <VStack space="lg">
              {layers?.length ? (
                <>
                  <Text>Sélectionnez les calques à afficher</Text>
                  {layers?.map((e) => (
                    <Checkbox
                      key={e.name}
                      value=""
                      isChecked={e.visible}
                      size="lg"
                      isInvalid={false}
                      isDisabled={false}
                      onChange={() =>
                        setLayers(
                          layers.map((layer) =>
                            layer.name === e.name
                              ? { ...layer, visible: !layer.visible }
                              : layer
                          )
                        )
                      }
                    >
                      <CheckboxIndicator>
                        <CheckboxIcon as={CheckIcon} />
                      </CheckboxIndicator>
                      <CheckboxLabel>
                        <Text>{e.name}</Text>
                      </CheckboxLabel>
                    </Checkbox>
                  ))}
                  <Button
                    onPress={() => {
                      setLayers(
                        layers.map((layer) => ({ ...layer, visible: false }))
                      );
                    }}
                    className="flex-1"
                  >
                    <ButtonText>Tout décocher</ButtonText>
                  </Button>
                </>
              ) : (
                <Text>Aucun calque trouvé</Text>
              )}
            </VStack>
          </DrawerBody>
          <DrawerFooter>
            <HStack space="lg">
              {layers?.length ? (
                <Button onPress={applyLayers} className="flex-1">
                  <ButtonText>Appliquer</ButtonText>
                </Button>
              ) : null}
              <Button
                variant="outline"
                onPress={() => {
                  setShowDrawer(false);
                }}
                className="flex-1"
              >
                <ButtonText>Fermer</ButtonText>
              </Button>
            </HStack>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default Layers;
