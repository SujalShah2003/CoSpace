import {
  Badge,
  Box,
  Group,
  Image,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';
import { FiUsers } from 'react-icons/fi';
import AppModal from '@/components/modal/AppModal';
import type { Space } from './data.temp';
import RealtimeAvailabilityPanel from './RealtimeAvailabilityPanel';

type BookingModalProps = {
  space: Space | null;
  opened: boolean;
  onClose: () => void;
};

const BookingModal = ({ space, opened, onClose }: BookingModalProps) => {
  if (!space) {
    return null;
  }

  return (
    <AppModal opened={opened} onClose={onClose} title="Book a workspace">
      <Stack gap="xl">
        <Group align="flex-start" wrap="nowrap">
          <Image
            src={space.image}
            alt={space.name}
            w={150}
            h={110}
            radius="md"
            fit="cover"
          />
          <Box>
            <Badge color="teal" variant="light" mb="xs">{space.type}</Badge>
            <Title order={2}>{space.name}</Title>
            <Group gap="xs" mt="xs" c="dimmed">
              <ThemeIcon color="teal" variant="light" size="sm">
                <FiUsers />
              </ThemeIcon>
              <Text size="sm">Up to {space.capacity} people</Text>
            </Group>
          </Box>
        </Group>

        <RealtimeAvailabilityPanel
          spaceKey={space.name}
          actionLabel="Book selected slot"
        />
      </Stack>
    </AppModal>
  );
};

export default BookingModal;
