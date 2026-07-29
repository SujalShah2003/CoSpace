import type { ReactNode } from 'react';
import { Modal } from '@mantine/core';

type AppModalProps = {
  opened: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  size?: string | number;
};

const AppModal = ({
  opened,
  onClose,
  title,
  children,
  size = 'xl',
}: AppModalProps) => (
  <Modal
    opened={opened}
    onClose={onClose}
    title={title}
    size={size}
    centered
    radius="md"
    padding="xl"
    overlayProps={{ backgroundOpacity: 0.55, blur: 5 }}
    styles={{
      content: { overflow: 'hidden' },
      header: {
        minHeight: 86,
        paddingInline: 30,
        background:
          'light-dark(var(--mantine-color-gray-1), var(--mantine-color-dark-7))',
        borderBottom: '1px solid var(--mantine-color-default-border)',
      },
      title: {
        fontWeight: 800,
        fontSize: 'var(--mantine-font-size-xl)',
      },
      close: { color: 'var(--mantine-color-dimmed)' },
      body: { padding: 30 },
    }}
  >
    {children}
  </Modal>
);

export default AppModal;
