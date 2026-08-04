import {
  Card,
  Group,
  Paper,
  SimpleGrid,
  Skeleton,
  Stack,
} from "@mantine/core";
import { FiClock } from "react-icons/fi";

type SpaceCardsSkeletonProps = {
  count?: number;
};

export const SpaceCardsSkeleton = ({ count = 6 }: SpaceCardsSkeletonProps) => (
  <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="xl">
    {Array.from({ length: count }, (_, index) => (
      <Card
        key={index}
        withBorder
        radius="lg"
        padding={0}
        shadow="sm"
        style={{ display: "flex", flexDirection: "column" }}
      >
        <Skeleton height={230} />
        <Stack p="lg" gap="md" style={{ flex: 1 }}>
          <Group justify="space-between" align="flex-start" wrap="nowrap">
            <Skeleton width="55%" height={24} />
            <Skeleton width={80} height={24} />
          </Group>
          <Skeleton width="70%" height={20} />
          <Skeleton width="40%" height={20} />
          <Skeleton height={20} width="100%" />
          <Group gap="sm">
            <Skeleton radius="lg" height={42} style={{ flex: 1 }} />
            <Skeleton radius="lg" height={42} style={{ flex: 1 }} />
          </Group>
        </Stack>
      </Card>
    ))}
  </SimpleGrid>
);

export const WorkspaceAvailabilitySkeleton = () => (
  <Paper
    radius="lg"
    p="md"
    bg="light-dark(var(--mantine-color-teal-0), var(--mantine-color-dark-7))"
  >
    <Group justify="space-between" mb="md">
      <Group gap="xs" align="center">
        <FiClock />
        <Skeleton width={140} height={20} />
      </Group>
      <Skeleton width={100} height={24} />
    </Group>

    <Stack gap="sm">
      {Array.from({ length: 5 }, (_, index) => (
        <Skeleton key={index} height={30} radius="lg" />
      ))}
    </Stack>
  </Paper>
);
