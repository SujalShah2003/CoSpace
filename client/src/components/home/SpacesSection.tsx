import {
  Badge,
  Box,
  Button,
  Card,
  Center,
  Container,
  Group,
  Image,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';
import { FiCalendar, FiCheck, FiEye, FiSearch, FiUsers } from 'react-icons/fi';
import type { Space } from './data.temp';
import { homeText } from './data.temp';
import SectionHeading from './SectionHeading';

type SpacesSectionProps = {
  spaces: Space[];
  onClearFilters: () => void;
  onViewDetails: (space: Space) => void;
  onBook: (space: Space) => void;
};

const SpacesSection = ({
  spaces,
  onClearFilters,
  onViewDetails,
  onBook,
}: SpacesSectionProps) => (
  <Box component="section" id="spaces" py={{ base: 64, sm: 96 }}>
    <Container size="xl">
      <Group justify="space-between" align="flex-end" mb={42}>
        <SectionHeading
          label={homeText.spaces.badge}
          title={homeText.spaces.title}
          description={homeText.spaces.description}
        />
        <Badge size="lg" variant="outline" color="gray">{spaces.length} spaces</Badge>
      </Group>

      {spaces.length > 0 ? (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="xl">
          {spaces.map((space) => (
            <Card
              key={space.name}
              withBorder
              radius="lg"
              padding={0}
              shadow="sm"
              style={{ display: 'flex', flexDirection: 'column' }}
            >
              <Card.Section pos="relative">
                <Image src={space.image} alt={space.name} h={230} fit="cover" />
                <Badge pos="absolute" top={16} left={16} color="dark" variant="filled">
                  {space.type}
                </Badge>
                <Badge pos="absolute" top={16} right={16} color="teal" variant="filled">
                  Available
                </Badge>
              </Card.Section>
              <Stack p="lg" gap="md" style={{ flex: 1 }}>
                <Group justify="space-between" align="flex-start" wrap="nowrap">
                  <Box>
                    <Title order={3} fz="xl">{space.name}</Title>
                  </Box>
                  <Badge variant="light" color="gray" leftSection={<FiUsers />}>
                    {space.capacity}
                  </Badge>
                </Group>
                <Group gap="xs">
                  {space.amenities.map((amenity) => (
                    <Badge key={amenity} color="gray" variant="light" fw={500}>
                      <Group gap={4} wrap="nowrap"><FiCheck />{amenity}</Group>
                    </Badge>
                  ))}
                </Group>
                <Text c="dimmed" size="sm" lineClamp={2}>
                  {space.description}
                </Text>
                <SimpleGrid cols={2} spacing="sm" mt="auto">
                  <Button
                    fullWidth
                    variant="default"
                    leftSection={<FiEye />}
                    onClick={() => onViewDetails(space)}
                  >
                    View details
                  </Button>
                  <Button
                    fullWidth
                    color="teal"
                    leftSection={<FiCalendar />}
                    onClick={() => onBook(space)}
                  >
                    Book now
                  </Button>
                </SimpleGrid>
              </Stack>
            </Card>
          ))}
        </SimpleGrid>
      ) : (
        <Paper withBorder radius="lg" p={50}>
          <Center>
            <Stack align="center">
              <ThemeIcon size={54} radius="xl" color="gray"><FiSearch /></ThemeIcon>
              <Title order={3}>No matching spaces</Title>
              <Text c="dimmed">Try another location, type or capacity.</Text>
              <Button color="teal" onClick={onClearFilters}>Clear filters</Button>
            </Stack>
          </Center>
        </Paper>
      )}
    </Container>
  </Box>
);

export default SpacesSection;
