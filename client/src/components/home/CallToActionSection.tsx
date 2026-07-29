import { Badge, Box, Button, Container, Group, Title } from '@mantine/core';
import { FiArrowRight } from 'react-icons/fi';
import { homeText } from './data.temp';

type CallToActionSectionProps = {
  onShowSpaces: () => void;
};

const CallToActionSection = ({ onShowSpaces }: CallToActionSectionProps) => (
  <Box component="section" bg="teal.8" c="white" py={{ base: 60, sm: 80 }}>
    <Container size="xl">
      <Group justify="space-between" gap="xl">
        <Box>
          <Badge
            bg="white"
            c="teal.9"
            variant="filled"
            mb="md"
          >
            {homeText.cta.badge}
          </Badge>
          <Title order={2} fz={{ base: 34, sm: 48 }} maw={720}>
            {homeText.cta.title}
          </Title>
        </Box>
        <Button
          color="white"
          c="teal.9"
          size="lg"
          radius="md"
          onClick={onShowSpaces}
          rightSection={<FiArrowRight />}
        >
          Find your space
        </Button>
      </Group>
    </Container>
  </Box>
);

export default CallToActionSection;
