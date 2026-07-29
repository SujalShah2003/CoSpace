import { useMemo, useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Divider,
  Grid,
  Group,
  Paper,
  ScrollArea,
  SimpleGrid,
  Text,
  ThemeIcon,
} from '@mantine/core';
import { DatePicker } from '@mantine/dates';
import {
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiLock,
} from 'react-icons/fi';

const timeSlots = [
  '08:00 AM – 10:00 AM',
  '10:00 AM – 12:00 PM',
  '12:00 PM – 02:00 PM',
  '02:00 PM – 04:00 PM',
  '04:00 PM – 06:00 PM',
  '06:00 PM – 08:00 PM',
];

type DateValue = Date | string | null;

type RealtimeAvailabilityPanelProps = {
  spaceKey: string;
  actionLabel: string;
  onAction?: () => void;
};

const getAvailableSlots = (selectedDate: DateValue, spaceKey: string) => {
  const day = selectedDate ? new Date(selectedDate).getDay() : 0;
  const seed = day + spaceKey.length;
  const bookedInterval = seed % 2 === 0 ? 3 : 2;

  return timeSlots.filter(
    (_, index) => (index + seed) % bookedInterval !== 0,
  );
};

const RealtimeAvailabilityPanel = ({
  spaceKey,
  actionLabel,
  onAction,
}: RealtimeAvailabilityPanelProps) => {
  const [selectedDate, setSelectedDate] = useState<DateValue>(() => new Date());
  const [selectedSlot, setSelectedSlot] = useState(
    () => getAvailableSlots(new Date(), spaceKey)[0] ?? '',
  );

  const availableSlots = useMemo(
    () => getAvailableSlots(selectedDate, spaceKey),
    [selectedDate, spaceKey],
  );

  const handleDateChange = (value: DateValue) => {
    const nextAvailableSlots = getAvailableSlots(value, spaceKey);
    setSelectedDate(value);
    setSelectedSlot(nextAvailableSlots[0] ?? '');
  };

  return (
    <Paper
      withBorder
      radius="lg"
      p="lg"
      bg="light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-7))"
    >
      <Group mb="md">
        <ThemeIcon color="teal" variant="light" size="xl">
          <FiCalendar />
        </ThemeIcon>
        <Box>
          <Text fw={700}>Real-time availability</Text>
          <Text size="xs" c="dimmed">Choose a date and available time</Text>
        </Box>
      </Group>

      <Grid gap="0" align="stretch">
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <DatePicker
            value={selectedDate}
            onChange={handleDateChange}
            minDate={new Date()}
            size="md"
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6 }}>
          <Divider hiddenFrom="sm" mb="lg" />
          <Paper
            h="100%"
            radius="md"
            p="md"
            bg="light-dark(var(--mantine-color-white), var(--mantine-color-dark-6))"
          >
            <Group justify="space-between" mb="md">
              <Group gap={6}>
                <FiClock />
                <Text fw={600}>Time slots</Text>
              </Group>
              <Badge color="teal" variant="light">2 hours each</Badge>
            </Group>
            <ScrollArea.Autosize mah={230} type="auto" offsetScrollbars scrollbarSize={6}>
              <SimpleGrid cols={1} spacing="xs">
                {timeSlots.map((slot) => {
                  const available = availableSlots.includes(slot);

                  return (
                    <Button
                      key={slot}
                      variant={selectedSlot === slot ? 'filled' : 'default'}
                      color="teal"
                    disabled={!available}
                    onClick={() => setSelectedSlot(slot)}
                    justify="space-between"
                    px="sm"
                    rightSection={
                      <Badge
                        color={available ? 'teal' : 'red'}
                        variant="light"
                        size="xs"
                        leftSection={available ? <FiCheckCircle /> : <FiLock />}
                        >
                          {available ? 'Available' : 'Booked'}
                        </Badge>
                      }
                    styles={{
                      label: {
                        overflow: 'visible',
                      },
                      root: !available
                          ? {
                              opacity: 1,
                              background:
                                'light-dark(var(--mantine-color-gray-1), var(--mantine-color-dark-5))',
                            }
                          : undefined,
                      }}
                    >
                      {slot}
                    </Button>
                  );
                })}
              </SimpleGrid>
            </ScrollArea.Autosize>
          </Paper>
        </Grid.Col>
      </Grid>

      <Button
        fullWidth
        color="teal"
        size="md"
        mt="xl"
        leftSection={<FiCalendar />}
        disabled={!selectedSlot}
        onClick={onAction}
      >
        {actionLabel}
      </Button>
    </Paper>
  );
};

export default RealtimeAvailabilityPanel;
