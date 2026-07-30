import { useState } from 'react';
import {
  Alert,
  Anchor,
  Button,
  Group,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { FiArrowRight, FiLock, FiMail, FiUser } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import {
  signUpInitialValues,
  signUpValidation,
  type SignUpValues,
} from '@/schemas/signup.schema';
import { registerMember } from '@/services/auth.api';
import { getApiError } from '@/services/apiClient';
import { createSession } from '@/utils/auth';

const SignUpPage = () => {
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const form = useForm<SignUpValues>({
    initialValues: signUpInitialValues,
    validate: signUpValidation,
  });

  const handleSubmit = form.onSubmit(async (values) => {
    try {
      const session = await registerMember({
        name: values.name,
        email: values.email,
        password: values.password,
      });
      createSession(session);
      navigate('/admin/bookings', { replace: true });
    } catch (error) {
      setSubmitError(getApiError(error, 'Unable to create your account.'));
    }
  });

  return (
    <Stack gap="xl">
      <Stack gap="xs">
        <Text c="teal.7" fw={700}>CREATE YOUR ACCOUNT</Text>
        <Title order={1} fz={38}>Join CoSpace</Title>
        <Text c="dimmed">Start finding and managing better places to work.</Text>
      </Stack>

      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          {submitError && <Alert color="red">{submitError}</Alert>}
          <TextInput
            label="Full name"
            placeholder="Your name"
            size="md"
            leftSection={<FiUser />}
            {...form.getInputProps('name')}
          />
          <TextInput
            label="Email address"
            placeholder="you@example.com"
            size="md"
            leftSection={<FiMail />}
            {...form.getInputProps('email')}
          />
          <Group grow align="flex-start">
            <PasswordInput
              label="Password"
              placeholder="Minimum 6 characters"
              size="md"
              leftSection={<FiLock />}
              {...form.getInputProps('password')}
            />
            <PasswordInput
              label="Confirm password"
              placeholder="Repeat password"
              size="md"
              leftSection={<FiLock />}
              {...form.getInputProps('confirmPassword')}
            />
          </Group>
          <Button
            type="submit"
            color="teal"
            size="md"
            rightSection={<FiArrowRight />}
            loading={form.submitting}
          >
            Create account
          </Button>
        </Stack>
      </form>

      <Text ta="center" c="dimmed">
        Already have an account?{' '}
        <Anchor component={Link} to="/signin" c="teal.7" fw={600}>
          Sign in
        </Anchor>
      </Text>
    </Stack>
  );
};

export default SignUpPage;
