import { useState } from 'react';
import {
  ActionIcon,
  Alert,
  Avatar,
  Badge,
  Box,
  Button,
  Group,
  Loader,
  Pagination,
  Paper,
  Select,
  Stack,
  Table,
  Text,
  ThemeIcon,
  Title,
  Tooltip,
} from '@mantine/core';
import dayjs from 'dayjs';
import {
  FiCalendar,
  FiCheck,
  FiClock,
  FiInbox,
  FiUser,
  FiX,
} from 'react-icons/fi';
import { Navigate } from 'react-router-dom';
import AdminBreadcrumbs from '@/components/admin/common/AdminBreadcrumbs';
import AppModal from '@/components/modal/AppModal';
import { useBookingRequests } from '@/hooks/useBookingRequests';
import { getApiError } from '@/services/apiClient';
import type {
  BookingRequest,
  BookingStatus,
} from '@/services/bookings.api';
import { getCurrentUser } from '@/utils/auth';

type ReviewAction = 'approved' | 'rejected';
type PendingConfirmation = {
  request: BookingRequest;
  action: ReviewAction;
};

const statusColors: Record<BookingStatus, string> = {
  pending: 'blue',
  approved: 'green',
  rejected: 'red',
  cancelled: 'gray',
};

const BookingRequestsPage = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { requests, pagination, loading, updateStatus } =
    useBookingRequests({ page, pageSize });
  const [confirmation, setConfirmation] =
    useState<PendingConfirmation | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  if (getCurrentUser()?.role !== 'admin') {
    return <Navigate to="/admin/bookings" replace />;
  }

  const closeConfirmation = () => {
    if (submitting) return;
    setConfirmation(null);
    setActionError(null);
  };

  const confirmReview = async () => {
    if (!confirmation) return;
    setSubmitting(true);
    setActionError(null);
    try {
      await updateStatus(
        confirmation.request.id,
        confirmation.action,
      );
      setConfirmation(null);
    } catch (error) {
      setActionError(
        getApiError(error, 'Unable to review this booking request.'),
      );
    } finally {
      setSubmitting(false);
    }
  };

  const sortedRequests = requests.slice().sort(
    (left, right) =>
      new Date(right.createdAt).getTime() -
      new Date(left.createdAt).getTime(),
  );

  return (
    <Stack gap={32}>
      <Stack gap="sm">
        <AdminBreadcrumbs current="Manage bookings" />
        <Title order={1} fz={{ base: 36, sm: 46 }}>
          Manage bookings
        </Title>
        <Text c="dimmed" fz="lg">
          Review member booking requests and manage approvals for every
          workspace and time slot.
        </Text>
      </Stack>

      <Paper withBorder radius="xl" shadow="xs" style={{ overflow: 'hidden' }}>
        <Group justify="space-between" p="xl">
          <Box>
            <Title order={2} fz="xl">
              Booking requests
            </Title>
            <Text c="dimmed" size="sm">
              Pending requests require administrator confirmation.
            </Text>
          </Box>
          <Badge color="blue" variant="light" size="lg">
            {requests.filter((request) => request.status === 'pending').length}{' '}
            pending
          </Badge>
        </Group>

        <Table.ScrollContainer minWidth={980}>
          <Table
            verticalSpacing="lg"
            horizontalSpacing="xl"
            highlightOnHover
          >
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Requested by</Table.Th>
                <Table.Th>Workspace</Table.Th>
                <Table.Th>Date</Table.Th>
                <Table.Th>Time slot</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th ta="center">Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {loading ? (
                <Table.Tr>
                  <Table.Td colSpan={6}>
                    <Group justify="center" py={48}>
                      <Loader color="teal" />
                      <Text c="dimmed">Loading booking requests…</Text>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ) : sortedRequests.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={6}>
                    <Stack align="center" gap="xs" py={56}>
                      <ThemeIcon color="gray" variant="light" size={54} radius="xl">
                        <FiInbox size={24} />
                      </ThemeIcon>
                      <Text fw={700}>No booking requests</Text>
                      <Text c="dimmed" size="sm">
                        New member requests will appear here.
                      </Text>
                    </Stack>
                  </Table.Td>
                </Table.Tr>
              ) : (
                sortedRequests.map((request) => (
                  <Table.Tr key={request.id}>
                    <Table.Td>
                      <Group wrap="nowrap">
                        <Avatar color="teal" radius="xl">
                          {request.requestedBy.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Text fw={700}>{request.requestedBy}</Text>
                          <Text c="dimmed" size="xs">
                            {request.requestedByEmail}
                          </Text>
                        </Box>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Text fw={600}>{request.spaceName}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs" wrap="nowrap">
                        <FiCalendar />
                        <Text>
                          {dayjs(request.date).format('DD MMM YYYY')}
                        </Text>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs" wrap="nowrap">
                        <FiClock />
                        <Text>{request.slot}</Text>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Badge
                        color={statusColors[request.status]}
                        variant="light"
                      >
                        {request.status}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      {request.status === 'pending' ? (
                        <Group justify="center" gap="xs" wrap="nowrap">
                          <Tooltip label="Approve request" withArrow>
                            <ActionIcon
                              color="green"
                              variant="light"
                              size="lg"
                              aria-label={`Approve ${request.requestedBy}'s booking request`}
                              onClick={() =>
                                setConfirmation({
                                  request,
                                  action: 'approved',
                                })
                              }
                            >
                              <FiCheck />
                            </ActionIcon>
                          </Tooltip>
                          <Tooltip label="Reject request" withArrow>
                            <ActionIcon
                              color="red"
                              variant="light"
                              size="lg"
                              aria-label={`Reject ${request.requestedBy}'s booking request`}
                              onClick={() =>
                                setConfirmation({
                                  request,
                                  action: 'rejected',
                                })
                              }
                            >
                              <FiX />
                            </ActionIcon>
                          </Tooltip>
                        </Group>
                      ) : (
                        <Text ta="center" c="dimmed" size="sm">
                          Reviewed
                        </Text>
                      )}
                    </Table.Td>
                  </Table.Tr>
                ))
              )}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </Paper>

      <Group justify="space-between" align="center">
        <Group gap="xs">
          <Text size="sm" c="dimmed">
            Rows per page
          </Text>
          <Select
            aria-label="Rows per page"
            data={['5', '10', '20', '50']}
            value={String(pageSize)}
            onChange={(value) => {
              setPageSize(Number(value ?? 10));
              setPage(1);
            }}
            allowDeselect={false}
            w={90}
          />
          <Text size="sm" c="dimmed">
            {pagination
              ? `${pagination.total} total request${pagination.total === 1 ? '' : 's'}`
              : ''}
          </Text>
        </Group>

        <Pagination
          value={pagination?.page ?? page}
          onChange={setPage}
          total={pagination?.totalPages ?? 1}
          color="teal"
          withEdges
        />
      </Group>

      <AppModal
        opened={confirmation !== null}
        onClose={closeConfirmation}
        title={
          confirmation?.action === 'approved'
            ? 'Approve booking request?'
            : 'Reject booking request?'
        }
        size="md"
      >
        <Stack gap="lg">
          {actionError && (
            <Alert color="red" title="Unable to update request">
              {actionError}
            </Alert>
          )}

          <Text c="dimmed">
            {confirmation?.action === 'approved'
              ? 'This will confirm the workspace and time slot for the member.'
              : 'This will reject the request and make the time slot available again.'}
          </Text>

          <Paper withBorder radius="lg" p="lg">
            <Stack gap="md">
              <Group wrap="nowrap">
                <ThemeIcon color="teal" variant="light">
                  <FiUser />
                </ThemeIcon>
                <Box>
                  <Text size="xs" c="dimmed">Requested by</Text>
                  <Text fw={700}>{confirmation?.request.requestedBy}</Text>
                  <Text size="xs" c="dimmed">
                    {confirmation?.request.requestedByEmail}
                  </Text>
                </Box>
              </Group>
              <Box>
                <Text size="xs" c="dimmed">Workspace</Text>
                <Text fw={700}>{confirmation?.request.spaceName}</Text>
              </Box>
              <Box>
                <Text size="xs" c="dimmed">Date and time</Text>
                <Text fw={700}>
                  {confirmation &&
                    dayjs(confirmation.request.date).format('DD MMMM YYYY')}{' '}
                  · {confirmation?.request.slot}
                </Text>
              </Box>
            </Stack>
          </Paper>

          <Group justify="flex-end">
            <Button
              variant="default"
              onClick={closeConfirmation}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              color={
                confirmation?.action === 'approved' ? 'green' : 'red'
              }
              leftSection={
                confirmation?.action === 'approved' ? <FiCheck /> : <FiX />
              }
              loading={submitting}
              onClick={() => void confirmReview()}
            >
              {confirmation?.action === 'approved'
                ? 'Approve request'
                : 'Reject request'}
            </Button>
          </Group>
        </Stack>
      </AppModal>
    </Stack>
  );
};

export default BookingRequestsPage;
