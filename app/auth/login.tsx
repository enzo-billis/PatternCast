import LoginForm from "@/components/Auth/LoginForm";
import { Box } from "@/components/ui/box";
import { Stack } from "expo-router";

export default function LoginScreen() {
  return (
    <Box className="p-5">
      <Stack.Screen options={{ title: "Connexion" }} />
      <LoginForm />
    </Box>
  );
}
