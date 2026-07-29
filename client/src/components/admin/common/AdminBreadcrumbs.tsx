import { Anchor, Breadcrumbs, Text } from '@mantine/core';
import { FiChevronRight, FiGrid } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import styles from './AdminBreadcrumbs.module.css';

type AdminBreadcrumbsProps = {
  current?: string;
  parent?: {
    label: string;
    to: string;
  };
};

const AdminBreadcrumbs = ({ current, parent }: AdminBreadcrumbsProps) => (
  <Breadcrumbs
    separator={<FiChevronRight size={14} />}
    separatorMargin="xs"
  >
    <Anchor
      component={Link}
      to={parent?.to ?? '/admin'}
      c={current ? 'dimmed' : 'var(--mantine-color-text)'}
      fw={current ? 400 : 700}
      size="sm"
      underline="never"
      className={styles.overviewLink}
    >
      {!parent && <FiGrid aria-hidden="true" />}
      <span>{parent?.label ?? 'Overview'}</span>
    </Anchor>
    {current && (
      <Text size="sm" fw={700} c="var(--mantine-color-text)">
        {current}
      </Text>
    )}
  </Breadcrumbs>
);

export default AdminBreadcrumbs;
