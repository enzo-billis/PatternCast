import { usePathname, useRouter } from "expo-router";
import { FilesIcon, Home, Settings } from "lucide-react-native";
import { Button, ButtonGroup, ButtonIcon } from "./ui/button";
import { HStack } from "./ui/hstack";

const Menu = () => {
  const router = useRouter();
  const path = usePathname();
  return (
    <HStack className="w-full justify-between pb-10 pt-6 px-10">
      <ButtonGroup>
        <Button variant="link" onPress={() => router.push("/files")}>
          <ButtonIcon
            className="h-8 w-8"
            color={path === "/files" ? "pink" : "black"}
            as={FilesIcon}
          />
        </Button>
      </ButtonGroup>
      <ButtonGroup>
        <Button variant="link" onPress={() => router.push("/", {})}>
          <ButtonIcon
            className="h-8 w-8"
            color={path === "/" ? "pink" : "black"}
            as={Home}
          />
        </Button>
      </ButtonGroup>
      <ButtonGroup>
        <Button variant="link" onPress={() => router.push("/settings")}>
          <ButtonIcon
            className="h-8 w-8"
            color={
              path === "/settings" || path.startsWith("/auth")
                ? "pink"
                : "black"
            }
            as={Settings}
          />
        </Button>
      </ButtonGroup>
    </HStack>
  );
};

export default Menu;
