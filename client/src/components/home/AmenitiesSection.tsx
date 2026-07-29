import {
  Box,
  Container,
  Paper,
  SimpleGrid,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';
import { FiClock, FiCoffee, FiShield, FiWifi } from 'react-icons/fi';
import { benefits, homeText } from './data.temp';
import SectionHeading from './SectionHeading';

const benefitIcons = {
  wifi: <FiWifi />,
  clock: <FiClock />,
  coffee: <FiCoffee />,
  shield: <FiShield />,
};

const AmenitiesSection = () => (
  <Box
    component="section"
    id="amenities"
    bg="light-dark(var(--mantine-color-white), var(--mantine-color-dark-8))"
    px={{ base: 'md' }}
    py={{ base: 64, sm: 96 }}
  >
    <Container size="xl">
      <SectionHeading
        centered
        label={homeText.amenities.badge}
        title={homeText.amenities.title}
        description={homeText.amenities.description}
      />
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="xl" mt={48}>
        {benefits.map((benefit) => (
          <Paper key={benefit.title} withBorder radius="lg" p="xl">
            <ThemeIcon size={52} radius="lg" color="teal" variant="light" fz="xl">
              {benefitIcons[benefit.icon as keyof typeof benefitIcons]}
            </ThemeIcon>
            <Title order={3} fz="lg" mt="lg">{benefit.title}</Title>
            <Text c="dimmed" mt="xs">{benefit.text}</Text>
          </Paper>
        ))}
      </SimpleGrid>
    </Container>
  </Box>
);

export default AmenitiesSection;
