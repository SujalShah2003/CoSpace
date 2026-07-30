import { useEffect, useState } from 'react';
import {
  ActionIcon,
  Alert,
  Badge,
  Box,
  Button,
  Grid,
  Group,
  Paper,
  Select,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
  Tooltip,
} from '@mantine/core';
import { DatePicker } from '@mantine/dates';
import dayjs from 'dayjs';
import {
  FiAlertCircle,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiHelpCircle,
  FiLock,
  FiSend,
} from 'react-icons/fi';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AppModal from '@/components/modal/AppModal';
import AdminBreadcrumbs from '@/components/admin/common/AdminBreadcrumbs';
import { useBookingRequests } from '@/hooks/useBookingRequests';
import { useSpaces } from '@/hooks/useSpaces';
import { getAvailableSlots, type BookingSlot } from '@/services/spaces.api';
import { getApiError } from '@/services/apiClient';

const statusConfig = {
  available: { label: 'Available', color: 'green', icon: <FiCheckCircle /> },
  pending: { label: 'Pending', color: 'blue', icon: <FiClock /> },
  approved: { label: 'Booked', color: 'red', icon: <FiLock /> },
  rejected: { label: 'Disabled', color: 'gray', icon: <FiLock /> },
};

const BookNowPage = () => {
  const { spaces } = useSpaces();
  const availableSpaces = spaces.filter(
    (item) => item.status !== 'unavailable',
  );
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const requestedSpaceId = searchParams.get('space');
  const [selectedSpaceId, setSelectedSpaceId] = useState<string | null>(
    availableSpaces.some((item) => item.id === requestedSpaceId)
      ? requestedSpaceId
      : null,
  );
  const effectiveSpaceId =
    selectedSpaceId ||
    (availableSpaces.some((item) => item.id === requestedSpaceId)
      ? requestedSpaceId
      : null);
  const space = availableSpaces.find((item) => item.id === effectiveSpaceId);
  const [selectedDate, setSelectedDate] = useState<Date | string | null>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [requestError, setRequestError] = useState<string | null>(null);
  const { createRequest } = useBookingRequests();
  const [apiSlots, setApiSlots] = useState<BookingSlot[]>([]);
  const dateKey = dayjs(selectedDate).format('YYYY-MM-DD');

  useEffect(() => {
    if (!effectiveSpaceId) return;
    void getAvailableSlots(effectiveSpaceId, dateKey)
      .then(setApiSlots)
      .catch((error) =>
        setRequestError(getApiError(error, 'Unable to load available slots.')),
      );
  }, [dateKey, effectiveSpaceId]);

  const confirmRequest = async () => {
    if (!selectedSlot || !space) {
      return;
    }

    const slot = apiSlots.find((item) => item.label === selectedSlot);
    if (!slot) return;

    try {
      await createRequest({
        spaceId: space.id,
        date: dateKey,
        startTime: slot.startTime,
        endTime: slot.endTime,
      });
      setRequestError(null);
      setSelectedSlot(null);
      navigate('/admin/my-bookings');
    } catch (error) {
      setRequestError(getApiError(error, 'This time is no longer available.'));
    }
  };

  return (
    <Stack gap={32}>
      <Box>
        <AdminBreadcrumbs current="Book now" />
        <Title order={1} fz={{ base: 34, sm: 44 }} mt="sm">
          Book a space
        </Title>
        <Text c="dimmed" fz="lg">
          Select a workspace, date and available two-hour time slot.
        </Text>
      </Box>

      <Paper withBorder radius="xl" p={{ base: 'md', sm: 'xl' }} shadow="xs">
        <Select
          label="Workspace"
          placeholder="Select an available space"
          description="Choose the workspace you want to book"
          data={availableSpaces.map((item) => ({
            value: item.id,
            label: `${item.name} · ${item.type}`,
          }))}
          value={effectiveSpaceId}
          onChange={(value) => {
            setSelectedSpaceId(value);
            setApiSlots([]);
            setSelectedSlot(null);
            setRequestError(null);
            setSearchParams(value ? { space: value } : {});
          }}
          checkIconPosition='right'
          searchable
          required
          size="md"
          mb="xl"
        />

        {!space ? (
          <Paper
            withBorder
            radius="lg"
            p={{ base: 36, sm: 64 }}
            bg="light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-7))"
          >
            <Stack align="center" gap="md">
              <ThemeIcon color="teal" variant="light" size={64} radius="xl">
                <FiCalendar size={28} />
              </ThemeIcon>
              <Stack align="center" gap={6}>
                <Title order={3} ta="center">
                  Please select a workspace
                </Title>
                <Text c="dimmed" ta="center" maw={520}>
                  Choose a workspace above to view the calendar and its
                  available booking slots.
                </Text>
              </Stack>
            </Stack>
          </Paper>
        ) : (
          <>
            <Group justify="space-between" gap="md" mb="xl">
              <Group>
                <ThemeIcon color="teal" variant="light" size="xl">
                  <FiCalendar />
                </ThemeIcon>
                <Box>
                  <Group gap="xs">
                    <Text fw={700} fz="lg">Available slots</Text>
                    <Tooltip
                      label="Select a date to view the workspace availability."
                      position="top"
                      withArrow
                    >
                      <ActionIcon
                        variant="subtle"
                        color="gray"
                        size="sm"
                        aria-label="Slot selection help"
                      >
                        <FiHelpCircle />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                  <Text c="dimmed" size="sm">
                    All bookings have a fixed two-hour duration
                  </Text>
                </Box>
              </Group>
              <Group gap="md">
                {Object.entries(statusConfig).map(([key, config]) => (
                  <Group key={key} gap={5}>
                    <Box
                      w={12}
                      h={12}
                      bg={`${config.color}.6`}
                      style={{ borderRadius: 3 }}
                    />
                    <Text size="xs">{config.label}</Text>
                  </Group>
                ))}
              </Group>
            </Group>

            <Grid gap="xl" align="center">
              <Grid.Col span={{ base: 12, lg: 4 }}>
                <Paper
                  radius="lg"
                  p="md"
                  bg="light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-7))"
                >
                  <DatePicker
                    value={selectedDate}
                    onChange={setSelectedDate}
                    minDate={new Date()}
                    size="md"
                    style={{ width: '100%' }}
                    styles={{
                      calendarHeader: {
                        width: '100%',
                        maxWidth: 'none',
                      },
                      month: {
                        width: '100%',
                        tableLayout: 'fixed',
                      },
                      day: {
                        width: '100%',
                        height: 44,
                      },
                    }}
                  />
                </Paper>
              </Grid.Col>

              <Grid.Col span={{ base: 12, lg: 8 }}>
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                  {apiSlots.map((slot) => {
                    const status =
                      slot.status === 'booked' ? 'approved' : slot.status;
                    const config = statusConfig[status];
                    const isAvailable = status === 'available';

                    return (
                      <Button
                        key={slot.label}
                        h={76}
                        size="md"
                        color={config.color}
                        variant="filled"
                        disabled={!isAvailable}
                        justify="space-between"
                        rightSection={
                          <Badge
                            color={config.color}
                            variant="white"
                            leftSection={config.icon}
                          >
                            {config.label}
                          </Badge>
                        }
                        onClick={() => setSelectedSlot(slot.label)}
                        styles={{
                          root: {
                            opacity: 1,
                            color: 'white',
                            backgroundColor: `var(--mantine-color-${config.color}-6)`,
                          },
                          label: { overflow: 'visible' },
                        }}
                      >
                        {slot.label}
                      </Button>
                    );
                  })}
                </SimpleGrid>
              </Grid.Col>
            </Grid>
          </>
        )}
      </Paper>

      <AppModal
        opened={selectedSlot !== null}
        onClose={() => {
          setRequestError(null);
          setSelectedSlot(null);
        }}
        title="Confirm booking request"
        size={660}
      >
        <Stack gap="lg">
          {requestError && (
            <Alert color="red" icon={<FiAlertCircle />} title="Unable to book">
              {requestError}
            </Alert>
          )}
          <Alert
            color="blue"
            variant="light"
            icon={<FiAlertCircle />}
            title="Administrator approval required"
            radius="md"
            p="lg"
          >
            This slot will be marked blue and remain pending until an
            administrator approves your request.
          </Alert>

          <Box>
            <Text fw={600} mb="sm">
              Review your booking details before continuing.
            </Text>
            <Paper withBorder radius="md" p="lg">
              <Stack gap="lg">
                <Box>
                  <Text size="sm" c="dimmed">Workspace</Text>
                  <Text fw={700} fz="lg" mt={4}>{space?.name}</Text>
                </Box>
                <Box>
                  <Text size="sm" c="dimmed">Date and time</Text>
                  <Text fw={700} fz="lg" mt={4}>
                    {dayjs(selectedDate).format('DD MMMM YYYY')} · {selectedSlot}
                  </Text>
                </Box>
              </Stack>
            </Paper>
          </Box>
          <Group justify="flex-end" mt="sm">
            <Button
              variant="default"
              size="md"
              h={54}
              px="xl"
              onClick={() => {
                setRequestError(null);
                setSelectedSlot(null);
              }}
            >
              Cancel
            </Button>
            <Button
              color="blue"
              size="md"
              h={54}
              px="xl"
              leftSection={<FiSend />}
              onClick={confirmRequest}
            >
              Send request
            </Button>
          </Group>
        </Stack>
      </AppModal>
    </Stack>
  );
};

export default BookNowPage;
