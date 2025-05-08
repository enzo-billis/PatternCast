import RegisterForm from "@/components/Auth/RegisterForm";
import { Box } from "@/components/ui/box";
import { Stack } from "expo-router";

export default function RegisterScreen() {
  return (
    <Box className="p-5">
      <Stack.Screen options={{ title: "Inscription" }} />
      <RegisterForm />
    </Box>
  );
}
