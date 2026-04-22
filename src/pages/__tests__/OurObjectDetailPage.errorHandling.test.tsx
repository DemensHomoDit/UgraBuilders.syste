import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import OurObjectDetailPage from '../OurObjectDetailPage';
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

vi.mock('@/components/objects/ObjectGallery', () => ({
  default: ({ images }: any) => <div data-testid="object-gallery">{images.length} images</div>,
}));

vi.mock('@/components/objects/ObjectReviewBlock', () => ({
  default: ({ review }: any) => <div data-testid="object-review">{review.author_name}</div>,
}));

describe('OurObjectDetailPage - Error Handling (Requirement 2.6)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show NotFoundState for 404 (object not found)', async () => {
    const dbModule = await import('@/integrations/db/client');
    const { db } = dbModule;
    
    // Mock object not found
    (db.from as any).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: null,
            error: null,
          }),
        }),
      }),
    });

    render(
      <MemoryRouter initialEntries={['/objects/123e4567-e89b-12d3-a456-426614174000']}>
        <Routes>
          <Route path="/objects/:id" element={<OurObjectDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('404')).toBeInTheDocument();
      expect(screen.getByText('Объект не найден')).toBeInTheDocument();
      expect(screen.getByText('Этот объект не существует или ещё не опубликован.')).toBeInTheDocument();
    });
  });

  it('should show NotFoundState for unpublished object', async () => {
    const dbModule = await import('@/integrations/db/client');
    const { db } = dbModule;
    
    // Mock unpublished object
    (db.from as any).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: {
              id: '123e4567-e89b-12d3-a456-426614174000',
              title: 'Unpublished Object',
              is_published: false,
            },
            error: null,
          }),
        }),
      }),
    });

    render(
      <MemoryRouter initialEntries={['/objects/123e4567-e89b-12d3-a456-426614174000']}>
        <Routes>
          <Route path="/objects/:id" element={<OurObjectDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('404')).toBeInTheDocument();
      expect(screen.getByText('Объект не найден')).toBeInTheDocument();
    });
  });

  it('should show toast.error when loading object fails', async () => {
    const dbModule = await import('@/integrations/db/client');
    const { db } = dbModule;
    
    // Mock database error
    (db.from as any).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockRejectedValue(new Error('Database error')),
        }),
      }),
    });

    render(
      <MemoryRouter initialEntries={['/objects/123e4567-e89b-12d3-a456-426614174000']}>
        <Routes>
          <Route path="/objects/:id" element={<OurObjectDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Не удалось загрузить объект');
    });
  });

  it('should gracefully handle images loading error (not block page content)', async () => {
    const dbModule = await import('@/integrations/db/client');
    const { db } = dbModule;
    
    const mockObject = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      title: 'Test Object',
      description: 'Test description',
      is_published: true,
      display_order: 1,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    };

    let callCount = 0;
    (db.from as any).mockImplementation((table: string) => {
      if (table === 'our_objects') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({
                data: mockObject,
                error: null,
              }),
            }),
          }),
        };
      } else if (table === 'our_object_images') {
        // Simulate images loading error
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({
                data: null,
                error: new Error('Images loading failed'),
              }),
            }),
          }),
        };
      } else if (table === 'our_object_reviews') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: null,
                  error: null,
                }),
              }),
            }),
          }),
        };
      }
    });

    render(
      <MemoryRouter initialEntries={['/objects/123e4567-e89b-12d3-a456-426614174000']}>
        <Routes>
          <Route path="/objects/:id" element={<OurObjectDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    // Wait for page to render
    await waitFor(() => {
      // Object title should still be visible
      expect(screen.getByText('Test Object')).toBeInTheDocument();
      // Description should still be visible
      expect(screen.getByText('Test description')).toBeInTheDocument();
    });

    // Gallery should not be rendered (no images)
    expect(screen.queryByTestId('object-gallery')).not.toBeInTheDocument();

    // No error toast should be shown for images failure
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('should gracefully handle review loading error (not block page content)', async () => {
    const dbModule = await import('@/integrations/db/client');
    const { db } = dbModule;
    
    const mockObject = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      title: 'Test Object',
      description: 'Test description',
      is_published: true,
      display_order: 1,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    };

    const mockImages = [
      { id: '1', object_id: mockObject.id, image_url: 'test.jpg', display_order: 1, created_at: '2024-01-01T00:00:00Z' },
    ];

    (db.from as any).mockImplementation((table: string) => {
      if (table === 'our_objects') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({
                data: mockObject,
                error: null,
              }),
            }),
          }),
        };
      } else if (table === 'our_object_images') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({
                data: mockImages,
                error: null,
              }),
            }),
          }),
        };
      } else if (table === 'our_object_reviews') {
        // Simulate review loading error
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: null,
                  error: new Error('Review loading failed'),
                }),
              }),
            }),
          }),
        };
      }
    });

    render(
      <MemoryRouter initialEntries={['/objects/123e4567-e89b-12d3-a456-426614174000']}>
        <Routes>
          <Route path="/objects/:id" element={<OurObjectDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    // Wait for page to render
    await waitFor(() => {
      // Object title should still be visible
      expect(screen.getByText('Test Object')).toBeInTheDocument();
      // Description should still be visible
      expect(screen.getByText('Test description')).toBeInTheDocument();
      // Gallery should be visible
      expect(screen.getByTestId('object-gallery')).toBeInTheDocument();
    });

    // Review should not be rendered
    expect(screen.queryByTestId('object-review')).not.toBeInTheDocument();

    // No error toast should be shown for review failure
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('should render all content when everything loads successfully', async () => {
    const dbModule = await import('@/integrations/db/client');
    const { db } = dbModule;
    
    const mockObject = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      title: 'Test Object',
      description: 'Test description',
      is_published: true,
      display_order: 1,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    };

    const mockImages = [
      { id: '1', object_id: mockObject.id, image_url: 'test.jpg', display_order: 1, created_at: '2024-01-01T00:00:00Z' },
    ];

    const mockReview = {
      id: '1',
      object_id: mockObject.id,
      author_name: 'John Doe',
      is_published: true,
      created_at: '2024-01-01T00:00:00Z',
    };

    (db.from as any).mockImplementation((table: string) => {
      if (table === 'our_objects') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({
                data: mockObject,
                error: null,
              }),
            }),
          }),
        };
      } else if (table === 'our_object_images') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({
                data: mockImages,
                error: null,
              }),
            }),
          }),
        };
      } else if (table === 'our_object_reviews') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: mockReview,
                  error: null,
                }),
              }),
            }),
          }),
        };
      }
    });

    render(
      <MemoryRouter initialEntries={['/objects/123e4567-e89b-12d3-a456-426614174000']}>
        <Routes>
          <Route path="/objects/:id" element={<OurObjectDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    // Wait for all content to render
    await waitFor(() => {
      expect(screen.getByText('Test Object')).toBeInTheDocument();
      expect(screen.getByText('Test description')).toBeInTheDocument();
      expect(screen.getByTestId('object-gallery')).toBeInTheDocument();
      expect(screen.getByTestId('object-review')).toBeInTheDocument();
    });

    // No error toast should be shown
    expect(toast.error).not.toHaveBeenCalled();
  });
});
