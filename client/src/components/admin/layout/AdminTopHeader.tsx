import {
  Avatar,
  Group,
  Menu,
  Text,
  UnstyledButton,
} from '@mantine/core';
import {
  FiChevronDown,
  FiLogOut,
  FiSettings,
  FiUser,
} from 'react-icons/fi';
import ToggleTheme from '@/components/toggle-theme/ToggleTheme';
import type { AuthUser } from '@/utils/auth';

type AdminTopHeaderProps = {
  user: AuthUser | null;
  onLogout: () => void;
};

const AdminTopHeader = ({ user, onLogout }: AdminTopHeaderProps) => {
  const userInitial = user?.name.charAt(0).toUpperCase() || 'A';

  return (
    <Group justify="space-between" w="100%" wrap="nowrap">
      <Text fw={800} fz={{ base: 'lg', sm: 'xl' }} lineClamp={1}>
        {user?.role === 'admin' ? 'CoSpace Administration' : 'CoSpace Member Portal'}
      </Text>

      <Group gap="md" wrap="nowrap">
        <ToggleTheme />
        <Menu position="bottom-end" width={250} shadow="md">
          <Menu.Target>
            <UnstyledButton aria-label="Open profile menu">
              <Group gap="xs" wrap="nowrap">
                <Avatar color="teal" radius="xl">{userInitial}</Avatar>
                <FiChevronDown />
              </Group>
            </UnstyledButton>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Label>
              <Text fw={700} c="var(--mantine-color-text)">{user?.name}</Text>
              <Text size="xs" c="dimmed" fw={400}>{user?.email}</Text>
            </Menu.Label>
            <Menu.Divider />
            <Menu.Item leftSection={<FiUser />}>My profile</Menu.Item>
            <Menu.Item leftSection={<FiSettings />}>Account settings</Menu.Item>
            <Menu.Divider />
            <Menu.Item color="red" leftSection={<FiLogOut />} onClick={onLogout}>
              Sign out
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>
    </Group>
  );
};

export default AdminTopHeader;
