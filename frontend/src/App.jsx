import { useEffect, useState } from "react";
import {
  createStudent,
  deleteStudent,
  getStudents,
  updateStudent
} from "./api/studentApi";
import StudentForm from "./components/StudentForm";
import StudentTable from "./components/StudentTable";

const emptyForm = {
  firstName: "",
  lastName: "",
  email: "",
  age: "",
  course: "",
  grade: ""
};

function normalizeStudents(students) {
  return [...students].sort(
    (left, right) => new Date(right.createdAt || 0) - new Date(left.createdAt || 0)
  );
}

export default function App() {
  const [students, setStudents] = useState([]);
  const [formState, setFormState] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadStudents() {
    setIsLoading(true);
    setError("");

    try {
      const data = await getStudents();
      setStudents(normalizeStudents(data));
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadStudents();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormState((currentState) => ({
      ...currentState,
      [name]: value
    }));
  }

  function resetForm() {
    setFormState(emptyForm);
    setEditingId(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");
    setMessage("");

    const payload = {
      ...formState,
      age: Number(formState.age)
    };

    try {
      if (editingId) {
        await updateStudent(editingId, payload);
        setMessage("Student updated successfully.");
      } else {
        await createStudent(payload);
        setMessage("Student added successfully.");
      }

      resetForm();
      await loadStudents();
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleEdit(student) {
    setEditingId(student.id);
    setFormState({
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email,
      age: String(student.age),
      course: student.course,
      grade: student.grade
    });
    setMessage("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(id) {
    const shouldDelete = window.confirm("Delete this student record?");

    if (!shouldDelete) {
      return;
    }

    setError("");
    setMessage("");

    try {
      await deleteStudent(id);
      setMessage("Student deleted successfully.");
      if (editingId === id) {
        resetForm();
      }
      await loadStudents();
    } catch (deleteError) {
      setError(deleteError.message);
    }
  }

  return (
    <div className="app-shell">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">StudentTracker</p>
          <h1>Keep student records tidy, visible, and easy to update.</h1>
          <p className="hero-text">
            This lightweight dashboard helps you manage a classroom list with fast CRUD
            actions, a clean student table, and beginner-friendly full-stack structure.
          </p>
        </div>
        <div className="hero-stats panel">
          <div className="stat-card">
            <span className="stat-label">Total Students</span>
            <strong>{students.length}</strong>
          </div>
          <div className="stat-card">
            <span className="stat-label">API Base URL</span>
            <strong>{import.meta.env.VITE_API_URL || "/api"}</strong>
          </div>
          <div className="stat-card">
            <span className="stat-label">Mode</span>
            <strong>{editingId ? "Editing" : "Ready"}</strong>
          </div>
        </div>
      </section>

      {message ? <div className="status-banner success-banner">{message}</div> : null}
      {error ? <div className="status-banner error-banner">{error}</div> : null}

      <main className="content-grid">
        <StudentForm
          formState={formState}
          isEditing={Boolean(editingId)}
          isSubmitting={isSubmitting}
          onChange={handleChange}
          onSubmit={handleSubmit}
          onCancel={resetForm}
        />
        <StudentTable
          students={students}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </main>
    </div>
  );
}
