try {
  process.loadEnvFile();
} catch (error) {
  const errorCode =
    error instanceof Error && 'code' in error
      ? String(error.code)
      : '';

  if (errorCode !== 'ENOENT') {
    throw error;
  }
}
