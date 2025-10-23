# Media Upload API

## Endpoint: POST /api/media/upload

This endpoint allows you to upload media files to Payload CMS without using multipart form data.

### Request Format

Send a JSON request with the following structure:

```json
{
  "fileData": "base64_encoded_file_data",
  "fileName": "original_filename.jpg",
  "alt": "Alternative text for the image (optional)",
  "uploadedBy": "user_id_here (optional)"
}
```

### Example Usage

#### JavaScript/TypeScript

```javascript
// Convert file to base64
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(",")[1]); // Remove data:image/jpeg;base64, prefix
    reader.onerror = (error) => reject(error);
  });
}

// Upload file
async function uploadMedia(file, alt = "", uploadedBy = null) {
  const fileData = await fileToBase64(file);

  const response = await fetch("http://localhost:3005/api/media/upload", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fileData,
      fileName: file.name,
      alt,
      uploadedBy,
    }),
  });

  return await response.json();
}

// Usage
const fileInput = document.getElementById("fileInput");
fileInput.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (file) {
    try {
      const result = await uploadMedia(file, "My uploaded image");
      console.log("File uploaded:", result.fileUrl);
    } catch (error) {
      console.error("Upload failed:", error);
    }
  }
});
```

#### cURL Example

```bash
curl -X POST http://localhost:3005/api/media/upload \
  -H "Content-Type: application/json" \
  -d '{
    "fileData": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
    "fileName": "test.png",
    "alt": "Test image",
    "uploadedBy": "user123"
  }'
```

### Response Format

#### Success Response (200)

```json
{
  "success": true,
  "fileUrl": "http://localhost:3005/api/media/file/1703123456789-abc123.png",
  "mediaId": "64f8b2c1d4e5f6a7b8c9d0e1",
  "filename": "1703123456789-abc123.png"
}
```

#### Error Response (400/500)

```json
{
  "error": "No file data provided",
  "details": "Additional error details if available"
}
```

### File Access

Uploaded files are accessible via the static file endpoint:

- URL pattern: `http://localhost:3005/api/media/file/{filename}`
- Example: `http://localhost:3005/api/media/file/1703123456789-abc123.png`

### Notes

- Files are stored in the `media/` directory
- Filenames are automatically generated with timestamps to prevent conflicts
- The endpoint accepts base64-encoded file data
- Maximum file size is limited by the Express body parser (50MB by default)
- Files are immediately available via the static file endpoint after upload

