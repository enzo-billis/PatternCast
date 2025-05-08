import { Box } from "@/components/ui/box";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";

export default function AccountScreen() {
  return (
    <Box className="p-5">
      <VStack>
        <Heading>Votre compte</Heading>
        <Text>Vous n'êtes pas connecté !</Text>
      </VStack>
    </Box>
  );
}
