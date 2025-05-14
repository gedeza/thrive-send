import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CreateCampaign from '../CreateCampaign'; // Adjust path if necessary
import * as api from '../../../lib/api'; // Adjusted path to your api.ts

// Mock the createCampaign API function
jest.mock('../../../lib/api', () => ({
  ...jest.requireActual('../../../lib/api'), // Import and retain other exports
  createCampaign: jest.fn(),
}));

// Mocking for @mui/x-date-pickers
// If you encounter issues with date pickers in tests, you might need more specific mocks.
// For now, let's ensure LocalizationProvider is available.
jest.mock('@mui/x-date-pickers/LocalizationProvider', () => ({
  LocalizationProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
jest.mock('@mui/x-date-pickers/DatePicker', () => ({
  DatePicker: (props: any) => (
    <input
      data-testid="mock-datepicker"
      type="date"
      value={props.value ? new Date(props.value).toISOString().split('T')[0] : ''}
      onChange={(e) => props.onChange(e.target.valueAsDate)}
      aria-label={props.label}
    />
  ),
}));


describe('CreateCampaign Component', () => {
  const mockCreateCampaign = api.createCampaign as jest.Mock;

  beforeEach(() => {
    // Reset mocks before each test
    mockCreateCampaign.mockClear();
    // Mock console.error to avoid noise during tests for expected errors
    // jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // jest.restoreAllMocks();
  });

  test('renders all form fields and submit button', () => {
    render(<CreateCampaign />);

    expect(screen.getByLabelText(/campaign name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/campaign type/i)).toBeInTheDocument();
    // Note: DatePicker is mocked, so we might look for its mock representation or label
    expect(screen.getByLabelText(/schedule date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/subject line/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/sender name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/sender email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/select audience segments/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create campaign/i })).toBeInTheDocument();
  });

  test('allows typing into text fields', () => {
    render(<CreateCampaign />);
    const campaignNameInput = screen.getByLabelText(/campaign name/i);
    fireEvent.change(campaignNameInput, { target: { value: 'Test Campaign' } });
    expect(campaignNameInput).toHaveValue('Test Campaign');

    const subjectInput = screen.getByLabelText(/subject line/i);
    fireEvent.change(subjectInput, { target: { value: 'Test Subject' } });
    expect(subjectInput).toHaveValue('Test Subject');
  });

  test('shows validation errors for required fields on submit', async () => {
    render(<CreateCampaign />);
    const submitButton = screen.getByRole('button', { name: /create campaign/i });

    fireEvent.click(submitButton);

    // Use await findByText for elements that appear asynchronously after validation
    expect(await screen.findByText('Campaign name is required')).toBeInTheDocument();
    expect(await screen.findByText('Subject line is required')).toBeInTheDocument();
    expect(await screen.findByText('Sender name is required')).toBeInTheDocument();
    expect(await screen.findByText('Sender email is required')).toBeInTheDocument();
    expect(await screen.findByText('Please select at least one audience segment')).toBeInTheDocument();
    // Add check for campaign type if it's made required and validated
  });

  test('submits the form with correct data on valid input', async () => {
    mockCreateCampaign.mockResolvedValueOnce({ id: '123', name: 'Test Campaign' });
    render(<CreateCampaign />);

    // Fill in the form
    fireEvent.change(screen.getByLabelText(/campaign name/i), { target: { value: 'My Awesome Campaign' } });
    fireEvent.change(screen.getByLabelText(/subject line/i), { target: { value: 'Check this out!' } });
    fireEvent.change(screen.getByLabelText(/sender name/i), { target: { value: 'Me' } });
    fireEvent.change(screen.getByLabelText(/sender email/i), { target: { value: 'me@example.com' } });
    
    // Simulate selecting campaign type (assuming Material UI Select)
    const campaignTypeSelect = screen.getByLabelText(/campaign type/i);
    fireEvent.mouseDown(campaignTypeSelect); // Open the dropdown
    // Wait for MenuItems to be available
    const newsletterOption = await screen.findByRole('option', { name: /newsletter/i });
    fireEvent.click(newsletterOption);

    // Simulate selecting audience (assuming Material UI Select multiple)
    const audienceSelect = screen.getByLabelText(/select audience segments/i);
    fireEvent.mouseDown(audienceSelect);
    const allSubscribersOption = await screen.findByRole('option', { name: /all subscribers/i });
    fireEvent.click(allSubscribersOption);
    // To close the multi-select, sometimes a click outside or pressing Escape is needed
    fireEvent.keyDown(document.activeElement || document.body, { key: 'Escape' });


    const submitButton = screen.getByRole('button', { name: /create campaign/i });
    fireEvent.click(submitButton);

    // Check for loading state
    expect(screen.getByRole('button', { name: /creating.../i })).toBeDisabled();

    // Wait for API call and success message
    await waitFor(() => {
      expect(mockCreateCampaign).toHaveBeenCalledTimes(1);
      expect(mockCreateCampaign).toHaveBeenCalledWith(expect.objectContaining({
        name: 'My Awesome Campaign',
        subject: 'Check this out!',
        senderName: 'Me',
        senderEmail: 'me@example.com',
        type: 'newsletter', // from selection
        audiences: ['all-subscribers'], // from selection
      }));
    });
    
    expect(await screen.findByText(/Campaign created successfully!/i)).toBeInTheDocument();
    // Check if button text reverts and is enabled
    expect(screen.getByRole('button', { name: /create campaign/i })).toBeEnabled();
  });

  test('shows an error message if API call fails', async () => {
    mockCreateCampaign.mockRejectedValueOnce(new Error('Network Error'));
    render(<CreateCampaign />);

    // Fill in minimal valid data
    fireEvent.change(screen.getByLabelText(/campaign name/i), { target: { value: 'Error Test' } });
    fireEvent.change(screen.getByLabelText(/subject line/i), { target: { value: 'Error Subject' } });
    fireEvent.change(screen.getByLabelText(/sender name/i), { target: { value: 'Sender' } });
    fireEvent.change(screen.getByLabelText(/sender email/i), { target: { value: 'sender@example.com' } });
    
    const campaignTypeSelect = screen.getByLabelText(/campaign type/i);
    fireEvent.mouseDown(campaignTypeSelect);
    fireEvent.click(await screen.findByRole('option', { name: /newsletter/i }));

    const audienceSelect = screen.getByLabelText(/select audience segments/i);
    fireEvent.mouseDown(audienceSelect);
    fireEvent.click(await screen.findByRole('option', { name: /all subscribers/i }));
    fireEvent.keyDown(document.activeElement || document.body, { key: 'Escape' });


    const submitButton = screen.getByRole('button', { name: /create campaign/i });
    fireEvent.click(submitButton);

    // Wait for error message
    expect(await screen.findByText(/Network Error/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create campaign/i })).toBeEnabled(); // Ensure button is usable again
  });

  // Add more tests:
  // - Specific validation rules (e.g., email format)
  // - Date selection (might need more robust mocking for DatePicker depending on its internals)
  // - Interaction with description, different campaign types, multiple audiences
});