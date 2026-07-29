import { ActionIcon, useMantineColorScheme } from '@mantine/core';
import { FiMoon, FiSun } from 'react-icons/fi';

const ToggleTheme = () => {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  return (
    <ActionIcon
      variant="default"
      size="lg"
      radius="md"
      onClick={toggleColorScheme}
      aria-label="Toggle color theme"
    >
      {colorScheme === 'dark' ? <FiSun /> : <FiMoon />}
    </ActionIcon>
  );
};

export default ToggleTheme;
