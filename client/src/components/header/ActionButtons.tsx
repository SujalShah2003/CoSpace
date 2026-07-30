import { Button, Group } from '@mantine/core';
import { Link } from 'react-router-dom';
import styles from './WebHeader.module.css';

const ActionButtons = () => (
  <Group gap="xs" wrap="nowrap">
    <Button
      component={Link}
      to="/signin"
      variant="default"
      className={`${styles.authButton} ${styles.signInButton}`}
    >
      Sign in
    </Button>
    <Button
      component={Link}
      to="/signup"
      color="teal"
      radius="md"
      className={`${styles.authButton} ${styles.signUpButton}`}
    >
      Sign up
    </Button>
  </Group>
);

export default ActionButtons;
