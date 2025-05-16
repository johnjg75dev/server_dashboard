// client/src/pages/SettingsPage.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Box, Button, Typography, Paper, Grid, CircularProgress, Alert,
    TextField, Switch, FormControlLabel, Tooltip, Tabs, Tab, Divider
} from '@mui/material';
import PageHeader from '../components/PageHeader';
import SettingsIcon from '@mui/icons-material/SettingsApplications';
import SaveIcon from '@mui/icons-material/Save';
import apiClient from '../services/apiClient';

interface ConfigSetting {
    id: number;
    config_key: string;
    config_value: string | null;
    description?: string | null;
    is_json: boolean;
    updated_at?: string;
    // Optional: Add a category field if you fetch it from DB
    // category?: string;
}

// Helper to categorize settings (can be more sophisticated)
const getSettingCategory = (key: string): string => {
    if (key.startsWith('APACHE_')) return 'Apache';
    if (key.startsWith('MYSQL_')) return 'MySQL';
    if (key.startsWith('PHP_')) return 'PHP';
    if (key.startsWith('LIBVIRT_')) return 'Libvirt';
    if (key.startsWith('LOG_')) return 'Logging';
    return 'General'; // Default category
};

const SettingsPage: React.FC = () => {
    const [allSettings, setAllSettings] = useState<ConfigSetting[]>([]);
    const [initialSettings, setInitialSettings] = useState<ConfigSetting[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [saving, setSaving] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [currentTab, setCurrentTab] = useState<number>(0);

    const fetchSettings = useCallback(async () => {
        setLoading(true);
        setError(null);
        setSuccessMessage(null);
        try {
            const response = await apiClient.get('/settings');
            if (response.data.success) {
                const fetchedSettings = response.data.settings.map((s: ConfigSetting) => ({
                    ...s,
                    config_value: s.config_value === null ? '' : s.config_value
                })).sort((a: ConfigSetting,b: ConfigSetting) => a.config_key.localeCompare(b.config_key)); // Sort for consistent order
                setAllSettings(fetchedSettings);
                setInitialSettings(JSON.parse(JSON.stringify(fetchedSettings)));
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

    // Memoize categories and settings per category
    const { categories, settingsByCategory } = useMemo(() => {
        const cats = new Set<string>();
        const byCategory: Record<string, ConfigSetting[]> = {};

        allSettings.forEach(setting => {
            const category = getSettingCategory(setting.config_key);
            cats.add(category);
            if (!byCategory[category]) {
                byCategory[category] = [];
            }
            byCategory[category].push(setting);
        });
        // Ensure a consistent order for categories, e.g., General first
        const sortedCategories = Array.from(cats).sort((a: string,b: string) => {
            if (a === 'General') return -1;
            if (b === 'General') return 1;
            return a.localeCompare(b);
        });
        return { categories: sortedCategories, settingsByCategory: byCategory };
    }, [allSettings]);


    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setCurrentTab(newValue);
    };

    const handleInputChange = (key: string, value: string) => {
        setAllSettings(prevSettings =>
            prevSettings.map(s =>
                s.config_key === key ? { ...s, config_value: value } : s
            )
        );
        setSuccessMessage(null);
    };

    const handleJsonToggle = (key: string, checked: boolean) => {
         setAllSettings(prevSettings =>
            prevSettings.map(s =>
                s.config_key === key ? { ...s, is_json: checked } : s
            )
        );
        setSuccessMessage(null);
    };

    const handleDescriptionChange = (key: string, value: string) => {
        setAllSettings(prevSettings =>
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
        const changedSettings = allSettings.filter(currentSetting => {
            const initial = initialSettings.find(init => init.config_key === currentSetting.config_key);
            return !initial ||
                   currentSetting.config_value !== initial.config_value
        });

        if (changedSettings.length === 0) {
            setSuccessMessage("No changes to save.");
            setSaving(false);
            return;
        }
        try {
            const payload = {
                settings: changedSettings.map(s => ({
                    config_key: s.config_key,
                    config_value: s.config_value,
                }))
            };
            const response = await apiClient.put('/settings', payload);
            if (response.data.success) {
                setSuccessMessage(response.data.message || 'Settings saved successfully!');
                fetchSettings();
            } else {
                setError(response.data.message || 'Failed to save settings.');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'An error occurred while saving settings.');
        } finally {
            setSaving(false);
        }
    };

    const renderSettingItem = (setting: ConfigSetting) => (
        <Paper key={setting.config_key} variant="outlined" sx={{ p: 2, mb: 2, borderColor: 'rgba(0, 255, 255, 0.2)' }}>
            <Grid container spacing={2} alignItems="center">
                <Grid size={{xs:12, md:3}}>
                    <Tooltip title={`Key: ${setting.config_key}\nLast Updated: ${setting.updated_at ? new Date(setting.updated_at).toLocaleString() : 'N/A'}`}>
                        <Typography variant="body1" sx={{ fontWeight: 'medium', color: 'primary.main' }}>
                            {setting.config_key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </Typography>
                    </Tooltip>
                </Grid>
                <Grid size={{xs:12, md:7}}>
                    <Typography variant="body1" sx={{ fontWeight: 'small', color: 'primary.main', mb:2 }}>
                        {setting.description}
                    </Typography>
                    

                    <TextField
                        fullWidth
                        label="Value"
                        variant="outlined"
                        size="small"
                        value={setting.config_value || ''}
                        onChange={(e) => handleInputChange(setting.config_key, e.target.value)}
                        multiline={(setting.config_value && setting.config_value.length > 50) || setting.is_json}
                        rows={(setting.config_value && setting.config_value.length > 50) || setting.is_json ? 2 : 1}
                        sx={{ mb: 1 }}
                    />
                </Grid>
                <Grid size={{xs:12, md:2}} container justifyContent="flex-end">
                    <FormControlLabel
                        control={
                            <Switch
                                checked={setting.is_json}
                                onChange={(e) => handleJsonToggle(setting.config_key, e.target.checked)}
                                size="small"
                            />
                        }
                        label="Is JSON"
                        sx={{mr: 0}} // Adjust margin if needed
                    />
                </Grid>
            </Grid>
        </Paper>
    );

    if (loading) return <Box display="flex" justifyContent="center" alignItems="center" height="50vh"><CircularProgress size={60} /></Box>;

    return (
        <>
            <PageHeader title="Application Settings" icon={<SettingsIcon />} subtitle="Manage system configuration variables." />
            {error && <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>{error}</Alert>}
            {successMessage && <Alert severity="success" onClose={() => setSuccessMessage(null)} sx={{ mb: 2 }}>{successMessage}</Alert>}

            <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs
                        value={currentTab}
                        onChange={handleTabChange}
                        variant="scrollable"
                        scrollButtons="auto"
                        aria-label="settings categories tabs"
                        sx={{
                            '& .MuiTab-root': { color: 'text.secondary', fontWeight: 'medium' },
                            '& .Mui-selected': { color: 'primary.main', fontWeight: 'bold' },
                            '& .MuiTabs-indicator': { backgroundColor: 'primary.main' }
                        }}
                    >
                        {categories.map((category, index) => (
                            <Tab label={category} key={category} id={`tab-${index}`} aria-controls={`tabpanel-${index}`} />
                        ))}
                    </Tabs>
                </Box>

                {categories.map((category, index) => (
                    <Box
                        key={category}
                        role="tabpanel"
                        hidden={currentTab !== index}
                        id={`tabpanel-${index}`}
                        aria-labelledby={`tab-${index}`}
                        sx={{ p: 3 }}
                    >
                        {currentTab === index && (
                            <Box>
                                <Typography variant="h5" gutterBottom sx={{ color: 'secondary.main', mb: 2 }}>
                                    {category} Settings
                                </Typography>
                                {settingsByCategory[category]?.length > 0 ? (
                                    settingsByCategory[category].map(renderSettingItem)
                                ) : (
                                    <Typography>No settings in this category.</Typography>
                                )}
                            </Box>
                        )}
                    </Box>
                ))}
                 <Divider sx={{ my: 2, borderColor: 'rgba(0, 255, 255, 0.3)' }} />
                <Box sx={{ p: 2, textAlign: 'right' }}>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                        onClick={handleSaveChanges}
                        disabled={loading || saving}
                        size="large"
                    >
                        Save All Changes
                    </Button>
                </Box>
            </Paper>
        </>
    );
};

export default SettingsPage;