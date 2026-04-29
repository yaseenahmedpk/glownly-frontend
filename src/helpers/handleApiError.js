export function handleApiError(error) {
  // Default message fallback
  const fallback = ["Something went wrong. Please try again."];

  if (!error) {
    return fallback;
  }

  if (!error.response) {
    return ["Network error. Please check your internet connection."];
  }

  const { status, data } = error.response;

  let messages = [];

  // ✅ Laravel validation (422)
  if (status === 422 && data?.errors) {
    Object.values(data.errors).forEach((fieldErrors) => {
      messages.push(...fieldErrors);
    });

    return messages.length ? messages : fallback;
  }

  // ⚠️ Only treat as error if explicitly failed
  if (status >= 500) {
    return ["Server error. Please try again later."];
  }

  // ⚠️ Only use message if it's clearly an error response
  if (data?.message && status >= 400) {
    return [data.message];
  }

  return fallback;
}
