import { useState } from "react";
import {
  Button,
  FileInput,
  Grid,
  Group,
  Image,
  NumberInput,
  Paper,
  Select,
  Stack,
  TagsInput,
  Text,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { FiImage, FiSave } from "react-icons/fi";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import AdminBreadcrumbs from "@/components/admin/common/AdminBreadcrumbs";
import { useSpaces } from "@/hooks/useSpaces";

type SpaceFormValues = {
  title: string;
  description: string;
  capacity: number | string;
  status: "available" | "unavailable";
  facilities: string[];
  tagName: string;
  profilePicture: File | null;
};

const fileToDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

const SpaceFormPage = () => {
  const { spaceId } = useParams();
  const navigate = useNavigate();
  const { spaces, createSpace, updateSpace } = useSpaces();
  const editingSpace = spaceId
    ? spaces.find((space) => space.id === spaceId)
    : undefined;
  const isEditing = Boolean(spaceId);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<SpaceFormValues>({
    initialValues: {
      title: editingSpace?.name ?? "",
      description: editingSpace?.description ?? "",
      capacity: editingSpace?.capacity ?? 1,
      status: editingSpace?.status ?? "available",
      facilities: editingSpace?.amenities ?? [],
      tagName: editingSpace?.type ?? "",
      profilePicture: null,
    },
    validate: {
      title: (value) => (value.trim() ? null : "Enter a title"),
      description: (value) =>
        value.trim().length >= 10
          ? null
          : "Description must contain at least 10 characters",
      capacity: (value) =>
        Number(value) >= 1 ? null : "Capacity must be at least 1",
      facilities: (value) =>
        value.length > 0 ? null : "Add at least one facility",
      tagName: (value) => (value.trim() ? null : "Enter a tag name"),
    },
  });

  if (isEditing && !editingSpace) {
    return <Navigate to="/admin/bookings" replace />;
  }

  const submitSpace = async (values: SpaceFormValues) => {
    if (!isEditing && !values.profilePicture) {
      setSubmitError("Please select a profile picture.");
      return;
    }

    const image = values.profilePicture
      ? await fileToDataUrl(values.profilePicture)
      : (editingSpace?.image ?? "");
    const spaceValues = {
      name: values.title.trim(),
      description: values.description.trim(),
      capacity: Number(values.capacity),
      status: values.status,
      amenities: values.facilities,
      type: values.tagName.trim(),
      image,
    };

    if (editingSpace) {
      updateSpace(editingSpace.id, spaceValues);
    } else {
      createSpace(spaceValues);
    }

    navigate("/admin/bookings");
  };

  return (
    <Stack gap={32}>
      <Stack gap="sm">
        <AdminBreadcrumbs
          parent={{ label: "Available spaces", to: "/admin/bookings" }}
          current={isEditing ? "Edit space" : "Add space"}
        />
        <Title order={1} fz={{ base: 36, sm: 46 }}>
          {isEditing ? "Edit space" : "Add a new space"}
        </Title>
        <Text c="dimmed" fz="lg">
          {isEditing
            ? "Update workspace information and availability."
            : "Create a workspace that members can view and book."}
        </Text>
      </Stack>

      <Paper
        component="form"
        onSubmit={form.onSubmit(submitSpace)}
        withBorder
        radius="xl"
        p={{ base: "md", sm: "xl" }}
        shadow="xs"
      >
        <Grid gap="xl">
          <Grid.Col span={{ base: 12, lg: 8 }}>
            <Stack>
              <FileInput
                label="Profile picture"
                description="Upload a JPG, PNG or WebP workspace image"
                placeholder="Choose an image"
                accept="image/png,image/jpeg,image/webp"
                leftSection={<FiImage />}
                clearable
                required={!isEditing}
                {...form.getInputProps("profilePicture")}
              />
              <TextInput
                label="Title"
                placeholder="Example: Window Focus Desk"
                required
                {...form.getInputProps("title")}
              />
              <Textarea
                label="Description"
                placeholder="Describe the workspace"
                minRows={4}
                autosize
                required
                {...form.getInputProps("description")}
              />
              <Grid>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <NumberInput
                    label="Capacity"
                    min={1}
                    required
                    {...form.getInputProps("capacity")}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <Select
                    label="Status"
                    data={[
                      { value: "available", label: "Available" },
                      { value: "unavailable", label: "Unavailable" },
                    ]}
                    checkIconPosition="right"
                    required
                    {...form.getInputProps("status")}
                  />
                </Grid.Col>
              </Grid>
              <TagsInput
                label="Facilities"
                placeholder="Enter a facility and press Enter"
                required
                {...form.getInputProps("facilities")}
              />
              <TextInput
                label="Tag name"
                placeholder="Example: Meeting Room"
                required
                {...form.getInputProps("tagName")}
              />

              {submitError && (
                <Text c="red" size="sm">
                  {submitError}
                </Text>
              )}
            </Stack>
          </Grid.Col>

          <Grid.Col span={{ base: 12, lg: 4 }}>
            <Paper withBorder radius="lg" p="md">
              <Text fw={700} mb="sm">
                Image preview
              </Text>
              {form.values.profilePicture || editingSpace?.image ? (
                <Image
                  src={
                    form.values.profilePicture
                      ? URL.createObjectURL(form.values.profilePicture)
                      : editingSpace?.image
                  }
                  h={240}
                  radius="md"
                  fit="cover"
                />
              ) : (
                <Stack align="center" justify="center" h={240} c="dimmed">
                  <FiImage size={34} />
                  <Text size="sm">No image selected</Text>
                </Stack>
              )}
            </Paper>
          </Grid.Col>
        </Grid>

        <Group justify="flex-end" mt="xl">
          <Button variant="default" onClick={() => navigate("/admin/bookings")}>
            Cancel
          </Button>
          <Button type="submit" color="teal" leftSection={<FiSave />}>
            {isEditing ? "Save changes" : "Add space"}
          </Button>
        </Group>
      </Paper>
    </Stack>
  );
};

export default SpaceFormPage;
