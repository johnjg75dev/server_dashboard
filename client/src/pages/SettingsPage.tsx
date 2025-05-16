import React, { useState, useEffect, useCallback } from 'react';
import {
    Box, Button, Typography, Paper, Grid, CircularProgress, Alert,
    TextField, Switch, FormControlLabel, Tooltip
} from '@mui/material';
import PageHeader from '../components/PageHeader';
import SettingsIcon from '@mui/icons-material/SettingsApplications';
import SaveIcon from '@mui/icons-material/Save';
import apiClient from '../services/apiClient'; // Your API client

interface ConfigSetting {
    id: number;
    config_key: string;
    config_value: string | null; // Can be null from DB
    description?: string | null;
    is_json: boolean;
    updated_at?: string;
}

const SettingsPage: React.FC = () => {
    const [settings, setSettings] = useState<ConfigSetting[]>([]);
    const [initialSettings, setInitialSettings] = useState<ConfigSetting[]>([]); // To track changes
    const [loading, setLoading] = useState<boolean>(true);
    const [saving, setSaving] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const fetchSettings = useCallback(async () => {
        setLoading(true);
        setError(null);
        setSuccessMessage(null);
        try {
            const response = await apiClient.get('/settings');
            if (response.data.success) {
                const fetchedSettings = response.data.settings.map((s: ConfigSetting) => ({
                    ...s,
                    config_value: s.config_value === null ? '' : s.config_value // Ensure empty string for null
                }));
                setSettings(fetchedSettings);
                setInitialSettings(JSON.parse(JSON.stringify(fetchedSettings))); // Deep copy for comparison
            } else {
                setError(response.data.message || 'Failed to fetch settings.');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'An error occurred while fetching settings.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    const handleInputChange = (key: string, value: string) => {
        setSettings(prevSettings =>
            prevSettings.map(s =>
                s.config_key === key ? { ...s, config_value: value } : s
            )
        );
        setSuccessMessage(null); // Clear success message on change
    };

    const handleJsonToggle = (key: string, checked: boolean) => {
         setSettings(prevSettings =>
            prevSettings.map(s =>
                s.config_key === key ? { ...s, is_json: checked } : s
            )
        );
        setSuccessMessage(null);
    };

    const handleDescriptionChange = (key: string, value: string) => {
        setSettings(prevSettings =>
            prevSettings.map(s =>
                s.config_key === key ? { ...s, description: value } : s
            )
        );
        setSuccessMessage(null);
    };

    const handleSaveChanges = async () => {
        setSaving(true);
        setError(null);
        setSuccessMessage(null);

        // Filter out only changed settings to send to backend
        const changedSettings = settings.filter(currentSetting => {
            const initial = initialSettings.find(init => init.config_key === currentSetting.config_key);
            return !initial ||
                   currentSetting.config_value !== initial.config_value ||
                   currentSetting.is_json !== initial.is_json ||
                   currentSetting.description !== initial.description;
        });

        if (changedSettings.length === 0) {
            setSuccessMessage("No changes to save.");
            setSaving(false);
            return;
        }

        try {
            // Prepare payload for the backend (map to expected format if different)
            const payload = {
                settings: changedSettings.map(s => ({
                    config_key: s.config_key, // Backend expects config_key
                    config_value: s.config_value,
                    is_json: s.is_json,
                    description: s.description
                }))
            };

            const response = await apiClient.put('/settings', payload);
            if (response.data.success) {
                setSuccessMessage(response.data.message || 'Settings saved successfully!');
                // Optionally re-fetch or update initialSettings to new saved state
                fetchSettings(); // Re-fetch to get updated_at and confirm persistence
            } else {
                setError(response.data.message || 'Failed to save settings.');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'An error occurred while saving settings.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <Box display="flex" justifyContent="center" alignItems="center" height="50vh"><CircularProgress size={60} /></Box>;

    return (
        <>
            <PageHeader title="Application Settings" icon={<SettingsIcon />} subtitle="Manage system configuration variables." />
            {error && <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>{error}</Alert>}
            {successMessage && <Alert severity="success" onClose={() => setSuccessMessage(null)} sx={{ mb: 2 }}>{successMessage}</Alert>}

            <Paper sx={{ p: 3 }}>
                <Grid container spacing={3}>
                    {settings.map((setting) => (
                        <React.Fragment key={setting.config_key}>
                            <Grid size={{xs:12, sm:4}}>
                                <Tooltip title={`Key: ${setting.config_key}\nLast Updated: ${setting.updated_at ? new Date(setting.updated_at).toLocaleString() : 'N/A'}`}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 'medium', mt: 2 }}>
                                        {setting.config_key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                    </Typography>
                                </Tooltip>
                                 <TextField
                                    fullWidth
                                    variant="standard"
                                    size="small"
                                    label="Description"
                                    value={setting.description || ''}
                                    onChange={(e) => handleDescriptionChange(setting.config_key, e.target.value)}
                                    sx={{mt: 0.5, fontSize: '0.8rem'}}
                                />
                            </Grid>
                            <Grid size={{xs:12, sm:6}}>
                                <TextField
                                    fullWidth
                                    variant="outlined"
                                    label="Value"
                                    value={setting.config_value || ''}
                                    onChange={(e) => handleInputChange(setting.config_key, e.target.value)}
                                    multiline={(setting.config_value && setting.config_value.length > 60) || setting.is_json}
                                    rows={(setting.config_value && setting.config_value.length > 60) || setting.is_json ? 3 : 1}
                                />
                            </Grid>
                            <Grid size={{xs:12, sm:6}} container alignItems="center">
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={setting.is_json}
                                            onChange={(e) => handleJsonToggle(setting.config_key, e.target.checked)}
                                            size="small"
                                        />
                                    }
                                    label="Is JSON"
                                />
                            </Grid>
                        </React.Fragment>
                    ))}
                    <Grid size={{xs:12}} sx={{ mt: 2, textAlign: 'right' }}>
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                            onClick={handleSaveChanges}
                            disabled={loading || saving}
                        >
                            Save Changes
                        </Button>
                    </Grid>
                </Grid>
            </Paper>
        </>
    );
};

export default SettingsPage;