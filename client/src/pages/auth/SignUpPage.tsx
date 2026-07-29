import {
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
import { createSession } from '@/utils/auth';

const SignUpPage = () => {
  const navigate = useNavigate();
  const form = useForm<SignUpValues>({
    initialValues: signUpInitialValues,
    validate: signUpValidation,
  });

  const handleSubmit = form.onSubmit((values) => {
    createSession({ name: values.name, email: values.email, role: 'admin' });
    navigate('/admin', { replace: true });
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
          <Button type="submit" color="teal" size="md" rightSection={<FiArrowRight />}>
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
