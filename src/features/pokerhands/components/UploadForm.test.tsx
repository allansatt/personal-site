import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import UploadForm from './UploadForm';

const mockRequestUploadUrl = vi.fn();
let mockIsLoading = false;
let mockError: Error | null = null;

vi.mock('../hooks/useUploadUrl', () => ({
  useUploadUrl: () => ({
    isLoading: mockIsLoading,
    error: mockError,
    requestUploadUrl: mockRequestUploadUrl,
  }),
}));

describe('UploadForm', () => {
  const onUploadSuccess = vi.fn();

  beforeEach(() => {
    vi.restoreAllMocks();
    mockIsLoading = false;
    mockError = null;
    mockRequestUploadUrl.mockReset();
    onUploadSuccess.mockReset();
  });

  afterEach(cleanup);

  it('renders file input and submit button', () => {
    render(<UploadForm onUploadSuccess={onUploadSuccess} />);
    expect(screen.getByLabelText(/file/i)).toBeTruthy();
    expect(screen.getByRole('button', { name: /upload/i })).toBeTruthy();
  });

  it('file input only accepts .txt files', () => {
    render(<UploadForm onUploadSuccess={onUploadSuccess} />);
    const input = screen.getByLabelText(/file/i) as HTMLInputElement;
    expect(input.accept).toBe('.txt');
  });

  it('submit button is disabled when no file is selected', () => {
    render(<UploadForm onUploadSuccess={onUploadSuccess} />);
    expect((screen.getByRole('button', { name: /upload/i }) as HTMLButtonElement).disabled).toBe(true);
  });

  it('submit button is disabled while loading', () => {
    mockIsLoading = true;
    render(<UploadForm onUploadSuccess={onUploadSuccess} />);
    expect((screen.getByRole('button', { name: /upload/i }) as HTMLButtonElement).disabled).toBe(true);
  });

  it('calls requestUploadUrl and PUTs file to S3 on success', async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', mockFetch);

    mockRequestUploadUrl.mockResolvedValue({
      uploadUrl: 'https://s3.example.com/presigned',
      jobId: 'job-1',
    });

    const file = new File(['hand data'], 'hands.txt', { type: 'text/plain' });

    render(<UploadForm onUploadSuccess={onUploadSuccess} />);

    fireEvent.change(screen.getByLabelText(/file/i), { target: { files: [file] } });
    fireEvent.click(screen.getByRole('button', { name: /upload/i }));

    await waitFor(() => {
      expect(mockRequestUploadUrl).toHaveBeenCalledWith('hands.txt');
    });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        'https://s3.example.com/presigned',
        expect.objectContaining({ method: 'PUT', body: file }),
      );
    });

    await waitFor(() => {
      expect(onUploadSuccess).toHaveBeenCalled();
    });

    expect(screen.getByText(/upload queued successfully/i)).toBeTruthy();
  });

  it('shows sign-in prompt when requestUploadUrl fails with 401', async () => {
    mockRequestUploadUrl.mockImplementation(async () => {
      mockError = new Error('HTTP 401');
      return null;
    });

    const file = new File(['data'], 'hands.txt', { type: 'text/plain' });
    const { rerender } = render(<UploadForm onUploadSuccess={onUploadSuccess} />);

    fireEvent.change(screen.getByLabelText(/file/i), { target: { files: [file] } });
    fireEvent.click(screen.getByRole('button', { name: /upload/i }));

    await waitFor(() => {
      expect(mockRequestUploadUrl).toHaveBeenCalled();
    });

    // Rerender to pick up the updated mockError
    rerender(<UploadForm onUploadSuccess={onUploadSuccess} />);

    expect(screen.getByText(/sign in/i)).toBeTruthy();
    expect(onUploadSuccess).not.toHaveBeenCalled();
  });

  it('shows error when S3 PUT fails', async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: false, status: 500 });
    vi.stubGlobal('fetch', mockFetch);

    mockRequestUploadUrl.mockResolvedValue({
      uploadUrl: 'https://s3.example.com/presigned',
      jobId: 'job-1',
    });

    const file = new File(['data'], 'hands.txt', { type: 'text/plain' });
    render(<UploadForm onUploadSuccess={onUploadSuccess} />);

    fireEvent.change(screen.getByLabelText(/file/i), { target: { files: [file] } });
    fireEvent.click(screen.getByRole('button', { name: /upload/i }));

    await waitFor(() => {
      expect(screen.getByText(/upload failed/i)).toBeTruthy();
    });

    expect(onUploadSuccess).not.toHaveBeenCalled();
  });
});
