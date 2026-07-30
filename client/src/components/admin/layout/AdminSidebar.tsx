import {
  ActionIcon,
  Avatar,
  Box,
  Button,
  Divider,
  Group,
  Paper,
  Stack,
  Text,
  Tooltip,
} from '@mantine/core';
import {
  FiCalendar,
  FiClipboard,
  FiGrid,
  FiInbox,
  FiLayers,
  FiLogOut,
} from 'react-icons/fi';
import { Link, useLocation } from 'react-router-dom';
import Logo from '@/common/Logo';
import type { AuthUser } from '@/utils/auth';
import styles from './AdminSidebar.module.css';

const navigationLinks = [
  { label: 'Overview', icon: <FiGrid />, to: '/admin' },
  { label: 'Available spaces', icon: <FiCalendar />, to: '/admin/bookings' },
  {
    label: 'My bookings',
    icon: <FiClipboard />,
    to: '/admin/my-bookings',
    memberOnly: true,
  },
  {
    label: 'Manage bookings',
    icon: <FiInbox />,
    to: '/admin/booking-requests',
    adminOnly: true,
  },
];

type AdminSidebarProps = {
  user: AuthUser | null;
  opened: boolean;
  onNavigate: () => void;
  onLogout: () => void;
};

const AdminSidebar = ({
  user,
  opened,
  onNavigate,
  onLogout,
}: AdminSidebarProps) => {
  const location = useLocation();
  const userInitial = user?.name.charAt(0).toUpperCase() || 'A';
  const links =
    user?.role === 'admin'
      ? navigationLinks.filter((link) => !link.memberOnly)
      : navigationLinks.filter((link) => !link.adminOnly);

  return (
    <Stack h="100%" justify="space-between" p={opened ? 'md' : 'xs'}>
      <Stack gap="lg">
        {opened ? (
          <Box px="sm" py="xs">
            <Logo inverted />
          </Box>
        ) : (
          <Tooltip label="CoSpace" position="right">
            <Avatar color="teal" radius="md" size={52} mx="auto">
              <FiLayers />
            </Avatar>
          </Tooltip>
        )}

        <Stack gap="xs">
          {opened && (
            <Text size="xs" c="gray.6" fw={700} px="sm">
              MAIN
            </Text>
          )}
          {links.map((link) => {
            const isActive =
              link.to === '/admin'
                ? location.pathname === link.to
                : link.to === '/admin/bookings'
                  ? location.pathname === link.to ||
                    location.pathname.startsWith('/admin/spaces/')
                : link.to === '/admin/my-bookings'
                  ? location.pathname.startsWith('/admin/my-bookings') ||
                    location.pathname === '/admin/bookings/new'
                  : location.pathname.startsWith(link.to);

            return opened ? (
              <Button
                key={link.label}
                component={Link}
                to={link.to}
                variant={isActive ? 'filled' : 'transparent'}
                color="teal"
                size='md'
                c={isActive ? 'white' : 'gray.4'}
                className={isActive ? styles.activeNav : styles.navButton}
                justify="flex-start"
                leftSection={link.icon}
                onClick={onNavigate}
              >
                {link.label}
              </Button>
            ) : (
              <Tooltip key={link.label} label={link.label} position="right">
                <ActionIcon
                  component={Link}
                  to={link.to}
                  variant={isActive ? 'filled' : 'transparent'}
                  color="teal"
                  c={isActive ? 'white' : 'gray.4'}
                  className={isActive ? styles.activeNav : styles.navButton}
                  size={52}
                  radius="md"
                  mx="auto"
                  aria-label={link.label}
                >
                  {link.icon}
                </ActionIcon>
              </Tooltip>
            );
          })}
        </Stack>
      </Stack>

      <Stack gap="sm">
        <Divider color="dark.5" />
        {opened ? (
          <>
            <Paper
              radius="lg"
              p="sm"
              bg="dark.7"
              bd="1px solid var(--mantine-color-dark-5)"
            >
              <Group wrap="nowrap">
                <Avatar color="teal" radius="xl">{userInitial}</Avatar>
                <Box style={{ minWidth: 0 }}>
                  <Text fw={700} size="sm" c="white" truncate>{user?.name}</Text>
                  <Text c="gray.5" size="xs" truncate>{user?.email}</Text>
                  <Text c="teal.3" size="xs" fw={600}>
                    {user?.role === 'admin' ? 'Administrator' : 'Member'}
                  </Text>
                </Box>
              </Group>
            </Paper>
            <Button
              variant="subtle"
              color="red"
              justify="flex-start"
              leftSection={<FiLogOut />}
              onClick={onLogout}
            >
              Sign out
            </Button>
          </>
        ) : (
          <>
            <Tooltip label={`${user?.name} · Administrator`} position="right">
              <Avatar color="teal" radius="xl" mx="auto">{userInitial}</Avatar>
            </Tooltip>
            <Tooltip label="Sign out" position="right">
              <ActionIcon
                variant="subtle"
                color="red"
                size={48}
                mx="auto"
                onClick={onLogout}
                aria-label="Sign out"
              >
                <FiLogOut />
              </ActionIcon>
            </Tooltip>
          </>
        )}
      </Stack>
    </Stack>
  );
};

export default AdminSidebar;
