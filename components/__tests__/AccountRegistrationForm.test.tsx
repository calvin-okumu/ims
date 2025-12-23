import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AccountRegistrationForm from '../AccountRegistrationForm'

// Mock the services
jest.mock('../../services/personService', () => ({
  createPerson: jest.fn(),
}));

jest.mock('../../services/cardService', () => ({
  createCard: jest.fn(),
}));

jest.mock('../../services/biometricService', () => ({
  uploadBiometricTemplate: jest.fn(),
}));

jest.mock('../../services/accountService', () => ({
  createAccount: jest.fn(),
}));

jest.mock('../../services/accessLevelService', () => ({
  grantAccess: jest.fn(),
}));

jest.mock('../BranchSelect', () => {
  return function MockBranchSelect({ onChange }: { onChange: (value: string) => void }) {
    return (
      <select
        data-testid="branch-select"
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Select Branch</option>
        <option value="001">Main Branch</option>
      </select>
    );
  };
});

jest.mock('../BranchCreator', () => {
  return function MockBranchCreator() {
    return <div data-testid="branch-creator">Branch Creator</div>;
  };
});

describe('AccountRegistrationForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the account registration form correctly', () => {
    render(<AccountRegistrationForm />);

    expect(screen.getByText('Register Banking Account')).toBeTruthy();
    expect(screen.getAllByRole('textbox')).toHaveLength(7); // 5 inputs + 2 textareas
    expect(screen.getByTestId('branch-select')).toBeTruthy();
  });

  it('validates account number format', async () => {
    const user = userEvent.setup();

    render(<AccountRegistrationForm />);

    // Fill form with invalid account number
    const inputs = screen.getAllByRole('textbox');
    await user.type(inputs[0], 'John Doe'); // Principal Name
    await user.type(inputs[2], 'invalid'); // Account Number
    await user.selectOptions(screen.getByTestId('branch-select'), '001');
    await user.type(screen.getByPlaceholderText('Enter base64 template'), 'fingerprint-template'); // Principal Fingerprint

    const submitButton = screen.getByText('Register Account');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Account number must be 1-15 digits only.')).toBeTruthy();
    });
  });

  it('validates required fields', async () => {
    const user = userEvent.setup();

    render(<AccountRegistrationForm />);

    // Fill required fields but not branch
    const inputs = screen.getAllByRole('textbox');
    await user.type(inputs[0], 'John Doe'); // Principal Name
    await user.type(inputs[2], '123456789'); // Account Number
    await user.type(screen.getByPlaceholderText('Enter base64 template'), 'fingerprint-template'); // Principal Fingerprint

    const submitButton = screen.getByText('Register Account');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Please select a branch for the account.')).toBeTruthy();
    });
  });

  it('successfully registers an account', async () => {
    const user = userEvent.setup();

    // Mock successful API calls
    const mockCreateAccount = require('../../services/accountService').createAccount;
    const mockCreatePerson = require('../../services/personService').createPerson;
    const mockCreateCard = require('../../services/cardService').createCard;

    mockCreateAccount.mockResolvedValue({ id: 'acc-123' });
    mockCreatePerson.mockResolvedValue({ id: 'person-123' });
    mockCreateCard.mockResolvedValue({ id: 'card-123' });

    render(<AccountRegistrationForm />);

    // Fill form with valid data
    const inputs = screen.getAllByRole('textbox');
    await user.type(inputs[0], 'John Doe'); // Principal Name
    await user.type(inputs[2], '123456789'); // Account Number
    await user.selectOptions(screen.getByTestId('branch-select'), '001');
    await user.type(screen.getByPlaceholderText('Enter base64 template'), 'fingerprint-template'); // Principal Fingerprint

    const submitButton = screen.getByText('Register Account');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockCreateAccount).toHaveBeenCalledWith({
        accountNumber: '123456789',
        clientName: 'John Doe',
        accessLevelId: 1,
        accountId: 0,
        principalPersonId: 0,
        spousePersonId: undefined,
        status: 'active',
      });
      expect(screen.getByText('Account registered successfully!')).toBeTruthy();
    });
  });

  it('shows loading state during submission', async () => {
    const user = userEvent.setup();

    // Mock delayed API call
    const mockCreateAccount = require('../../services/accountService').createAccount;
    mockCreateAccount.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ id: 'acc-123' }), 100)));

    render(<AccountRegistrationForm />);

    // Fill form
    const inputs = screen.getAllByRole('textbox');
    await user.type(inputs[0], 'John Doe'); // Principal Name
    await user.type(inputs[2], '123456789'); // Account Number
    await user.selectOptions(screen.getByTestId('branch-select'), '001');
    await user.type(screen.getByPlaceholderText('Enter base64 template'), 'fingerprint-template'); // Principal Fingerprint

    const submitButton = screen.getByText('Register Account');
    await user.click(submitButton);

    // Check loading state
    expect(screen.getByText('Registering...')).toBeTruthy();
  });
});