const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

async function request(path, options = {}) {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {})
      },
      ...options
    });
  } catch (error) {
    throw new Error(
      "Cannot reach the backend API right now. Make sure Spring Boot is running on http://localhost:5000."
    );
  }

  if (!response.ok) {
    let message = "Something went wrong while calling the API.";
    const responseText = await response.text();

    if (responseText) {
      try {
        const errorBody = JSON.parse(responseText);
        message = errorBody.message || message;
      } catch (error) {
        message = responseText;
      }
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export function getStudents() {
  return request("/students");
}

export function createStudent(student) {
  return request("/students", {
    method: "POST",
    body: JSON.stringify(student)
  });
}

export function updateStudent(id, student) {
  return request(`/students/${id}`, {
    method: "PUT",
    body: JSON.stringify(student)
  });
}

export function deleteStudent(id) {
  return request(`/students/${id}`, {
    method: "DELETE"
  });
}
