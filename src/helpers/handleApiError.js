export function handleApiError(error,t) {
  // Default message fallback
  const fallback = [t("something_went_wrong")];

  if (!error) {
    return fallback;
  }

  if (!error.response) {
    return [t("network_error")];
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
    return [t("server_error")];
  }

  // ⚠️ Only use message if it's clearly an error response
  if (data?.message && status >= 400) {
    return [t(data.message)];
  }

  return fallback;
}
