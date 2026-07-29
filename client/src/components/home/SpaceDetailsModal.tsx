import {
  Badge,
  Box,
  Grid,
  Group,
  Image,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';
import { FiCheck, FiUsers, FiWifi } from 'react-icons/fi';
import AppModal from '@/components/modal/AppModal';
import type { Space } from './data.temp';

type SpaceDetailsModalProps = {
  space: Space | null;
  opened: boolean;
  onClose: () => void;
};

const SpaceDetailsModal = ({
  space,
  opened,
  onClose,
}: SpaceDetailsModalProps) => {
  if (!space) {
    return null;
  }

  return (
    <AppModal opened={opened} onClose={onClose} title="Workspace details">
      <Grid gap="xl">
        <Grid.Col span={12}>
          <Stack>
            <Image
              src={space.image}
              alt={space.name}
              h={280}
              radius="lg"
              fit="cover"
            />
            <Box>
              <Badge color="teal" variant="light" mb="xs">{space.type}</Badge>
              <Title order={2}>{space.name}</Title>
            </Box>

            <Text c="dimmed">{space.description}</Text>

            <SimpleGrid cols={{ base: 1, sm: 2 }}>
              <Paper withBorder radius="md" p="md">
                <Group wrap="nowrap">
                  <ThemeIcon color="teal" variant="light"><FiUsers /></ThemeIcon>
                  <Box>
                    <Text size="xs" c="dimmed">Capacity</Text>
                    <Text fw={600}>Up to {space.capacity}</Text>
                  </Box>
                </Group>
              </Paper>
              <Paper withBorder radius="md" p="md">
                <Group wrap="nowrap">
                  <ThemeIcon color="teal" variant="light"><FiWifi /></ThemeIcon>
                  <Box>
                    <Text size="xs" c="dimmed">Connectivity</Text>
                    <Text fw={600}>Fast Wi-Fi</Text>
                  </Box>
                </Group>
              </Paper>
            </SimpleGrid>

            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
              {space.amenities
                .filter((amenity) => amenity.toLowerCase() !== 'fast wi-fi')
                .map((amenity) => (
                  <Paper key={amenity} withBorder radius="md" p="md">
                    <Group wrap="nowrap">
                      <ThemeIcon color="teal" variant="light"><FiCheck /></ThemeIcon>
                      <Box>
                        <Text size="xs" c="dimmed">Amenity</Text>
                        <Text fw={600}>{amenity}</Text>
                      </Box>
                    </Group>
                  </Paper>
                ))}
            </SimpleGrid>
          </Stack>
        </Grid.Col>
      </Grid>
    </AppModal>
  );
};

export default SpaceDetailsModal;
