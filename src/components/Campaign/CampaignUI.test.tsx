import React from 'react';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
  cleanup,
} from '@testing-library/react';
import { CampaignList } from './CampaignUI';
import CreateCampaign from './CreateCampaign';

// Mock fetch for CampaignList
beforeAll(() => {
  global.fetch = jest.fn();
});
afterAll(() => {
  // @ts-ignore
  global.fetch.mockRestore && global.fetch.mockRestore();
});
afterEach(() => {
  jest.clearAllMocks();
  cleanup();
});

describe('CampaignList', () => {
  it('renders loading state', () => {
    // @ts-ignore
    global.fetch.mockImplementation(() => new Promise(() => {})); // never resolves
    render(<CampaignList />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders error state', async () => {
    // @ts-ignore
    global.fetch.mockRejectedValue(new Error('API error!'));
    render(<CampaignList />);
    await waitFor(() => {
      expect(screen.getByText(/api error!/i)).toBeInTheDocument();
    });
  });

  it('renders list of campaigns', async () => {
    const campaigns = [
      { id: '1', name: 'Spring Sale', description: 'Spring campaign', status: 'draft', startDate: '2024-05-01', endDate: '2024-05-10', createdAt: '', updatedAt: '' },
      { id: '2', name: 'Summer Event', description: '', status: 'active', startDate: '2024-06-01', endDate: '2024-06-15', createdAt: '', updatedAt: '' },
    ];
    // @ts-ignore
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(campaigns),
    });
    render(<CampaignList />);
    await waitFor(() => {
      expect(screen.getByText('Spring Sale')).toBeInTheDocument();
      expect(screen.getByText('Summer Event')).toBeInTheDocument();
    });
  });
});

describe('CreateCampaign', () => {
  it('validates required form fields', async () => {
    render(<CreateCampaign />);

    // Find the button by type and partial text - MUI uses contained text nodes
    const submitButton = screen.getByRole('button', { 
      name: (content) => content.includes('Create')
    });
    
    fireEvent.click(submitButton);

    // For MUI, the error text might not be set immediately
    // First confirm if validation runs with more generic selectors
    await waitFor(() => {      
      // Check for form errors - get the helpers directly rather than by text
      // Campaign name error
      const nameField = screen.getByLabelText(/campaign name/i);
      expect(nameField).toBeInTheDocument();
      
      // Wait for the error state to be applied to the form field
      expect(nameField.closest('.MuiFormControl-root')).toHaveAttribute('aria-invalid', 'true');
    });

    // Check all required fields for errors
    // For the Campaign Name
    const nameInput = screen.getByLabelText(/campaign name/i);
    expect(nameInput.closest('.Mui-error')).not.toBeNull();
    
    // For Subject Line
    const subjectInput = screen.getByLabelText(/subject line/i);
    expect(subjectInput.closest('.Mui-error')).not.toBeNull();

    // For Sender Name
    const senderNameInput = screen.getByLabelText(/sender name/i);
    expect(senderNameInput.closest('.Mui-error')).not.toBeNull();

    // For Sender Email
    const senderEmailInput = screen.getByLabelText(/sender email/i);
    expect(senderEmailInput.closest('.Mui-error')).not.toBeNull();

    // For audience error text specifically
    await waitFor(() => {
      const audienceControl = screen.getByLabelText(/select audience segments/i)
        .closest('.MuiFormControl-root');
      const helperText = within(audienceControl as HTMLElement).getByText(
        /please select at least one audience segment/i
      );
      expect(helperText).toBeInTheDocument();
    });
  });

  it('submits valid form', async () => {
    render(<CreateCampaign />);

    // Fill in all required fields
    fireEvent.change(screen.getByLabelText(/campaign name/i), {
      target: { value: 'Test Campaign' },
    });
    fireEvent.change(screen.getByLabelText(/subject line/i), {
      target: { value: 'Test Subject' },
    });
    fireEvent.change(screen.getByLabelText(/sender name/i), {
      target: { value: 'Alice' },
    });
    fireEvent.change(screen.getByLabelText(/sender email/i), {
      target: { value: 'alice@test.com' },
    });

    // Handle MUI Select for audience
    const audienceSelect = screen.getByLabelText(/select audience segments/i);
    fireEvent.mouseDown(audienceSelect);

    // The popover is rendered in a portal; find the option.
    const menu = await screen.findByRole('listbox');
    
    // Find and click on "All Subscribers" option
    const option = within(menu).getByText(/All Subscribers/i);
    fireEvent.click(option);
    
    // Close the dropdown
    fireEvent.blur(audienceSelect);

    // Get the button with a more flexible selector that checks for partial text match
    const buttons = screen.getAllByRole('button');
    const submitButton = buttons.find(button => 
      button.textContent?.includes('Create')
    );
    
    expect(submitButton).toBeTruthy();
    
    if (submitButton) {
      fireEvent.click(submitButton);
      
      // Wait for success message to appear (matching exact message from component)
      await waitFor(() => {
        expect(screen.getByText(/Campaign created successfully/i)).toBeInTheDocument();
      });
    }
  });
});
