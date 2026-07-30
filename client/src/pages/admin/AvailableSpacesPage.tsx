import { useState } from "react";
import { useDebouncedValue } from "@mantine/hooks";
import {
  ActionIcon,
  Alert,
  Badge,
  Box,
  Button,
  Card,
  Group,
  Image,
  NumberInput,
  Paper,
  Stack,
  SimpleGrid,
  Text,
  TextInput,
  Title,
  Tooltip,
} from "@mantine/core";
import {
  FiAlertTriangle,
  FiCalendar,
  FiCheck,
  FiEdit2,
  FiEye,
  FiPlus,
  FiSearch,
  FiTrash2,
  FiUsers,
} from "react-icons/fi";
import { Link } from "react-router-dom";
import AdminBreadcrumbs from "@/components/admin/common/AdminBreadcrumbs";
import SpaceDetailsModal from "@/components/home/SpaceDetailsModal";
import AppModal from "@/components/modal/AppModal";
import type { Space } from "@/components/home/data.temp";
import { useSpaces } from "@/hooks/useSpaces";
import { getCurrentUser } from "@/utils/auth";

const AvailableSpacesPage = () => {
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 350);
  const [minimumCapacity, setMinimumCapacity] =
    useState<number | string>(1);
  const {
    spaces,
    deleteSpace,
    hasMore,
    loadMore,
    loadingMore,
  } = useSpaces(false, 6, {
    search: debouncedSearch,
    minCapacity: Number(minimumCapacity) || 1,
  });
  const isAdmin = getCurrentUser()?.role === "admin";
  const [selectedSpace, setSelectedSpace] = useState<Space | null>(null);
  const [spaceToDelete, setSpaceToDelete] = useState<Space | null>(null);
  const [confirmationText, setConfirmationText] = useState("");
  const requiredConfirmation = spaceToDelete
    ? `delete ${spaceToDelete.name}`
    : "";

  const closeDeleteModal = () => {
    setSpaceToDelete(null);
    setConfirmationText("");
  };

  const confirmDelete = async () => {
    if (!spaceToDelete || confirmationText.trim() !== requiredConfirmation) {
      return;
    }

    await deleteSpace(spaceToDelete.id);
    closeDeleteModal();
  };

  return (
    <Stack gap={32}>
      <Group justify="space-between" align="center">
        <Stack gap="sm">
          <AdminBreadcrumbs current="Available spaces" />
          <Title order={1} fz={{ base: 36, sm: 46 }}>
            Available spaces
          </Title>
          <Text c="dimmed" fz="lg">
            Choose a workspace to view its details or select a two-hour booking
            slot.
          </Text>
        </Stack>
        {isAdmin && (
          <Button
            size="md"
            component={Link}
            to="/admin/spaces/new"
            color="teal"
            leftSection={<FiPlus />}
          >
            Add space
          </Button>
        )}
      </Group>

      <Paper withBorder radius="xl" p="lg" shadow="xs">
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
          <TextInput
            label="Search spaces"
            description="Search by workspace name, type, description or amenity"
            placeholder="Enter a search term"
            value={search}
            onChange={(event) => setSearch(event.currentTarget.value)}
            leftSection={<FiSearch />}
          />
          <NumberInput
            label="Minimum capacity"
            description="Show spaces that can accommodate at least this many people"
            value={minimumCapacity}
            onChange={setMinimumCapacity}
            min={1}
            allowDecimal={false}
            allowNegative={false}
          />
        </SimpleGrid>
      </Paper>

      <SimpleGrid cols={{ base: 1, md: 2, xl: 3 }} spacing="xl">
        {spaces.map((space) => (
          <Card
            key={space.id}
            withBorder
            radius="xl"
            padding={0}
            shadow="xs"
            style={{ display: "flex", flexDirection: "column" }}
          >
            <Card.Section pos="relative">
              <Image src={space.image} alt={space.name} h={220} fit="cover" />
              <Badge pos="absolute" top={16} left={16} color="dark">
                {space.type}
              </Badge>
              <Badge
                pos="absolute"
                top={16}
                right={16}
                color={space.status === "unavailable" ? "gray" : "green"}
              >
                {space.status === "unavailable" ? "Unavailable" : "Available"}
              </Badge>
            </Card.Section>

            <Stack p="lg" gap="md" style={{ flex: 1 }}>
              <Group justify="space-between" align="flex-start" wrap="nowrap">
                <Title order={2} fz="xl">
                  {space.name}
                </Title>
                <Badge color="gray" variant="light" leftSection={<FiUsers />}>
                  {space.capacity}
                </Badge>
              </Group>
              <Text c="dimmed" size="sm" lineClamp={2}>
                {space.description}
              </Text>
              <Group gap="xs">
                {space.amenities.map((amenity) => (
                  <Badge
                    key={amenity}
                    color="gray"
                    variant="light"
                    leftSection={<FiCheck />}
                  >
                    {amenity}
                  </Badge>
                ))}
              </Group>

              <Group gap="sm" mt="auto" wrap="nowrap">
                {space.status === "unavailable" ? (
                  <Button
                    color="teal"
                    leftSection={<FiCalendar />}
                    disabled
                    style={{ flex: 1 }}
                  >
                    Book now
                  </Button>
                ) : (
                  <Button
                    component={Link}
                    to={`/admin/bookings/new?space=${space.id}`}
                    color="teal"
                    leftSection={<FiCalendar />}
                    style={{ flex: 1 }}
                  >
                    Book now
                  </Button>
                )}
                <Tooltip label="View space" withArrow>
                  <ActionIcon
                    variant="default"
                    size={36}
                    aria-label={`View ${space.name}`}
                    onClick={() => setSelectedSpace(space)}
                  >
                    <FiEye />
                  </ActionIcon>
                </Tooltip>
                {isAdmin && <Tooltip label="Edit space" withArrow>
                  <ActionIcon
                    component={Link}
                    to={`/admin/spaces/${space.id}/edit`}
                    variant="default"
                    size={36}
                    aria-label={`Edit ${space.name}`}
                  >
                    <FiEdit2 />
                  </ActionIcon>
                </Tooltip>}
                {isAdmin && <Tooltip label="Delete space" withArrow>
                  <ActionIcon
                    variant="light"
                    color="red"
                    size={36}
                    aria-label={`Delete ${space.name}`}
                    onClick={() => setSpaceToDelete(space)}
                  >
                    <FiTrash2 />
                  </ActionIcon>
                </Tooltip>}
              </Group>
            </Stack>
          </Card>
        ))}
      </SimpleGrid>

      {hasMore && (
        <Group justify="center">
          <Button
            color="teal"
            variant="light"
            size="md"
            loading={loadingMore}
            onClick={() => void loadMore()}
          >
            Load more spaces
          </Button>
        </Group>
      )}

      <SpaceDetailsModal
        space={selectedSpace}
        opened={selectedSpace !== null}
        onClose={() => setSelectedSpace(null)}
      />

      <AppModal
        opened={spaceToDelete !== null}
        onClose={closeDeleteModal}
        title="Delete workspace"
        size={660}
      >
        <Stack gap="lg">
          <Alert
            color="red"
            variant="light"
            icon={<FiAlertTriangle />}
            radius="md"
            p="lg"
          >
            This permanently removes the workspace from the available spaces and
            booking form.
          </Alert>

          <Box>
            <Text mb="xs">Type this exact text to continue.</Text>
            <Paper
              withBorder
              radius="md"
              p="md"
              bg="light-dark(var(--mantine-color-red-0), var(--mantine-color-dark-7))"
            >
              <Text
                c="light-dark(var(--mantine-color-red-8), var(--mantine-color-red-3))"
                fw={700}
              >
                {requiredConfirmation}
              </Text>
            </Paper>
          </Box>

          <TextInput
            label="Confirmation text"
            placeholder={requiredConfirmation}
            value={confirmationText}
            onChange={(event) => setConfirmationText(event.currentTarget.value)}
          />

          <Group justify="flex-end">
            <Button variant="default" onClick={closeDeleteModal}>
              Cancel
            </Button>
            <Button
              color="red"
              disabled={confirmationText.trim() !== requiredConfirmation}
              onClick={confirmDelete}
            >
              Delete workspace
            </Button>
          </Group>
        </Stack>
      </AppModal>
    </Stack>
  );
};

export default AvailableSpacesPage;
