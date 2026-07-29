import {
  Badge,
  Box,
  Center,
  Grid,
  Group,
  Paper,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { FiCalendar, FiCheckCircle, FiShield, FiUsers } from "react-icons/fi";
import { Outlet } from "react-router-dom";
import Logo from "@/common/Logo";
import ToggleTheme from "@/components/toggle-theme/ToggleTheme";

const benefits = [
  { icon: <FiCalendar />, text: "Book desks and rooms in seconds" },
  { icon: <FiCheckCircle />, text: "See live availability before booking" },
  { icon: <FiShield />, text: "Secure access to your workspace" },
];

const AuthLayout = () => (
  <Grid mih="100vh" gap={0}>
    <Grid.Col
      span={{ base: 0, md: 6 }}
      visibleFrom="md"
      bg="teal.8"
      c="white"
      p={{ md: 56, xl: 80 }}
      pos="relative"
      style={{ overflow: "hidden" }}
    >
      <Box
        pos="absolute"
        w={420}
        h={420}
        top={-180}
        right={-160}
        bg="rgba(255,255,255,.08)"
        style={{ borderRadius: "50%" }}
      />
      <Box
        pos="absolute"
        w={380}
        h={380}
        bottom={-130}
        left={-110}
        bg="rgba(255,255,255,.06)"
        style={{ borderRadius: "50%" }}
      />
      <Stack h="100%" justify="space-between" pos="relative">
        <Logo inverted />
        <Stack gap="xl" maw={570}>
          <Badge
            bg="white"
            c="teal.9"
            px="md"
            size="lg"
            variant="filled"
            w="fit-content"
          >
            Welcome to CoSpace
          </Badge>
          <Title order={1} fz={{ md: 48, xl: 60 }} lh={1.06}>
            Your best work starts with the right space.
          </Title>
          <Text fz="xl" c="teal.0">
            Access flexible desks, collaborative rooms and a simpler way to
            manage every booking.
          </Text>
          <Stack gap="lg">
            {benefits.map((benefit) => (
              <Group key={benefit.text} wrap="nowrap">
                <ThemeIcon color="white" c="teal.8" radius="xl" size="lg">
                  {benefit.icon}
                </ThemeIcon>
                <Text fw={600}>{benefit.text}</Text>
              </Group>
            ))}
          </Stack>
        </Stack>
        <Paper bg="rgba(255,255,255,.12)" c="white" radius="lg" p="lg">
          <Group wrap="nowrap">
            <ThemeIcon color="white" c="teal.8" size="xl" radius="lg">
              <FiUsers />
            </ThemeIcon>
            <Box>
              <Text fw={700}>2,000+ productive members</Text>
              <Text size="sm" c="teal.0">
                Working better together with CoSpace
              </Text>
            </Box>
          </Group>
        </Paper>
      </Stack>
    </Grid.Col>

    <Grid.Col span={{ base: 12, md: 6 }} bg="var(--mantine-color-body)">
      <Group justify="space-between" p="lg" hiddenFrom="md">
        <Logo />
        <ToggleTheme />
      </Group>
      <Group justify="flex-end" p="lg" visibleFrom="md">
        <ToggleTheme />
      </Group>
      <Center
        px="lg"
        pb={60}
        mih={{ base: "calc(100vh - 80px)", md: "calc(100vh - 76px)" }}
      >
        <Box w="100%" maw={470}>
          <Outlet />
        </Box>
      </Center>
    </Grid.Col>
  </Grid>
);

export default AuthLayout;
