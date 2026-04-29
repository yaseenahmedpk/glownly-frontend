import Swal from "sweetalert2";

export function showErrorAlert(errors) {
  let message = "";

  if (Array.isArray(errors)) {
    message = errors.join("<br>");
  } else {
    message = errors || "Something went wrong";
  }

  return Swal.fire({
    icon: "error",
    title: "Oops!",
    html: message,
    confirmButtonText: "OK",
  });
}
