import { render, screen } from '@testing-library/react';
import App from './App';

test('renders ConnectionAdvisor', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: /connectionadvisor/i })).toBeInTheDocument();
});
