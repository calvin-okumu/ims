import { render, screen } from '@testing-library/react'
import Notification from '../Notification'

describe('Notification', () => {
  it('renders success notification', () => {
    render(
      <Notification
        type="success"
        message="Test message"
        onClose={() => {}}
      />
    )

    expect(screen.getByText('Test message')).toBeInTheDocument()
  })

  it('renders error notification', () => {
    render(
      <Notification
        type="error"
        message="Error message"
        onClose={() => {}}
      />
    )

    expect(screen.getByText('Error message')).toBeInTheDocument()
  })
})