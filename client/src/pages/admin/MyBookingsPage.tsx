import { useMemo, useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Group,
  Paper,
  Stack,
  Table,
  Text,
  Title,
} from '@mantine/core';
import dayjs from 'dayjs';
import { Link } from 'react-router-dom';
import {
  FiPlus,
  FiCalendar,
  FiXCircle,
} from 'react-icons/fi';
import AppModal from '@/components/modal/AppModal';
import AdminBreadcrumbs from '@/components/admin/common/AdminBreadcrumbs';
import { useBookingRequests } from '@/hooks/useBookingRequests';
import { getCurrentUser } from '@/utils/auth';
import {
  canCancelBooking,
  type BookingRequest,
  type BookingStatus,
} from '@/utils/bookingRequests';

const statusColors: Record<BookingStatus, string> = {
  pending: 'blue',
  approved: 'red',
  rejected: 'gray',
  cancelled: 'gray',
};

const MyBookingsPage = () => {
  const { requests, updateStatus } = useBookingRequests();
  const user = getCurrentUser();
  const [bookingToCancel, setBookingToCancel] =
    useState<BookingRequest | null>(null);

  const ownBookings = useMemo(
    () =>
      requests
        .filter(
          (request) =>
            request.requestedByEmail === user?.email ||
            (!request.requestedByEmail &&
              request.requestedBy === user?.name),
        )
        .slice()
        .reverse(),
    [requests, user?.email, user?.name],
  );

  const confirmCancellation = () => {
    if (!bookingToCancel || !canCancelBooking(bookingToCancel)) {
      return;
    }

    updateStatus(bookingToCancel.id, 'cancelled');
    setBookingToCancel(null);
  };

  return (
    <Stack gap={32}>
      <Group justify="space-between" align="center">
        <Box>
          <AdminBreadcrumbs current="My bookings" />
          <Title order={1} fz={{ base: 36, sm: 46 }} mt="sm">
            My bookings
          </Title>
          <Text c="dimmed" fz="lg">
            Track requests and cancel future pending or approved bookings.
          </Text>
        </Box>
        <Button
          size="md"
          component={Link}
          to="/admin/bookings/new"
          color="teal"
          leftSection={<FiPlus />}
        >
          Book now
        </Button>
      </Group>

      <Paper withBorder radius="xl" shadow="xs">
        <Table.ScrollContainer minWidth={760}>
          <Table verticalSpacing="lg" horizontalSpacing="xl">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Workspace</Table.Th>
                <Table.Th>Date</Table.Th>
                <Table.Th>Start / end time</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Action</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {ownBookings.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={5}>
                    <Stack align="center" gap="xs" py={48}>
                      <FiCalendar size={28} />
                      <Text fw={700}>No bookings yet</Text>
                      <Text c="dimmed" size="sm">
                        Choose a space from the Bookings page to send a request.
                      </Text>
                    </Stack>
                  </Table.Td>
                </Table.Tr>
              ) : (
                ownBookings.map((booking) => {
                  const cancellable = canCancelBooking(booking);

                  return (
                    <Table.Tr key={booking.id}>
                      <Table.Td fw={700}>{booking.spaceName}</Table.Td>
                      <Table.Td>
                        {dayjs(booking.date).format('DD MMM YYYY')}
                      </Table.Td>
                      <Table.Td>{booking.slot}</Table.Td>
                      <Table.Td>
                        <Badge
                          color={statusColors[booking.status]}
                          variant="light"
                        >
                          {booking.status}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Button
                          size="xs"
                          color="red"
                          variant="light"
                          leftSection={<FiXCircle />}
                          disabled={!cancellable}
                          onClick={() => setBookingToCancel(booking)}
                        >
                          Cancel
                        </Button>
                      </Table.Td>
                    </Table.Tr>
                  );
                })
              )}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </Paper>

      <AppModal
        opened={bookingToCancel !== null}
        onClose={() => setBookingToCancel(null)}
        title="Cancel booking?"
        size="md"
      >
        <Stack>
          <Text c="dimmed">
            This will release the slot so another member can request it.
          </Text>
          <Paper withBorder radius="lg" p="lg">
            <Text fw={700}>{bookingToCancel?.spaceName}</Text>
            <Text c="dimmed" size="sm" mt={4}>
              {bookingToCancel &&
                dayjs(bookingToCancel.date).format('DD MMMM YYYY')}{' '}
              · {bookingToCancel?.slot}
            </Text>
          </Paper>
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setBookingToCancel(null)}>
              Keep booking
            </Button>
            <Button color="red" onClick={confirmCancellation}>
              Confirm cancellation
            </Button>
          </Group>
        </Stack>
      </AppModal>
    </Stack>
  );
};

export default MyBookingsPage;
