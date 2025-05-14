import { getAuth, signInWithEmailAndPassword } from "@/adapters/auth.adapter";
import { Box } from "@/components/ui/box";
import { Button, ButtonSpinner, ButtonText } from "@/components/ui/button";
import {
  FormControl,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
  FormControlHelper,
  FormControlHelperText,
  FormControlLabel,
  FormControlLabelText,
} from "@/components/ui/form-control";
import { Heading } from "@/components/ui/heading";
import { Input, InputField } from "@/components/ui/input";
import { VStack } from "@/components/ui/vstack";
import { zodResolver } from "@hookform/resolvers/zod";

import { useRouter } from "expo-router";
import { AlertCircleIcon } from "lucide-react-native";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import colors from "tailwindcss/colors";
import { z } from "zod";

const LoginSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(8, { message: "Password is too short" })
    .max(20, { message: "Password is too long" }),
});
type FormType = z.infer<typeof LoginSchema>;

const LoginForm = () => {
  const auth = getAuth();
  const router = useRouter();
  const [isSigning, setIsSigning] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormType>({
    resolver: zodResolver(LoginSchema),
  });

  const register = async (values: FormType) => {
    const { email, password } = values;
    try {
      setIsSigning(true);
      await signInWithEmailAndPassword(auth, email, password);
      setIsSigning(false);
      router.back();
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <Box className="p-5">
      <VStack className="w-full justify-center gap-y-8">
        <Heading>Connexion</Heading>

        <VStack className="gap-y-4">
          <FormControl
            isInvalid={!!errors?.email}
            size="md"
            isDisabled={false}
            isReadOnly={false}
            isRequired={false}
          >
            <FormControlLabel>
              <FormControlLabelText>Email</FormControlLabelText>
            </FormControlLabel>
            <Input className="my-1">
              <Controller
                control={control}
                name="email"
                rules={{ required: true }}
                render={({ field: { onChange, value } }) => (
                  <InputField
                    placeholder="Email"
                    value={value}
                    onChangeText={onChange}
                  />
                )}
              />
            </Input>
            <FormControlError>
              <FormControlErrorIcon as={AlertCircleIcon} />
              <FormControlErrorText>
                {errors?.email?.message}
              </FormControlErrorText>
            </FormControlError>
          </FormControl>

          <FormControl
            isInvalid={!!errors?.password}
            size="md"
            isDisabled={false}
            isReadOnly={false}
            isRequired={false}
          >
            <FormControlLabel>
              <FormControlLabelText>Mot de passe</FormControlLabelText>
            </FormControlLabel>
            <Input className="my-1">
              <Controller
                control={control}
                name="password"
                rules={{ required: true }}
                render={({ field: { onChange, value } }) => (
                  <InputField
                    type="password"
                    placeholder="Mot de passe"
                    value={value}
                    onChangeText={onChange}
                  />
                )}
              />
            </Input>
            <FormControlHelper>
              <FormControlHelperText>
                Minimum 8 caractères
              </FormControlHelperText>
            </FormControlHelper>
            <FormControlError>
              <FormControlErrorIcon as={AlertCircleIcon} />
              <FormControlErrorText>
                {errors?.password?.message}
              </FormControlErrorText>
            </FormControlError>
          </FormControl>
        </VStack>
        <Button onPress={handleSubmit(register)}>
          {isSigning && <ButtonSpinner color={colors.gray[400]} />}
          <ButtonText>Se connecter</ButtonText>
        </Button>
        <Button onPress={() => router.replace("/auth/register")}>
          <ButtonText>S'inscrire</ButtonText>
        </Button>
      </VStack>
    </Box>
  );
};

export default LoginForm;
