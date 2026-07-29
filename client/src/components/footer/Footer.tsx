import { Anchor, Box, Container, Divider, Group, Stack, Text } from '@mantine/core';
import Logo from '@/common/Logo';

const Footer = () => (
  <Box component="footer" bg="dark.9" c="gray.3" py={48}>
    <Container size="xl">
      <Group justify="space-between" align="flex-start" gap="xl">
        <Stack gap="sm" maw={380}>
          <Box><Logo inverted /></Box>
          <Text c="gray.5" size="sm">
            Flexible desks, private offices and meeting rooms for productive
            people and growing teams.
          </Text>
        </Stack>
        <Group gap="xl">
          <Anchor c="gray.4" href="#spaces">Spaces</Anchor>
          <Anchor c="gray.4" href="#amenities">Amenities</Anchor>
          <Anchor c="gray.4" href="#availability">Availability</Anchor>
          <Anchor c="gray.4" href="mailto:hello@cospace.com">Contact</Anchor>
        </Group>
      </Group>
      <Divider color="dark.6" my="xl" />
      <Text c="gray.6" size="xs">
        © {new Date().getFullYear()} CoSpace. All rights reserved.
      </Text>
    </Container>
  </Box>
);

export default Footer;
