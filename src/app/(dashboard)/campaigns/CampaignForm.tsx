import React, { useState } from 'react';
import { TextField, Button, MenuItem, Box, Typography, FormHelperText } from "@mui/material";
import { campaigns, type Campaign, CampaignStatus } from "./campaigns.mock-data";

interface CampaignFormProps {
  initialData?: Partial<Campaign>;
  onSubmit: (values: Omit<Campaign, "id"|"createdAt">) => void;
  submitting?: boolean;
  submitLabel?: string;
}

const statusOptions: CampaignStatus[] = ["Scheduled", "Sent", "Draft", "Paused", "Archived"];
const channelOptions = ["Email", "SMS", "Social", "Push"];

export function CampaignForm({
  initialData = {},
  onSubmit,
  submitting = false,
  submitLabel = "Save",
}: CampaignFormProps) {
  const [formData, setFormData] = useState<Omit<Campaign, "id"|"createdAt">>({
    name: initialData.name ?? "",
    status: initialData.status ?? "Draft",
    sentDate: initialData.sentDate ?? "",
    openRate: initialData.openRate ?? "",
    channel: initialData.channel ?? "Email",
    audience: initialData.audience ?? "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const validate = () => {
    const newErrors: Record<string,string> = {};
    if (!formData.name.trim()) newErrors.name = "Campaign name is required";
    if (!formData.audience.trim()) newErrors.audience = "Audience is required";
    if (!formData.channel.trim()) newErrors.channel = "Channel is required";
    if (!formData.status.trim()) newErrors.status = "Status is required";
    // (Optional) stricter date/OpenRate validation
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitAttempted(true);
    if (validate()) {
      onSubmit(formData);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (name) {
      setFormData(prev => ({ ...prev, [name]: value as string }));
      if (errors[name]) setErrors(prev => ({ ...prev, [name]: undefined! }));
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 560, margin: "0 auto" }}>
      <Typography variant="h5" fontWeight={600} gutterBottom>
        {initialData.name ? "Edit Campaign" : "Create Campaign"}
      </Typography>
      <TextField
        fullWidth margin="normal" label="Campaign Name" name="name"
        value={formData.name} onChange={handleChange}
        error={!!errors.name} helperText={errors.name}
        required
      />
      <TextField
        fullWidth select label="Channel" name="channel" margin="normal"
        value={formData.channel}
        onChange={handleChange}
        error={!!errors.channel}
        helperText={errors.channel}
        required
      >
        {channelOptions.map(opt => (
          <MenuItem key={opt} value={opt}>{opt}</MenuItem>
        ))}
      </TextField>
      <TextField
        fullWidth label="Audience" name="audience" margin="normal"
        value={formData.audience}
        onChange={handleChange}
        error={!!errors.audience}
        helperText={errors.audience}
        required
      />
      <TextField
        fullWidth select label="Status" name="status" margin="normal"
        value={formData.status}
        onChange={handleChange}
        error={!!errors.status}
        helperText={errors.status}
        required
      >
        {statusOptions.map(opt => (
          <MenuItem key={opt} value={opt}>{opt}</MenuItem>
        ))}
      </TextField>
      <TextField
        fullWidth label="Sent Date" name="sentDate" margin="normal"
        type="date"
        InputLabelProps={{ shrink: true }}
        value={formData.sentDate || ""}
        onChange={handleChange}
      />
      <TextField
        fullWidth label="Open Rate (%)" name="openRate" margin="normal"
        value={formData.openRate || ""}
        onChange={handleChange}
        inputProps={{ pattern: "(\\d+%?)?" }}
      />
      <Box mt={2}>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={submitting}
        >
          {submitLabel}
        </Button>
      </Box>
      {submitAttempted && Object.values(errors).length > 0 && (
        <FormHelperText error sx={{ mt:2 }}>
          Please fix the errors above before submitting.
        </FormHelperText>
      )}
    </form>
  );
}