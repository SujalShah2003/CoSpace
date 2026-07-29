import { Avatar, Group, Text } from '@mantine/core';
import { Link } from 'react-router-dom';
import { FiLayers } from 'react-icons/fi';

type LogoProps = {
  inverted?: boolean;
};

const Logo = ({ inverted = false }: LogoProps) => (
  <Group
    renderRoot={(props) => <Link to="/" {...props} />}
    gap="xs"
    wrap="nowrap"
    td="none"
    aria-label="CoSpace home"
  >
    <Avatar color="teal" radius="md" size={42}><FiLayers /></Avatar>
    <Text fw={800} fz="xl" c={inverted ? 'white' : 'var(--mantine-color-text)'} lh={1}>
      Co
      <Text component="span" inherit c={inverted ? 'teal.0' : 'teal.7'}>
        Space
      </Text>
    </Text>
  </Group>
);

export default Logo;
