import {
  Avatar,
  AvatarGroup,
  Badge,
  Box,
  Button,
  Container,
  Grid,
  Group,
  Image,
  NumberInput,
  Paper,
  Select,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
  Title,
} from '@mantine/core';
import { FiArrowRight, FiCheck, FiSearch } from 'react-icons/fi';
import { homeText, spaceTypes } from './data.temp';

type HeroSectionProps = {
  query: string;
  spaceType: string | null;
  capacity: number | string;
  onQueryChange: (value: string) => void;
  onSpaceTypeChange: (value: string | null) => void;
  onCapacityChange: (value: number | string) => void;
  onShowSpaces: () => void;
};

const HeroSection = ({
  query,
  spaceType,
  capacity,
  onQueryChange,
  onSpaceTypeChange,
  onCapacityChange,
  onShowSpaces,
}: HeroSectionProps) => (
  <Box
    component="section"
    bg="light-dark(var(--mantine-color-teal-0), var(--mantine-color-dark-8))"
    py={{ base: 54, sm: 84 }}
    style={{
      backgroundImage:
        'radial-gradient(circle at 12% 18%, rgba(32, 201, 151, .18), transparent 25%), radial-gradient(circle at 92% 30%, rgba(255, 236, 153, .12), transparent 22%)',
    }}
  >
    <Container size="xl">
      <Grid align="center" gap={{ base: 42, md: 70 }}>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Stack gap="xl">
            <Badge color="teal" variant="light" size="lg">{homeText.hero.badge}</Badge>
            <Title order={1} fz={{ base: 44, sm: 64 }} lh={1.02} maw={650}>
              {homeText.hero.title}{' '}
              <Text component="span" inherit c="teal.7">
                {homeText.hero.highlightedTitle}
              </Text>
            </Title>
            <Text fz={{ base: 'lg', sm: 21 }} c="dimmed" maw={600}>
              {homeText.hero.description}
            </Text>
            <Group>
              <Button
                color="teal"
                size="lg"
                radius="md"
                onClick={onShowSpaces}
                rightSection={<FiArrowRight />}
              >
                Explore spaces
              </Button>
              <Group gap="sm">
                <AvatarGroup>
                  <Avatar color="teal">AM</Avatar>
                  <Avatar color="orange">JD</Avatar>
                  <Avatar color="blue">SK</Avatar>
                </AvatarGroup>
                <Text size="sm">
                  <Text component="span" fw={700}>4.9/5</Text>
                  <br />
                  2,000+ members
                </Text>
              </Group>
            </Group>
          </Stack>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 6 }}>
          <Box pos="relative">
            <Image
              src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=90"
              alt="Bright modern coworking office"
              h={{ base: 360, sm: 520 }}
              radius="xl"
              fit="cover"
            />
            <Paper shadow="xl" radius="lg" p="md" pos="absolute" bottom={24} left={-18}>
              <Group wrap="nowrap">
                <ThemeIcon color="teal" radius="xl"><FiCheck /></ThemeIcon>
                <Box>
                  <Text fw={700}>12 spaces available</Text>
                  <Text size="xs" c="dimmed">Ready to book today</Text>
                </Box>
              </Group>
            </Paper>
          </Box>
        </Grid.Col>
      </Grid>

      <Paper shadow="lg" radius="xl" p={{ base: 'md', sm: 'xl' }} mt={{ base: 48, sm: 72 }}>
        <Grid align="flex-end">
          <Grid.Col span={{ base: 12, sm: 6, lg: 4 }}>
            <TextInput
              label="What space do you need?"
              placeholder="Search by space name or type"
              value={query}
              onChange={(event) => onQueryChange(event.currentTarget.value)}
              size="md"
              leftSection={<FiSearch />}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
            <Select
              label="Space type"
              data={spaceTypes}
              value={spaceType}
              onChange={onSpaceTypeChange}
              size="md"
              checkIconPosition='right'
              allowDeselect={false}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
            <NumberInput
              label="Minimum capacity"
              value={capacity}
              onChange={onCapacityChange}
              min={1}
              max={12}
              size="md"
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, lg: 2 }}>
            <Button color="teal" size="md" fullWidth onClick={onShowSpaces}>
              Find a space
            </Button>
          </Grid.Col>
        </Grid>
      </Paper>
    </Container>
  </Box>
);

export default HeroSection;
