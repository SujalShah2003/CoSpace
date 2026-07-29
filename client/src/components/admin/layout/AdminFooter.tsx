import { Group, Text } from '@mantine/core';

const AdminFooter = () => (
  <Group h="100%" justify="space-between" px={{ base: 'md', sm: 'xl' }}>
    <Text size="xs" c="dimmed">
      © {new Date().getFullYear()} CoSpace
    </Text>
    <Text size="xs" c="dimmed">
      Administration portal
    </Text>
  </Group>
);

export default AdminFooter;
