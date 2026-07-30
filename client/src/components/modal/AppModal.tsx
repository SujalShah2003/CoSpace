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
    centered={false}
    yOffset="5dvh"
    radius="md"
    padding="xl"
    overlayProps={{ backgroundOpacity: 0.55, blur: 5 }}
    styles={{
      content: { overflow: 'hidden' },
      header: {
        minHeight: 86,
        paddingInline: 30,
        background: 'var(--mantine-color-teal-8)',
        borderBottom: '1px solid var(--mantine-color-teal-8)',
      },
      title: {
        fontWeight: 800,
        fontSize: 'var(--mantine-font-size-xl)',
        color: 'var(--mantine-color-white)',
      },
      close: {
        color: 'var(--mantine-color-white)',
        backgroundColor: 'transparent',
      },
      body: { padding: 30 },
    }}
  >
    {children}
  </Modal>
);

export default AppModal;
