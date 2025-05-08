import AsyncStorage from "@react-native-async-storage/async-storage";
import * as DocumentPicker from "expo-document-picker";
import * as ScreenOrientation from "expo-screen-orientation";
import {
  LogOut,
  RotateCcw,
  RulerDimensionLine,
  ZoomIn,
  ZoomOut,
} from "lucide-react-native";
import { PDFDocument } from "pdf-lib";
import React, { useEffect, useState } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import Pdf from "react-native-pdf";
import Layers from "./Layers";
import { Box } from "./ui/box";
import { Button, ButtonIcon, ButtonText } from "./ui/button";
import { HStack } from "./ui/hstack";
import { HelpCircleIcon, Icon, ThreeDotsIcon } from "./ui/icon";
import { Input, InputField } from "./ui/input";
import { Menu, MenuItem, MenuItemLabel } from "./ui/menu";
import { Spinner } from "./ui/spinner";
import { Text } from "./ui/text";
import { Toast, ToastDescription, ToastTitle, useToast } from "./ui/toast";
import { VStack } from "./ui/vstack";

export const CACHE_SCALE_KEY = "DEFAULT_SCALE";

type PropTypes = {
  document: DocumentPicker.DocumentPickerAsset;
  onLeave: (withError?: boolean) => void;
};

