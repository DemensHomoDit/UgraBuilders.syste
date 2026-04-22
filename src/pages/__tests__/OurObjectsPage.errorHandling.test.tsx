import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import OurObjectsPage from '../OurObjectsPage';
import { toast } from 'sonner';

// Mock dependencies
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
  },
}));

vi.mock('@/integrations/db/client', () => ({
  db: {
    from: vi.fn(),
  },
}));

vi.mock('@/components/Navbar', () => ({
  default: () => <div data-testid="navbar">Navbar</div>,
}));

vi.mock('@/components/Footer', () => ({
  default: () => <div data-testid="footer">Footer</div>,
}));

vi.mock('@/components/objects/OurObjectCard', () => ({
  default: ({ object }: any) => <div data-testid={`object-card-${object.id}`}>{object.title}</div>,
}));

describe('OurObjectsPage - Error Handling (Requirement 2.6)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show toast.error when loading list fails', async () => {
    const dbModule = await import('@/integrations/db/client');
    const { db } = dbModule;
    
    // Mock database error
    (db.from as any).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: null,
            error: new Error('Database connection failed'),
          }),
        }),
      }),
    });

    render(
      <BrowserRouter>
        <OurObjectsPage />
      </BrowserRouter>
    );

    // Wait for the error to be handled
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Не удалось загрузить объекты');
    });

    // Page should still render (not crash)
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('should show empty state when no objects are returned', async () => {
    const dbModule = await import('@/integrations/db/client');
    const { db } = dbModule;
    
    // Mock successful but empty response
    (db.from as any).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
        }),
      }),
    });

    render(
      <BrowserRouter>
        <OurObjectsPage />
      </BrowserRouter>
    );

    // Wait for empty state to appear
    await waitFor(() => {
      expect(screen.getByText('Объекты скоро появятся')).toBeInTheDocument();
    });
  });

  it('should show skeleton during loading', async () => {
    const dbModule = await import('@/integrations/db/client');
    const { db } = dbModule;
    
    // Mock a slow response
    (db.from as any).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue(new Promise(() => {})), // Never resolves
        }),
      }),
    });

    render(
      <BrowserRouter>
        <OurObjectsPage />
      </BrowserRouter>
    );

    // Should show skeleton (animated pulse elements)
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('should render objects successfully when data loads', async () => {
    const dbModule = await import('@/integrations/db/client');
    const { db } = dbModule;
    
    const mockObjects = [
      {
        id: '1',
        title: 'Test Object 1',
        is_published: true,
        display_order: 1,
        created_at: '2024-01-01T00:00:00Z',
      },
      {
        id: '2',
        title: 'Test Object 2',
        is_published: true,
        display_order: 2,
        created_at: '2024-01-02T00:00:00Z',
      },
    ];

    (db.from as any).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: mockObjects,
            error: null,
          }),
        }),
      }),
    });

    render(
      <BrowserRouter>
        <OurObjectsPage />
      </BrowserRouter>
    );

    // Wait for objects to render
    await waitFor(() => {
      expect(screen.getByTestId('object-card-1')).toBeInTheDocument();
      expect(screen.getByTestId('object-card-2')).toBeInTheDocument();
    });

    // Should not show error toast
    expect(toast.error).not.toHaveBeenCalled();
  });
});
