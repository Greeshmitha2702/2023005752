'use client';

import { useMemo, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Alert, Box, Button, Chip, Container, Paper, Stack, TextField, Typography } from '@mui/material';
import { Log, getLoggingConfig, registerForTest } from '../logging_middleware/client';
import type { LogLevel, LogPackage, LogStack, RegistrationPayload } from '../logging_middleware/types';

type LogFormState = {
  stack: LogStack;
  level: LogLevel;
  packageName: LogPackage;
  message: string;
};

type LogResultState = {
  logID: string;
  message: string;
};

type RegistrationFormState = RegistrationPayload & {
  clientID: string;
  clientSecret: string;
};

const seededConfig = getLoggingConfig();

const initialRegistration: RegistrationFormState = {
  email: seededConfig.email,
  name: seededConfig.name,
  mobileNo: seededConfig.mobileNo,
  githubUsername: seededConfig.githubUsername,
  rollNo: seededConfig.rollNo,
  accessCode: seededConfig.accessCode,
  clientID: seededConfig.clientID,
  clientSecret: seededConfig.clientSecret
};

const initialLogForm: LogFormState = {
  stack: 'frontend',
  level: 'info',
  packageName: 'component',
  message: 'Login form rendered successfully.'
};

export default function Home() {
  const [registration, setRegistration] = useState<RegistrationFormState>(initialRegistration);
  const [logForm, setLogForm] = useState<LogFormState>(initialLogForm);
  const [logResult, setLogResult] = useState<LogResultState | null>(null);
  const [status, setStatus] = useState(initialRegistration.clientID ? 'Credentials loaded. You can send a log request now.' : 'Ready to register or send a log request.');
  const [severity, setSeverity] = useState<'success' | 'info' | 'warning' | 'error'>('info');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canRegister = useMemo(
    () => Boolean(registration.email && registration.name && registration.rollNo && registration.accessCode),
    [registration.accessCode, registration.email, registration.name, registration.rollNo]
  );

  const canLog = useMemo(() => Boolean(logForm.message.trim()), [logForm.message]);

  const updateRegistrationField = (field: keyof RegistrationFormState) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setRegistration((current) => ({
      ...current,
      [field]: event.target.value
    }));
  };

  const updateLogField = (field: keyof LogFormState) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setLogForm((current) => ({
      ...current,
      [field]: event.target.value
    }));
  };

  const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canRegister) {
      setSeverity('error');
      setStatus('Fill the registration fields first.');
      return;
    }

    setIsSubmitting(true);
      setLogResult(null);
      setStatus('Registration succeeded. Copy the returned client credentials into the form or env file.');
    setStatus('Registering with the test server...');

    try {
      const result = await registerForTest({
        email: registration.email,
        name: registration.name,
        mobileNo: registration.mobileNo,
        githubUsername: registration.githubUsername,
        rollNo: registration.rollNo,
        accessCode: registration.accessCode
      });

      setRegistration((current) => ({
        ...current,
        clientID: String(result.clientID || ''),
        clientSecret: String(result.clientSecret || '')
      }));
      setSeverity('success');
      setStatus('Registration succeeded. Copy the returned client credentials into the form or env file.');
    } catch (error) {
      setSeverity('error');
      setStatus(error instanceof Error ? error.message : 'Registration failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLog = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canLog) {
      setSeverity('error');
      setStatus('Message is required before sending a log.');
      return;
    }

    setIsSubmitting(true);
    setSeverity('info');
    setStatus('Submitting log request...');

    try {
      const result = await Log(logForm.stack, logForm.level, logForm.packageName, logForm.message, {
        email: registration.email,
        name: registration.name,
        mobileNo: registration.mobileNo,
        githubUsername: registration.githubUsername,
        rollNo: registration.rollNo,
        accessCode: registration.accessCode,
        clientID: registration.clientID,
        clientSecret: registration.clientSecret
      });

      setSeverity('success');
      setLogResult({
        logID: String(result.logID || ''),
        message: String(result.message || 'log created successfully')
      });
      setStatus(result.message || 'Log sent successfully.');
    } catch (error) {
      setSeverity('error');
      setLogResult(null);
      setStatus(error instanceof Error ? error.message : 'Unable to send log.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: { xs: 4, md: 8 } }}>
      <Box sx={{ display: 'grid', gap: 3, mb: 4 }}>
        <Chip
          label="Reusable logging middleware"
          sx={{
            alignSelf: 'start',
            bgcolor: 'rgba(33, 94, 158, 0.12)',
            color: 'primary.main',
            fontWeight: 700,
            letterSpacing: 0.6
          }}
        />
        <Box>
          <Typography variant="h2" component="h1" sx={{ fontWeight: 800, lineHeight: 1.05, mb: 2 }}>
            Campus Hiring Evaluation - Pre-Test Setup
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 760, fontSize: '1.05rem' }}>
            This TypeScript frontend contains a reusable client for test registration, authentication, and protected
            log submission. Register once, keep the returned client credentials, then reuse the same helper for logs.
          </Typography>
        </Box>
      </Box>

      <Stack spacing={3}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 4 },
            border: '1px solid rgba(26, 32, 44, 0.12)',
            boxShadow: '0 24px 60px rgba(18, 58, 99, 0.14)',
            backdropFilter: 'blur(12px)',
            backgroundColor: 'rgba(255, 255, 255, 0.84)'
          }}
        >
          <Stack spacing={3} component="form" onSubmit={handleRegister}>
            <Typography variant="h5" component="h2" sx={{ fontWeight: 700 }}>
              1. Register with the test server
            </Typography>
            <Stack spacing={2}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField fullWidth label="Email" value={registration.email} onChange={updateRegistrationField('email')} />
                <TextField fullWidth label="Name" value={registration.name} onChange={updateRegistrationField('name')} />
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField fullWidth label="Mobile No" value={registration.mobileNo} onChange={updateRegistrationField('mobileNo')} />
                <TextField fullWidth label="GitHub Username" value={registration.githubUsername} onChange={updateRegistrationField('githubUsername')} />
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField fullWidth label="Roll No" value={registration.rollNo} onChange={updateRegistrationField('rollNo')} />
                <TextField fullWidth label="Access Code" value={registration.accessCode} onChange={updateRegistrationField('accessCode')} />
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField fullWidth label="Client ID" value={registration.clientID} onChange={updateRegistrationField('clientID')} />
                <TextField fullWidth label="Client Secret" value={registration.clientSecret} onChange={updateRegistrationField('clientSecret')} />
              </Stack>
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
              <Button type="submit" variant="contained" size="large" disabled={!canRegister || isSubmitting}>
                Register
              </Button>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                If you already registered in Postman, paste the returned client credentials here and skip this step.
              </Typography>
            </Stack>
          </Stack>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 4 },
            border: '1px solid rgba(26, 32, 44, 0.12)',
            boxShadow: '0 24px 60px rgba(18, 58, 99, 0.14)',
            backdropFilter: 'blur(12px)',
            backgroundColor: 'rgba(255, 255, 255, 0.84)'
          }}
        >
          <Stack spacing={3} component="form" onSubmit={handleLog}>
            <Typography variant="h5" component="h2" sx={{ fontWeight: 700 }}>
              2. Send a reusable log request
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                select
                fullWidth
                label="Stack"
                value={logForm.stack}
                onChange={updateLogField('stack')}
                SelectProps={{ native: true }}
              >
                <option value="frontend">frontend</option>
                <option value="backend">backend</option>
              </TextField>
              <TextField
                select
                fullWidth
                label="Level"
                value={logForm.level}
                onChange={updateLogField('level')}
                SelectProps={{ native: true }}
              >
                <option value="debug">debug</option>
                <option value="info">info</option>
                <option value="warn">warn</option>
                <option value="error">error</option>
                <option value="fatal">fatal</option>
              </TextField>
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                select
                fullWidth
                label="Package"
                value={logForm.packageName}
                onChange={updateLogField('packageName')}
                SelectProps={{ native: true }}
              >
                <optgroup label="Frontend">
                  <option value="api">api</option>
                  <option value="component">component</option>
                  <option value="hook">hook</option>
                  <option value="page">page</option>
                  <option value="state">state</option>
                  <option value="style">style</option>
                  <option value="auth">auth</option>
                  <option value="config">config</option>
                  <option value="middleware">middleware</option>
                  <option value="utils">utils</option>
                </optgroup>
                <optgroup label="Backend">
                  <option value="cache">cache</option>
                  <option value="controller">controller</option>
                  <option value="cron_job">cron_job</option>
                  <option value="db">db</option>
                  <option value="domain">domain</option>
                  <option value="handler">handler</option>
                  <option value="repository">repository</option>
                  <option value="route">route</option>
                  <option value="service">service</option>
                  <option value="middleware">middleware</option>
                  <option value="utils">utils</option>
                </optgroup>
              </TextField>
              <TextField
                fullWidth
                label="Message"
                value={logForm.message}
                onChange={updateLogField('message')}
                placeholder="Describe the event you want to log"
              />
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
              <Button type="submit" variant="contained" size="large" disabled={!canLog || isSubmitting}>
                Send Log
              </Button>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                The helper authenticates using the registered credentials, then submits the log.
              </Typography>
            </Stack>
          </Stack>
        </Paper>

        <Alert severity={severity} variant="outlined">
          {status}
        </Alert>

        {logResult && (
          <Paper
            elevation={0}
            sx={{
              p: 3,
              border: '1px solid rgba(26, 32, 44, 0.12)',
              backgroundColor: 'rgba(255, 255, 255, 0.84)'
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              Last Log Response
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              <strong>logID:</strong> {logResult.logID || 'N/A'}
            </Typography>
            <Typography variant="body2">
              <strong>message:</strong> {logResult.message}
            </Typography>
          </Paper>
        )}
      </Stack>
    </Container>
  );
}