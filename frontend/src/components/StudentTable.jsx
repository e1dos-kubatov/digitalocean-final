function formatDate(value) {
  if (!value) {
    return "Just now";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function gradeClassName(grade) {
  return `grade-pill grade-${(grade || "na").toLowerCase()}`;
}

export default function StudentTable({ students, isLoading, onEdit, onDelete }) {
  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Student records</p>
          <h2>Current classroom overview</h2>
        </div>
        <div className="student-count">{students.length} total</div>
      </div>

      {isLoading ? <p className="helper-text">Loading students...</p> : null}

      {!isLoading && students.length === 0 ? (
        <div className="empty-state">
          <h3>No students yet</h3>
          <p>Add the first student from the form and the list will appear here.</p>
        </div>
      ) : null}

      {!isLoading && students.length > 0 ? (
        <div className="table-shell">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Course</th>
                <th>Grade</th>
                <th>Age</th>
                <th>Email</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id}>
                  <td>
                    <strong>
                      {student.firstName} {student.lastName}
                    </strong>
                  </td>
                  <td>{student.course}</td>
                  <td>
                    <span className={gradeClassName(student.grade)}>{student.grade}</span>
                  </td>
                  <td>{student.age}</td>
                  <td>{student.email}</td>
                  <td>{formatDate(student.createdAt)}</td>
                  <td className="table-actions">
                    <button className="secondary-button" onClick={() => onEdit(student)}>
                      Edit
                    </button>
                    <button className="danger-button" onClick={() => onDelete(student.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}
