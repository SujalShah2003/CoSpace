import { Badge, Stack, Text, Title } from '@mantine/core';

type SectionHeadingProps = {
  label: string;
  title: string;
  description: string;
  centered?: boolean;
};

const SectionHeading = ({
  label,
  title,
  description,
  centered = false,
}: SectionHeadingProps) => (
  <Stack
    gap="sm"
    align={centered ? 'center' : 'flex-start'}
    ta={centered ? 'center' : 'left'}
  >
    <Badge color="teal" variant="light" size="lg">{label}</Badge>
    <Title order={2} fz={{ base: 34, sm: 46 }} lh={1.1} maw={680}>
      {title}
    </Title>
    <Text c="dimmed" fz="lg" maw={620}>{description}</Text>
  </Stack>
);

export default SectionHeading;
