import { CACHE_SCALE_KEY } from "@/components/PDFViewer";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Input, InputField } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

export default function SettingScreen() {
  const [cacheScale, setCacheScale] = useState(1);

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

  return (
    <VStack className="w-full px-5 pt-5">
      <Heading>Paramètres</Heading>
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
