import { useState } from 'react';
import {
  Alert,
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
import { login } from '@/services/auth.api';
import { getApiError } from '@/services/apiClient';
import { createSession } from '@/utils/auth';

const SignInPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const form = useForm<SignInValues>({
    initialValues: signInInitialValues,
    validate: signInValidation,
  });

  const handleSubmit = form.onSubmit(async (values) => {
    try {
      const session = await login(values);
      createSession(session);
      const returnTo = (location.state as { returnTo?: string } | null)?.returnTo;
      navigate(
        returnTo || (session.user.role === 'admin' ? '/admin' : '/admin/bookings'),
        { replace: true },
      );
    } catch (error) {
      setSubmitError(getApiError(error, 'Unable to sign in.'));
    }
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
          {submitError && <Alert color="red">{submitError}</Alert>}
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
          <Button
            type="submit"
            color="teal"
            size="md"
            rightSection={<FiArrowRight />}
            loading={form.submitting}
          >
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
