const API_URL =
  process.env.INTERNAL_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export type PhotoAsset = {
  id: string;
  draft_id: string;
  original_filename: string;
  content_type: string;
  size_bytes: number;
  status: string;
  created_at: string;
  updated_at: string;
};

type PhotoUploadResponse = {
  asset_id: string;
  upload_url: string;
  storage_key: string;
  expires_in_seconds: number;
};

async function getErrorMessage(
  response: Response,
): Promise<string> {
  try {
    const body = (await response.json()) as {
      detail?:
        | string
        | Array<{
            msg?: string;
            loc?: Array<string | number>;
          }>;
    };

    if (typeof body.detail === "string") {
      return body.detail;
    }

    if (Array.isArray(body.detail)) {
      return body.detail
        .map((error) => {
          const location = error.loc
            ?.filter((part) => part !== "body")
            .join(" → ");

          if (location && error.msg) {
            return `${location}: ${error.msg}`;
          }

          return error.msg ?? "Invalid request.";
        })
        .join(" ");
    }

    return "Photo upload failed.";
  } catch {
    return "Photo upload failed.";
  }
}

export async function createPhotoUpload(
  draftId: string,
  file: File,
): Promise<PhotoUploadResponse> {
  const response = await fetch(
    `${API_URL}/drafts/${draftId}/photos`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        filename: file.name,
        content_type: file.type,
        size_bytes: file.size,
      }),
    },
  );

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response.json() as Promise<PhotoUploadResponse>;
}

export async function uploadPhotoToStorage(
  uploadUrl: string,
  file: File,
): Promise<void> {
  const response = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": file.type,
    },
    body: file,
  });

  if (!response.ok) {
    throw new Error("Unable to upload photo.");
  }
}

export async function confirmPhotoUpload(
  draftId: string,
  assetId: string,
): Promise<PhotoAsset> {
  const response = await fetch(
    `${API_URL}/drafts/${draftId}/photos/${assetId}/confirm`,
    {
      method: "POST",
      credentials: "include",
    },
  );

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response.json() as Promise<PhotoAsset>;
}

export async function uploadDraftPhoto(
  draftId: string,
  file: File,
): Promise<PhotoAsset> {
  const upload = await createPhotoUpload(draftId, file);

  await uploadPhotoToStorage(
    upload.upload_url,
    file,
  );

  return confirmPhotoUpload(
    draftId,
    upload.asset_id,
  );
}

export async function getDraftPhotos(
  draftId: string,
): Promise<PhotoAsset[]> {
  const response = await fetch(
    `${API_URL}/drafts/${draftId}/photos`,
    {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response.json() as Promise<PhotoAsset[]>;
}

type PhotoViewUrlResponse = {
  asset_id: string;
  view_url: string;
  expires_in_seconds: number;
};

export async function getPhotoViewUrl(
  draftId: string,
  assetId: string,
): Promise<PhotoViewUrlResponse> {
  const response = await fetch(
    `${API_URL}/drafts/${draftId}/photos/${assetId}/view-url`,
    {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response.json() as Promise<PhotoViewUrlResponse>;
}