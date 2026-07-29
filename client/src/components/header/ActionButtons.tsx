import { Button, Group } from '@mantine/core';
import { Link } from 'react-router-dom';

const ActionButtons = () => (
  <Group gap="xs" wrap="nowrap">
    <Button component={Link} to="/signin" variant="subtle" color="dark">
      Sign in
    </Button>
    <Button component={Link} to="/signup" color="teal" radius="md">
      Sign up
    </Button>
  </Group>
);

export default ActionButtons;
