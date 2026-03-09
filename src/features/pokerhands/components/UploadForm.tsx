import { useState, type FormEvent, type ChangeEvent } from 'react';
import { useUploadUrl } from '../hooks/useUploadUrl';

interface UploadFormProps {
  onUploadSuccess: () => void;
}

function UploadForm({ onUploadSuccess }: UploadFormProps) {
  const { isLoading, error, requestUploadUrl } = useUploadUrl();
  const [file, setFile] = useState<File | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [putError, setPutError] = useState<string | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] ?? null);
    setSuccessMessage(null);
    setPutError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setSuccessMessage(null);
    setPutError(null);

    const result = await requestUploadUrl(file.name);
    if (!result) return;

    try {
      const res = await fetch(result.uploadUrl, {
        method: 'PUT',
        body: file,
      });
      if (!res.ok) {
        setPutError('Upload failed. Please try again.');
        return;
      }
      setSuccessMessage('Upload queued successfully');
      setFile(null);
      onUploadSuccess();
    } catch {
      setPutError('Upload failed. Please try again.');
    }
  };

  const is401 = error?.message?.includes('401');

  return (
    <form onSubmit={handleSubmit}>
      <label>
        File
        <input type="file" accept=".txt" onChange={handleFileChange} />
      </label>
      <button type="submit" disabled={!file || isLoading}>
        Upload
      </button>
      {isLoading && <p>Uploading…</p>}
      {successMessage && <p>{successMessage}</p>}
      {is401 && <p>Please sign in to upload files.</p>}
      {error && !is401 && <p>An error occurred. Please try again.</p>}
      {putError && <p>{putError}</p>}
    </form>
  );
}

export default UploadForm;
