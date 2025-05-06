import { decodeUTF16BE } from "@/utils/utf16";
import { Layers2 } from "lucide-react-native";
import {
  PDFArray,
  PDFDict,
  PDFDocument,
  PDFName,
  PDFObject,
  PDFString,
} from "pdf-lib";
import { useEffect, useState } from "react";
import colors from "tailwindcss/colors";
import { Button, ButtonSpinner, ButtonText } from "./ui/button";
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
  const [isSaving, setIsSaving] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);

  useEffect(() => {
    const getLayers = async () => {
      const pdfDoc = await PDFDocument.load(base64);
      const context = pdfDoc.context;

      const rawOCProperties = pdfDoc.catalog.get(PDFName.of("OCProperties"));

      if (!rawOCProperties) return;

      const ocProperties =
        rawOCProperties instanceof PDFDict
          ? rawOCProperties
          : context.lookup(rawOCProperties, PDFDict);

      if (!ocProperties) return;

      const ocgs = ocProperties.get(PDFName.of("OCGs")) as PDFArray;
      let dDict = ocProperties.get(PDFName.of("D")) as PDFDict;

      // Vérifie si /D existe, sinon crée un nouveau PDFDict
      if (!dDict) {
        dDict = PDFDict.withContext(context);
        ocProperties.set(PDFName.of("D"), dDict);
      }

      // Si /ON n'existe pas, crée-le
      let onArray = dDict.get(PDFName.of("ON")) as PDFArray;
      let mustAddAllToCreate = false;
      if (!onArray) {
        onArray = PDFArray.withContext(context);
        dDict.set(PDFName.of("ON"), onArray);
        mustAddAllToCreate = true;
      }

      const visibleRefs = new Set(
        onArray.asArray().map((ref) => ref?.toString())
      );

      if (mustAddAllToCreate) {
        ocgs.asArray().forEach((ref) => {
          if (!visibleRefs.has(ref.toString())) {
            onArray.push(ref); // Ajoute la référence du calque si elle n'est pas déjà présente
            visibleRefs.add(ref.toString());
          }
        });
      }

      const ocgInfo = ocgs.asArray().map((ref) => {
        const ocgDict = context.lookup(ref, PDFDict) as PDFDict;
        const name = getOCGName(ocgDict);
        const isVisible = visibleRefs.has(ref?.toString());
        return { ref, name, visible: isVisible };
      });

      setLayers(
        ocgInfo.sort((a, b) => {
          const nameA = a.name.toLowerCase();
          const nameB = b.name.toLowerCase();
          if (nameA < nameB) return 1;
          if (nameA > nameB) return -1;
          return 0;
        })
      );
      if (isSaving) {
        setIsSaving(false);
        setShowDrawer(false);
      }
    };
    if (showDrawer) {
      getLayers();
    }
  }, [base64, showDrawer]);

  const getOCGName = (ocgDict: PDFDict): string => {
    const rawName = ocgDict.get(PDFName.of("Name"));
    if (!rawName) return "[Sans nom]";

    const typeName = rawName.constructor.name;

    if (typeName === "PDFHexString") {
      const hex = rawName.toString().replace(/[<>]/g, "");
      try {
        return decodeUTF16BE(hex);
      } catch (e) {
        return rawName.toString();
      }
    }

    if (typeName === "PDFString") {
      return (rawName as PDFString).decodeText();
    }

    return rawName.toString();
  };

  const applyLayers = async () => {
    setIsSaving(true);
    const pdfDoc = await PDFDocument.load(base64);
    const context = pdfDoc.context;

    const rawOCProperties = pdfDoc.catalog.get(PDFName.of("OCProperties"));

    if (!rawOCProperties) return;

    const ocProperties =
      rawOCProperties instanceof PDFDict
        ? rawOCProperties
        : context.lookup(rawOCProperties, PDFDict);

    if (!ocProperties) return;

    const visibleRefs = layers.filter((l) => l.visible).map((l) => l.ref);
    const hiddenRefs = layers.filter((l) => !l.visible).map((l) => l.ref);

    // 🧱 Créer /D s'il n'existe pas
    let dDict = ocProperties.get(PDFName.of("D")) as PDFDict;
    if (!dDict) {
      dDict = PDFDict.withContext(context);
      ocProperties.set(PDFName.of("D"), dDict);
    }
    console.log("pdfBytes");
    // ✅ Met à jour /ON avec les refs visibles
    const onArray = PDFArray.withContext(context);
    visibleRefs.forEach((ref) => onArray.push(ref));
    dDict.set(PDFName.of("ON"), onArray);

    // ✅ Met à jour /OFF avec les refs cachés
    const offArray = PDFArray.withContext(context);
    hiddenRefs.forEach((ref) => offArray.push(ref));
    dDict.set(PDFName.of("OFF"), offArray);
    pdfDoc.catalog.set(PDFName.of("OCProperties"), ocProperties);

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
                      isDisabled={isSaving}
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
                  {isSaving && <ButtonSpinner color={colors.gray[400]} />}
                  <ButtonText>Appliquer</ButtonText>
                </Button>
              ) : null}
              <Button
                disabled={isSaving}
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
