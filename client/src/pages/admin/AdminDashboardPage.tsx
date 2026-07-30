import {
  Badge,
  Box,
  Button,
  Card,
  Grid,
  Group,
  Paper,
  Progress,
  SimpleGrid,
  Stack,
  Table,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';
import {
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiGrid,
} from 'react-icons/fi';
import { useBookingRequests } from '@/hooks/useBookingRequests';
import AdminBreadcrumbs from '@/components/admin/common/AdminBreadcrumbs';
import { Link, Navigate } from 'react-router-dom';
import { getCurrentUser } from '@/utils/auth';

const statusColors = {
  pending: 'blue',
  approved: 'red',
  rejected: 'gray',
  cancelled: 'gray',
};

const AdminDashboardPage = () => {
  const user = getCurrentUser();
  const { requests } = useBookingRequests();
  if (user?.role !== 'admin') {
    return <Navigate to="/admin/bookings" replace />;
  }
  const pendingCount = requests.filter((request) => request.status === 'pending').length;
  const approvedCount = requests.filter((request) => request.status === 'approved').length;
  const stats = [
    {
      label: 'Total spaces',
      value: '6',
      status: 'All listed',
      icon: <FiGrid />,
      color: 'teal',
    },
    {
      label: 'Booking requests',
      value: String(requests.length),
      status: 'Local demo data',
      icon: <FiCalendar />,
      color: 'blue',
    },
    {
      label: 'Pending requests',
      value: String(pendingCount),
      status: pendingCount > 0 ? 'Needs review' : 'All reviewed',
      icon: <FiClock />,
      color: 'orange',
    },
    {
      label: 'Approved',
      value: String(approvedCount),
      status: 'Booked slots',
      icon: <FiCheckCircle />,
      color: 'green',
    },
  ];

  return (
    <Stack gap={32}>
      <Stack gap="sm">
        <AdminBreadcrumbs />
        <Title order={1} fz={{ base: 36, sm: 46 }}>Dashboard</Title>
        <Text c="dimmed" fz="lg">
          Monitor workspace activity and approve or reject booking requests.
        </Text>
      </Stack>

      <SimpleGrid cols={{ base: 1, sm: 2, xl: 4 }} spacing="lg">
        {stats.map((stat) => (
          <Card key={stat.label} withBorder radius="xl" p="xl" mih={205} shadow="xs">
            <Group justify="space-between" align="flex-start">
              <ThemeIcon color={stat.color} variant="light" size={54} radius="lg" fz="xl">
                {stat.icon}
              </ThemeIcon>
              <Badge color={stat.color} variant="outline" size="lg" radius="xl">
                {stat.status}
              </Badge>
            </Group>
            <Box mt="xl">
              <Text c="dimmed" size="sm" fw={700} tt="uppercase">{stat.label}</Text>
              <Text fz={42} fw={800} lh={1.15} mt={4}>{stat.value}</Text>
            </Box>
          </Card>
        ))}
      </SimpleGrid>

      <Grid gap="xl" align="stretch">
        <Grid.Col span={{ base: 12, xl: 8 }}>
          <Paper withBorder radius="xl" h="100%" shadow="xs">
            <Group justify="space-between" p="xl">
              <Box>
                <Title order={2} fz="xl">Booking requests</Title>
                <Text c="dimmed" size="sm">
                  New requests appear blue until you approve or reject them.
                </Text>
              </Box>
              <Badge color="blue" variant="light">{pendingCount} pending</Badge>
            </Group>

            <Table.ScrollContainer minWidth={820}>
              <Table verticalSpacing="md" horizontalSpacing="xl">
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Requested by</Table.Th>
                    <Table.Th>Workspace</Table.Th>
                    <Table.Th>Date and time</Table.Th>
                    <Table.Th>Status</Table.Th>
                    <Table.Th>Actions</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {requests.length === 0 ? (
                    <Table.Tr>
                      <Table.Td colSpan={5}>
                        <Text ta="center" c="dimmed" py="xl">
                          No booking requests yet. Create one from the Bookings page.
                        </Text>
                      </Table.Td>
                    </Table.Tr>
                  ) : (
                    requests
                      .slice()
                      .reverse()
                      .map((request) => (
                        <Table.Tr key={request.id}>
                          <Table.Td fw={600}>{request.requestedBy}</Table.Td>
                          <Table.Td>{request.spaceName}</Table.Td>
                          <Table.Td>
                            <Text size="sm">{request.date}</Text>
                            <Text size="xs" c="dimmed">{request.slot}</Text>
                          </Table.Td>
                          <Table.Td>
                            <Badge color={statusColors[request.status]} variant="light">
                              {request.status}
                            </Badge>
                          </Table.Td>
                          <Table.Td>
                            {request.status === 'pending' ? (
                              <Button
                                component={Link}
                                to="/admin/booking-requests"
                                size="xs"
                                color="teal"
                                variant="light"
                              >
                                Review request
                              </Button>
                            ) : (
                              <Text size="xs" c="dimmed">Reviewed</Text>
                            )}
                          </Table.Td>
                        </Table.Tr>
                      ))
                  )}
                </Table.Tbody>
              </Table>
            </Table.ScrollContainer>
          </Paper>
        </Grid.Col>

        <Grid.Col span={{ base: 12, xl: 4 }}>
          <Paper withBorder radius="xl" p="xl" h="100%" shadow="xs">
            <Title order={2} fz="xl">Space utilization</Title>
            <Text c="dimmed" size="sm" mb={32}>Current occupied capacity</Text>
            <Stack gap="xl">
              <Box>
                <Group justify="space-between">
                  <Text size="sm">Meeting rooms</Text>
                  <Text size="sm" fw={700}>78%</Text>
                </Group>
                <Progress value={78} color="teal" mt="xs" />
              </Box>
              <Box>
                <Group justify="space-between">
                  <Text size="sm">Hot desks</Text>
                  <Text size="sm" fw={700}>64%</Text>
                </Group>
                <Progress value={64} color="blue" mt="xs" />
              </Box>
              <Box>
                <Group justify="space-between">
                  <Text size="sm">Private offices</Text>
                  <Text size="sm" fw={700}>52%</Text>
                </Group>
                <Progress value={52} color="orange" mt="xs" />
              </Box>
            </Stack>
          </Paper>
        </Grid.Col>
      </Grid>
    </Stack>
  );
};

export default AdminDashboardPage;
