import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AccessLevelManagement from '../AccessLevelManagement'

// Mock the API services
jest.mock('../../services/accessLevelService', () => ({
  getAccessLevels: jest.fn(),
  createAccessLevel: jest.fn(),
  deleteAccessLevel: jest.fn(),
}));

jest.mock('../../hooks/useAreaBasedDoorSelection', () => ({
  useAreaBasedDoorSelection: () => ({
    areas: [],
    doorsByDevice: {},
    deviceNames: {},
    selectedDevice: null,
    loading: false,
    error: null,
    setSelectedDevice: jest.fn(),
  }),
}));

const mockGetAccessLevels = require('../../services/accessLevelService').getAccessLevels;
const mockCreateAccessLevel = require('../../services/accessLevelService').createAccessLevel;
const mockDeleteAccessLevel = require('../../services/accessLevelService').deleteAccessLevel;

describe('AccessLevelManagement', () => {
  const mockShowNotification = jest.fn();
  const mockOnAccessLevelsChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetAccessLevels.mockResolvedValue([
      { id: '1', name: 'General Access', Description: 'Basic access level' },
      { id: '2', name: 'VIP Access', Description: 'Premium access level' }
    ]);
  });

  it('renders access levels correctly', async () => {
    render(
      <AccessLevelManagement
        accessLevels={[
          { id: '1', name: 'General Access', Description: 'Basic access level' }
        ]}
        onAccessLevelsChange={mockOnAccessLevelsChange}
        showNotification={mockShowNotification}
      />
    );

    expect(screen.getByText('Create New Access Level')).toBeTruthy();
    expect(screen.getByText('General Access')).toBeTruthy();
    expect(screen.getByText('Basic access level')).toBeTruthy();
  });

  it('creates new access level successfully', async () => {
    const user = userEvent.setup();
    mockCreateAccessLevel.mockResolvedValue({ id: '3', name: 'New Level' });

    render(
      <AccessLevelManagement
        accessLevels={[]}
        onAccessLevelsChange={mockOnAccessLevelsChange}
        showNotification={mockShowNotification}
      />
    );

    await user.type(screen.getByPlaceholderText('e.g., VIP Access'), 'Test Level');
    await user.type(screen.getByPlaceholderText('e.g., Access to main areas and VIP lounge'), 'Test Description');
    await user.click(screen.getByText('Create Access Level & Sync to ZKBio'));

    await waitFor(() => {
      expect(mockCreateAccessLevel).toHaveBeenCalledWith({
        name: 'Test Level',
        description: 'Test Description'
      });
      expect(mockShowNotification).toHaveBeenCalledWith('Access level created successfully', 'success');
      expect(mockOnAccessLevelsChange).toHaveBeenCalled();
    });
  });

  it('handles creation error', async () => {
    const user = userEvent.setup();
    mockCreateAccessLevel.mockRejectedValue(new Error('API Error'));

    render(
      <AccessLevelManagement
        accessLevels={[]}
        onAccessLevelsChange={mockOnAccessLevelsChange}
        showNotification={mockShowNotification}
      />
    );

    await user.type(screen.getByPlaceholderText('e.g., VIP Access'), 'Test Level');
    await user.type(screen.getByPlaceholderText('e.g., Access to main areas and VIP lounge'), 'Test Description');
    await user.click(screen.getByText('Create Access Level & Sync to ZKBio'));

    await waitFor(() => {
      expect(mockShowNotification).toHaveBeenCalledWith('Failed to create access level', 'error');
    });
  });

  it('validates required fields', async () => {
    const user = userEvent.setup();

    render(
      <AccessLevelManagement
        accessLevels={[]}
        onAccessLevelsChange={mockOnAccessLevelsChange}
        showNotification={mockShowNotification}
      />
    );

    // Fill name but leave description empty to trigger validation
    await user.type(screen.getByPlaceholderText('e.g., VIP Access'), 'Test Level');
    await user.click(screen.getByText('Create Access Level & Sync to ZKBio'));

    expect(mockShowNotification).toHaveBeenCalledWith('Name and description are required', 'error');
    expect(mockCreateAccessLevel).not.toHaveBeenCalled();
  });
});