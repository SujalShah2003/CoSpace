import { useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Card,
  Grid,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Table,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';
import dayjs from 'dayjs';
import {
  FiArrowRight,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiGrid,
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import AdminBreadcrumbs from '@/components/admin/common/AdminBreadcrumbs';
import { useBookingRequests } from '@/hooks/useBookingRequests';
import { useSpaces } from '@/hooks/useSpaces';
import type { BookingStatus } from '@/services/bookings.api';
import { getCurrentUser } from '@/utils/auth';

const statusColors: Record<BookingStatus, string> = {
  pending: 'blue',
  approved: 'green',
  rejected: 'red',
  cancelled: 'gray',
};

const MemberDashboardPage = () => {
  const [dashboardOpenedAt] = useState(() => Date.now());
  const user = getCurrentUser();
  const { requests, loading: bookingsLoading } = useBookingRequests();
  const { spaces, pagination, loading: spacesLoading } = useSpaces();

  const pendingCount = requests.filter(
    (request) => request.status === 'pending',
  ).length;
  const approvedCount = requests.filter(
    (request) => request.status === 'approved',
  ).length;
  const upcomingCount = requests.filter((request) => {
    if (!['pending', 'approved'].includes(request.status)) return false;
    return (
      new Date(`${request.date}T${request.startTime}:00`).getTime() >
      dashboardOpenedAt
    );
  }).length;

  const recentBookings = requests
    .slice()
    .sort(
      (left, right) =>
        new Date(right.createdAt).getTime() -
        new Date(left.createdAt).getTime(),
    )
    .slice(0, 5);

  const stats = [
    {
      label: 'Available spaces',
      value: spacesLoading ? '—' : String(pagination?.total ?? spaces.length),
      description: 'Ready to book',
      icon: <FiGrid />,
      color: 'teal',
    },
    {
      label: 'Upcoming bookings',
      value: bookingsLoading ? '—' : String(upcomingCount),
      description: 'Pending or approved',
      icon: <FiCalendar />,
      color: 'violet',
    },
    {
      label: 'Pending requests',
      value: bookingsLoading ? '—' : String(pendingCount),
      description: pendingCount ? 'Awaiting review' : 'Nothing pending',
      icon: <FiClock />,
      color: 'blue',
    },
    {
      label: 'Approved bookings',
      value: bookingsLoading ? '—' : String(approvedCount),
      description: 'Confirmed by admin',
      icon: <FiCheckCircle />,
      color: 'green',
    },
  ];

  return (
    <Stack gap={32}>
      <Stack gap="sm">
        <AdminBreadcrumbs />
        <Title order={1} fz={{ base: 36, sm: 46 }}>
          Welcome back, {user?.name?.split(' ')[0] || 'Member'}
        </Title>
        <Text c="dimmed" fz="lg">
          View your booking activity and quickly find your next workspace.
        </Text>
      </Stack>

      <SimpleGrid cols={{ base: 1, sm: 2, xl: 4 }} spacing="lg">
        {stats.map((stat) => (
          <Card key={stat.label} withBorder radius="xl" p="xl" shadow="xs">
            <Group justify="space-between" align="flex-start">
              <ThemeIcon
                color={stat.color}
                variant="light"
                size={52}
                radius="lg"
              >
                {stat.icon}
              </ThemeIcon>
              <Text fz={38} fw={800} lh={1}>
                {stat.value}
              </Text>
            </Group>
            <Text fw={700} mt="xl">
              {stat.label}
            </Text>
            <Text c="dimmed" size="sm">
              {stat.description}
            </Text>
          </Card>
        ))}
      </SimpleGrid>

      <Grid gap="xl">
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <Paper
            withBorder
            radius="xl"
            shadow="xs"
            h="100%"
            style={{ overflow: 'hidden' }}
          >
          <Group justify="space-between" p="xl">
            <Box>
              <Title order={2} fz="xl">
                Recent bookings
              </Title>
              <Text c="dimmed" size="sm">
                Your five most recent booking requests.
              </Text>
            </Box>
            <Button
              component={Link}
              to="/admin/my-bookings"
              variant="light"
              color="teal"
              rightSection={<FiArrowRight />}
            >
              View all
            </Button>
          </Group>

          <Table.ScrollContainer minWidth={650}>
            <Table verticalSpacing="md" horizontalSpacing="xl">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Workspace</Table.Th>
                  <Table.Th>Date and time</Table.Th>
                  <Table.Th>Status</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {recentBookings.length === 0 ? (
                  <Table.Tr>
                    <Table.Td colSpan={3}>
                      <Stack align="center" gap="xs" py={42}>
                        <FiCalendar size={26} />
                        <Text fw={700}>No bookings yet</Text>
                        <Text c="dimmed" size="sm">
                          Book an available workspace to get started.
                        </Text>
                      </Stack>
                    </Table.Td>
                  </Table.Tr>
                ) : (
                  recentBookings.map((booking) => (
                    <Table.Tr key={booking.id}>
                      <Table.Td fw={700}>{booking.spaceName}</Table.Td>
                      <Table.Td>
                        <Text size="sm">
                          {dayjs(booking.date).format('DD MMM YYYY')}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {booking.slot}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Badge
                          color={statusColors[booking.status]}
                          variant="light"
                        >
                          {booking.status}
                        </Badge>
                      </Table.Td>
                    </Table.Tr>
                  ))
                )}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
          </Paper>
        </Grid.Col>

        <Grid.Col span={{ base: 12, lg: 4 }}>
          <Paper withBorder radius="xl" p="xl" shadow="xs" h="100%">
          <Title order={2} fz="xl">
            Quick actions
          </Title>
          <Text c="dimmed" size="sm" mb="xl">
            Find a space or manage your bookings.
          </Text>
          <Stack>
            <Button
              component={Link}
              to="/admin/bookings"
              color="teal"
              size="md"
              justify="flex-start"
              leftSection={<FiGrid />}
            >
              Browse spaces
            </Button>
            <Button
              component={Link}
              to="/admin/bookings/new"
              color="blue"
              variant="light"
              size="md"
              justify="flex-start"
              leftSection={<FiCalendar />}
            >
              Book a workspace
            </Button>
            <Button
              component={Link}
              to="/admin/my-bookings"
              variant="default"
              size="md"
              justify="flex-start"
              leftSection={<FiClock />}
            >
              My bookings
            </Button>
          </Stack>
          </Paper>
        </Grid.Col>
      </Grid>
    </Stack>
  );
};

export default MemberDashboardPage;
