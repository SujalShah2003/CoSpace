import {
  Anchor,
  Button,
  Checkbox,
  Divider,
  Group,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { FiArrowRight, FiLock, FiMail } from 'react-icons/fi';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  signInInitialValues,
  signInValidation,
  type SignInValues,
} from '@/schemas/signin.schema';
import { createSession } from '@/utils/auth';

const SignInPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const form = useForm<SignInValues>({
    initialValues: signInInitialValues,
    validate: signInValidation,
  });

  const handleSubmit = form.onSubmit((values) => {
    createSession({
      name: values.email.split('@')[0] || 'Admin',
      email: values.email,
      role: 'admin',
    });

    const returnTo = (location.state as { returnTo?: string } | null)?.returnTo;
    navigate(returnTo || '/admin', { replace: true });
  });

  return (
    <Stack gap="xl">
      <Stack gap="xs">
        <Text c="teal.7" fw={700}>WELCOME BACK</Text>
        <Title order={1} fz={38}>Sign in to CoSpace</Title>
        <Text c="dimmed">Access your bookings and workspace administration.</Text>
      </Stack>

      <form onSubmit={handleSubmit}>
        <Stack gap="lg">
          <TextInput
            label="Email address"
            placeholder="admin@cospace.com"
            size="md"
            leftSection={<FiMail />}
            {...form.getInputProps('email')}
          />
          <PasswordInput
            label="Password"
            placeholder="Enter your password"
            size="md"
            leftSection={<FiLock />}
            {...form.getInputProps('password')}
          />
          <Group justify="space-between">
            <Checkbox
              label="Remember me"
              {...form.getInputProps('remember', { type: 'checkbox' })}
            />
            <Anchor component="button" type="button" size="sm" c="teal.7">
              Forgot password?
            </Anchor>
          </Group>
          <Button type="submit" color="teal" size="md" rightSection={<FiArrowRight />}>
            Sign in
          </Button>
        </Stack>
      </form>

      <Divider label="New to CoSpace?" labelPosition="center" />
      <Button component={Link} to="/signup" variant="default" size="md">
        Create an account
      </Button>
    </Stack>
  );
};

export default SignInPage;
