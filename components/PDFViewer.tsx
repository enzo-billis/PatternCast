import * as DocumentPicker from "expo-document-picker";
import * as ScreenOrientation from "expo-screen-orientation";
import {
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
import { Button, ButtonText } from "./ui/button";
import { HStack } from "./ui/hstack";
import { Icon } from "./ui/icon";
import { Input, InputField } from "./ui/input";
import { Text } from "./ui/text";

type PropTypes = {
  document: DocumentPicker.DocumentPickerAsset;
};

const PDFViewer = ({ document }: PropTypes) => {
  const [pdfBase64, setPDFBase64] = useState("");
  const [width, setWidth] = useState(Dimensions.get("window").width);
  const [height, setHeight] = useState(Dimensions.get("window").height);
  const [orientation, setOrientation] =
    useState<ScreenOrientation.Orientation>();
  const [scale, setScale] = useState(1);
  const [showToolbar, setShowToolbar] = useState(false);

  const [scaleMeasureMode, setScaleMeasureMode] = useState(false);
  const [scaleMeasureModeStep, setScaleMeasureModeStep] = useState(0);
  const [scaleMeasure, setScaleMeasure] = useState(0);

  const [originalSize, setOriginalSize] = useState("");
  const [scale1, setScale1] = useState(0);
  const [size1, setSize1] = useState("");
  const [scale2, setScale2] = useState(0);
  const [size2, setSize2] = useState("");

  const source = {
    uri: `data:application/pdf;base64,${pdfBase64}`,
    cache: true,
  };

  useEffect(() => {
    const getPDF = async () => {
      const response = await fetch(document?.uri);
      const blob = await response.blob();
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        if (reader.result) {
          const arrayBuffer = reader.result as string;
          const pdfDoc = await PDFDocument.load(arrayBuffer);
          const pdfBytes = await pdfDoc.saveAsBase64();
          setPDFBase64(pdfBytes);
        }
      };
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
    setScale(calculcatedScale);
    setScaleMeasure(calculcatedScale);
  };

  return (
    <Box style={{ height: "100%", width: "100%" }}>
      <View
        style={{
          ...styles.container,
          marginTop: [
            ScreenOrientation.Orientation.PORTRAIT_DOWN,
            ScreenOrientation?.Orientation?.PORTRAIT_UP,
          ]?.includes(orientation || ScreenOrientation?.Orientation?.UNKNOWN)
            ? 52
            : 0,
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
                <Button onPress={() => setScale(scale - 0.5)}>
                  <Icon
                    as={ZoomOut}
                    className="text-typography-500 m-2 w-4 h-4"
                  />
                </Button>

                <Button onPress={() => setScale(scaleMeasure || 1)}>
                  <Icon
                    as={RotateCcw}
                    className="text-typography-500 m-2 w-4 h-4"
                  />
                </Button>
                <Button onPress={() => setScaleMeasureMode(true)}>
                  <Icon
                    as={RulerDimensionLine}
                    className="text-typography-500 m-2 w-4 h-4"
                  />
                </Button>
                <Layers
                  base64={pdfBase64}
                  onChangePDF={(e) => setPDFBase64(e)}
                />
              </>
            )}
            {!!scaleMeasureMode && (
              <HStack style={{ width: "100%" }} space="md">
                {scaleMeasureModeStep === 0 && (
                  <>
                    <Input style={{ flex: 5 }}>
                      <InputField
                        keyboardType="numeric"
                        onChangeText={(e) => setOriginalSize(e)}
                        placeholder="Original measure (cm)"
                      />
                    </Input>
                    <Button
                      style={{ flex: 1 }}
                      onPress={() => {
                        setScaleMeasureModeStep(1);
                        setScale(2);
                      }}
                    >
                      <ButtonText>Save</ButtonText>
                    </Button>
                  </>
                )}
                {scaleMeasureModeStep === 1 && (
                  <>
                    <Input style={{ flex: 5 }}>
                      <InputField
                        keyboardType="numeric"
                        onChangeText={(e) => setSize1(e)}
                        placeholder="Measure Scale 1"
                      />
                    </Input>
                    <Button
                      style={{ flex: 1 }}
                      onPress={() => {
                        setScale1(scale);
                        setScaleMeasureModeStep(2);
                        setScale(3);
                      }}
                    >
                      <ButtonText>Save</ButtonText>
                    </Button>
                  </>
                )}
                {scaleMeasureModeStep === 2 && (
                  <>
                    <Input style={{ flex: 5 }}>
                      <InputField
                        keyboardType="numeric"
                        onChangeText={(e) => setSize2(e)}
                        placeholder="Measure Scale 2"
                      />
                    </Input>
                    <Button
                      style={{ flex: 1 }}
                      onPress={() => {
                        setScale2(scale);
                        setScaleMeasureModeStep(3);
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