const PDFViewer = ({ document, onLeave }: PropTypes) => {
  const [pdfBase64, setPDFBase64] = useState("");
  const [width, setWidth] = useState(Dimensions.get("window").width);
  const [height, setHeight] = useState(Dimensions.get("window").height);
  const [orientation, setOrientation] =
    useState<ScreenOrientation.Orientation>();
  const [scale, setScale] = useState(1);
  const [showToolbar, setShowToolbar] = useState(false);

  const [scaleMeasureMode, setScaleMeasureMode] = useState(false);
  const [scaleMeasureModeError, setScaleMeasureModeError] = useState(false);
  const [scaleMeasureModeStep, setScaleMeasureModeStep] = useState(0);
  const [scaleMeasure, setScaleMeasure] = useState(0);

  const [originalSize, setOriginalSize] = useState("");
  const [scale1, setScale1] = useState(0);
  const [size1, setSize1] = useState("");
  const [scale2, setScale2] = useState(0);
  const [size2, setSize2] = useState("");

  const toast = useToast();

  const source = {
    uri: `data:application/pdf;base64,${pdfBase64}`,
    cache: true,
  };

  const toastError = () =>
    toast.show({
      placement: "bottom",
      render: () => {
        return (
          <Toast
            action="error"
            className="p-4 gap-6 border-error-500 w-full shadow-hard-5 max-w-[443px] flex-row justify-between"
          >
            <HStack space="md">
              <Icon as={HelpCircleIcon} className="stroke-error-500 mt-0.5" />
              <VStack space="xs">
                <ToastTitle className="font-semibold ">Erreur</ToastTitle>
                <ToastDescription size="sm">
                  Impossible de lire le fichier
                </ToastDescription>
              </VStack>
            </HStack>
          </Toast>
        );
      },
    });

  useEffect(() => {
    const retrieveSavedScale = async () => {
      const savedScale = await AsyncStorage.getItem(CACHE_SCALE_KEY);

      if (!savedScale || isNaN(parseFloat(savedScale))) return;
      setScale(parseFloat(savedScale));
    };
    retrieveSavedScale();
  }, []);

  useEffect(() => {
    const getPDF = async () => {
      try {
        const response = await fetch(document?.uri);
        const blob = await response.blob();
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = async () => {
          if (reader.result) {
            try {
              const arrayBuffer = reader.result as string;
              const pdfDoc = await PDFDocument.load(arrayBuffer);
              const pdfBytes = await pdfDoc.saveAsBase64();
              setPDFBase64(pdfBytes);
            } catch (e) {
              toastError();
              console.log("Error while encoding file:", e);
            }
          }
        };
        reader.onerror = (error) => {
          toastError();
          console.log("Error while encoding file:", error);
        };
      } catch (e) {
        toastError();
        onLeave();
        console.error("Error loading PDF", e);
      }
    };
    getPDF();
  }, [document]);

  useEffect(() => {
    ScreenOrientation.addOrientationChangeListener((newOrientation) => {
      const { width, height } = Dimensions.get("window");
      setWidth(width);
      setHeight(height);
      setOrientation(newOrientation.orientationInfo.orientation);
    });
    const getInitialOrientation = async () => {
      setOrientation(await ScreenOrientation?.getOrientationAsync());
    };
    getInitialOrientation();
  }, []);

  const autoZoom = async () => {
    const calculcatedScale =
      scale1 +
      ((parseFloat(originalSize.replace(",", ".")) -
        parseFloat(size1.replace(",", "."))) *
        (scale2 - scale1)) /
        (parseFloat(size2.replace(",", ".")) -
          parseFloat(size1.replace(",", ".")));

    await AsyncStorage.setItem(CACHE_SCALE_KEY, `${calculcatedScale}`);
    setScale(calculcatedScale);
    setScaleMeasure(calculcatedScale);
  };
  console.log("has b64", !!pdfBase64);
  return (
    <Box
      style={{
        height: "100%",
        width: "100%",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {!pdfBase64 && <Spinner size="large" />}
      {!!pdfBase64 && (
        <View
          style={{
            ...styles.container,
          }}
        >
          {(showToolbar || scaleMeasureMode) && (
            <HStack style={styles.toolbar} space="md">
              {!scaleMeasureMode && (
                <>
                  <Button onPress={() => setScale(scale + 0.5)}>
                    <Icon
                      as={ZoomIn}
                      className="text-typography-500 m-2 w-4 h-4"
                    />
                  </Button>
                  <Button
                    onPress={() => setScale(scale > 1.5 ? scale - 0.5 : 1)}
                  >
                    <Icon
                      as={ZoomOut}
                      className="text-typography-500 m-2 w-4 h-4"
                    />
                  </Button>

                  <Layers
                    base64={pdfBase64}
                    onChangePDF={(e) => setPDFBase64(e)}
                  />

                  <Menu
                    placement="top"
                    offset={5}
                    disabledKeys={["Settings"]}
                    trigger={({ ...triggerProps }) => {
                      return (
                        <Button {...triggerProps}>
                          <ButtonIcon
                            as={ThreeDotsIcon}
                            className="text-typography-500 m-2 w-4 h-4"
                          />
                        </Button>
                      );
                    }}
                  >
                    <MenuItem
                      onPress={() => setScale(scaleMeasure || 1)}
                      key="ReinitialiserZoom"
                      textValue="Réinitialiser le zoom"
                    >
                      <Icon as={RotateCcw} size="sm" className="mr-2" />
                      <MenuItemLabel size="sm">Réinit. Zoom</MenuItemLabel>
                    </MenuItem>
                    <MenuItem
                      onPress={() => setScaleMeasureMode(true)}
                      key="ScaleAuto"
                      textValue="Mise à l'échelle"
                    >
                      <Icon
                        as={RulerDimensionLine}
                        size="sm"
                        className="mr-2"
                      />
                      <MenuItemLabel size="sm">Mise à l'echelle</MenuItemLabel>
                    </MenuItem>
                    <MenuItem
                      onPress={() => onLeave()}
                      key="Exit"
                      textValue="Exit"
                    >
                      <Icon as={LogOut} size="sm" className="mr-2" />
                      <MenuItemLabel size="sm">Quitter</MenuItemLabel>
                    </MenuItem>
                  </Menu>
                </>
              )}
              {!!scaleMeasureMode && (
                <HStack style={{ width: "100%" }} space="md">
                  {scaleMeasureModeStep === 0 && (
                    <>
                      <Input
                        style={{ flex: 5 }}
                        isInvalid={scaleMeasureModeError}
                      >
                        <InputField
                          keyboardType="numeric"
                          onChangeText={(e) => setOriginalSize(e)}
                          placeholder="Original measure (cm)"
                        />
                      </Input>
                      <Button
                        style={{ flex: 1 }}
                        onPress={() => {
                          if (
                            originalSize &&
                            !isNaN(parseFloat(originalSize))
                          ) {
                            setScaleMeasureModeError(false);
                            setScaleMeasureModeStep(1);
                            setScale(2);
                          } else {
                            setScaleMeasureModeError(true);
                          }
                        }}
                      >
                        <ButtonText>Save</ButtonText>
                      </Button>
                    </>
                  )}
                  {scaleMeasureModeStep === 1 && (
                    <>
                      <Input
                        style={{ flex: 5 }}
                        isInvalid={scaleMeasureModeError}
                      >
                        <InputField
                          keyboardType="numeric"
                          onChangeText={(e) => setSize1(e)}
                          placeholder="Measure Scale 1 (cm)"
                        />
                      </Input>
                      <Button
                        style={{ flex: 1 }}
                        onPress={() => {
                          if (size1 && !isNaN(parseFloat(size1))) {
                            setScaleMeasureModeError(false);
                            setScale1(scale);
                            setScaleMeasureModeStep(2);
                            setScale(3);
                          } else {
                            setScaleMeasureModeError(true);
                          }
                        }}
                      >
                        <ButtonText>Save</ButtonText>
                      </Button>
                    </>
                  )}
                  {scaleMeasureModeStep === 2 && (
                    <>
                      <Input
                        style={{ flex: 5 }}
                        isInvalid={scaleMeasureModeError}
                      >
                        <InputField
                          keyboardType="numeric"
                          onChangeText={(e) => setSize2(e)}
                          placeholder="Measure Scale 2 (cm)"
                        />
                      </Input>
                      <Button
                        style={{ flex: 1 }}
                        onPress={() => {
                          if (size2 && !isNaN(parseFloat(size2))) {
                            setScale2(scale);
                            setScaleMeasureModeStep(3);
                          } else {
                            setScaleMeasureModeError(true);
                          }
                        }}
                      >
                        <ButtonText>Save</ButtonText>
                      </Button>
                    </>
                  )}
                  {scaleMeasureModeStep === 3 && (
                    <>
                      <Text style={{ flex: 5 }}>
                        Taille: {originalSize} cm Scale 1: {scale1} pour {size1}{" "}
                        cm Scale 1: {scale2} pour {size2} cm
                      </Text>
                      <Button
                        style={{ flex: 1 }}
                        onPress={() => {
                          setScaleMeasureModeStep(0);
                          setScaleMeasureMode(false);
                          autoZoom();
                        }}
                      >
                        <ButtonText>Calcul</ButtonText>
                      </Button>
                    </>
                  )}
                </HStack>
              )}
            </HStack>
          )}

          <Pdf
            source={source}
            onPageSingleTap={() => {
              setScaleMeasureMode(false);
              setShowToolbar(!showToolbar);
            }}
            scale={scale}
            maxScale={30}
            minScale={-10}
            style={{
              ...styles.pdf,
              width,
              height,
            }}
          />
        </View>
      )}
    </Box>
  );
};
export default PDFViewer;
const styles = StyleSheet.create({
  container: {
    height: "100%",
    width: "100%",
    position: "relative",
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
  },
  toolbar: {
    zIndex: 100,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    width: "100%",
    backgroundColor: "white",
    padding: 10,
  },
  pdf: {
    flex: 1,
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
});
