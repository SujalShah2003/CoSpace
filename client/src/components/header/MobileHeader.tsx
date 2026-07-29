import { Box, Button, Divider, Stack } from "@mantine/core";
import { Link } from "react-router-dom";
import { navLinks } from "./navLinks.temp";

type MobileHeaderProps = {
  close: () => void;
};

const MobileHeader = ({ close }: MobileHeaderProps) => {
  return (
    <Stack h="100%" justify="space-between" py="md">
      {/* Navigation */}
      <Stack gap="xs">
        {navLinks.map((link) => (
          <Button
            key={link.label}
            component={Link}
            to={link.href}
            variant="subtle"
            color="dark"
            justify="flex-start"
            fullWidth
            size="md"
            onClick={close}
          >
            {link.label}
          </Button>
        ))}
      </Stack>

      {/* Bottom Actions */}
      <Box>
        <Divider mb="md" />

        <Stack gap="sm">
          <Button
            component={Link}
            to="/signin"
            variant="default"
            fullWidth
            size="md"
            onClick={close}
          >
            Sign in
          </Button>

          <Button
            component={Link}
            to="/signup"
            color="teal"
            fullWidth
            size="md"
            onClick={close}
          >
            Sign up
          </Button>
        </Stack>
      </Box>
    </Stack>
  );
};

export default MobileHeader;