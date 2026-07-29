import { useMemo, useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Container,
  Grid,
  Group,
  Paper,
  ScrollArea,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';
import { DatePicker } from '@mantine/dates';
import { FiCalendar, FiCheckCircle, FiClock, FiLock, FiRefreshCw } from 'react-icons/fi';

const allSlots = [
  '08:00 AM – 10:00 AM',
  '10:00 AM – 12:00 PM',
  '12:00 PM – 02:00 PM',
  '02:00 PM – 04:00 PM',
  '04:00 PM – 06:00 PM',
  '06:00 PM – 08:00 PM',
];

const AvailabilitySection = () => {
  const [selectedDate, setSelectedDate] = useState<Date | string | null>(new Date());

  const availableSlots = useMemo(() => {
    const day = selectedDate ? new Date(selectedDate).getDay() : 0;
    return allSlots.filter((_, index) => (index + day) % 4 !== 0);
  }, [selectedDate]);

  return (
    <Box
      component="section"
      id="availability"
      py={{ base: 64, sm: 96 }}
      bg="light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-8))"
    >
      <Container size="xl">
        <Grid gap={{ base: 42, md: 72 }} align="center">
          <Grid.Col span={{ base: 12, md: 5 }}>
            <Stack gap="lg">
              <Badge color="teal" variant="light" size="lg">Live availability</Badge>
              <Title order={2} fz={{ base: 34, sm: 48 }} lh={1.1}>
                Browse spaces and find a time that works
              </Title>
              <Text c="dimmed" fz="lg">
                Explore available desks and meeting rooms, open their details,
                and check live availability before making a booking.
              </Text>
              <Stack gap="md">
                <Group wrap="nowrap">
                  <ThemeIcon color="teal" variant="light" radius="xl"><FiCheckCircle /></ThemeIcon>
                  <Text>See available desks and meeting rooms</Text>
                </Group>
                <Group wrap="nowrap">
                  <ThemeIcon color="teal" variant="light" radius="xl"><FiCalendar /></ThemeIcon>
                  <Text>Check availability for any future date</Text>
                </Group>
                <Group wrap="nowrap">
                  <ThemeIcon color="teal" variant="light" radius="xl"><FiRefreshCw /></ThemeIcon>
                  <Text>Availability updates as the selected date changes</Text>
                </Group>
              </Stack>
              <Button
                component="a"
                href="#spaces"
                color="teal"
                size="lg"
                w="fit-content"
                rightSection={<FiCalendar />}
              >
                Browse available spaces
              </Button>
            </Stack>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 7 }}>
            <Paper withBorder shadow="md" radius="xl" p={{ base: 'md', sm: 'xl' }}>
              <Group justify="space-between" mb="lg">
                <Box>
                  <Text fw={700} fz="lg">Workspace availability</Text>
                  <Text size="sm" c="dimmed">Select a date to see open times</Text>
                </Box>
                <Badge color="teal" variant="light" leftSection={<FiRefreshCw />}>
                  Live
                </Badge>
              </Group>
              <Grid>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <DatePicker
                    value={selectedDate}
                    onChange={setSelectedDate}
                    minDate={new Date()}
                    size="md"
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <Paper
                    radius="lg"
                    p="md"
                    bg="light-dark(var(--mantine-color-teal-0), var(--mantine-color-dark-7))"
                  >
                    <Group justify="space-between" mb="md">
                      <Group gap="xs">
                        <FiClock />
                        <Text fw={700}>Open time slots</Text>
                      </Group>
                      <Badge color="teal" variant="light">2 hours each</Badge>
                    </Group>
                    <ScrollArea.Autosize mah={230} type="auto" offsetScrollbars scrollbarSize={6}>
                      <SimpleGrid cols={1} spacing="xs">
                        {allSlots.map((slot) => {
                          const isAvailable = availableSlots.includes(slot);
                          return (
                            <Button
                              key={slot}
                              variant={isAvailable ? 'default' : 'subtle'}
                              color={isAvailable ? 'teal' : 'gray'}
                              disabled={!isAvailable}
                              justify="space-between"
                              px="sm"
                              rightSection={
                                <Badge
                                  color={isAvailable ? 'teal' : 'red'}
                                  variant="light"
                                  size="xs"
                                  leftSection={isAvailable ? <FiCheckCircle /> : <FiLock />}
                                >
                                  {isAvailable ? 'Available' : 'Booked'}
                                </Badge>
                              }
                              styles={{
                                label: {
                                  overflow: 'visible',
                                },
                                root: !isAvailable
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
            </Paper>
          </Grid.Col>
        </Grid>
      </Container>
    </Box>
  );
};

export default AvailabilitySection;
