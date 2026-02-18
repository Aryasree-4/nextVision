import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Button from '../components/Button';

describe('Button Component', () => {
    it('renders children correctly', () => {
        render(<Button>Click Me</Button>);
        expect(screen.getByText('Click Me')).toBeInTheDocument();
    });

    it('handles click events', () => {
        const onClick = vi.fn();
        render(<Button onClick={onClick}>Click Me</Button>);
        fireEvent.click(screen.getByText('Click Me'));
        expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('shows loading state and is disabled', () => {
        render(<Button isLoading={true}>Click Me</Button>);
        expect(screen.getByRole('button')).toBeDisabled();
        expect(screen.getByText('Click Me')).toBeInTheDocument();
        // Check for presence of spinner svg if needed
    });
});
