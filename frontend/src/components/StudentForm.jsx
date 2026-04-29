const gradeOptions = ["A", "B", "C", "D", "F"];

export default function StudentForm({
  formState,
  isEditing,
  isSubmitting,
  onChange,
  onSubmit,
  onCancel
}) {
  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">{isEditing ? "Update record" : "Add student"}</p>
          <h2>{isEditing ? "Edit student details" : "Create a new student card"}</h2>
        </div>
      </div>

      <form className="student-form" onSubmit={onSubmit}>
        <label>
          First Name
          <input
            name="firstName"
            value={formState.firstName}
            onChange={onChange}
            placeholder="Aigerim"
            required
          />
        </label>

        <label>
          Last Name
          <input
            name="lastName"
            value={formState.lastName}
            onChange={onChange}
            placeholder="Sydykova"
            required
          />
        </label>

        <label>
          Email
          <input
            type="email"
            name="email"
            value={formState.email}
            onChange={onChange}
            placeholder="student@example.com"
            required
          />
        </label>

        <label>
          Age
          <input
            type="number"
            name="age"
            min="1"
            max="120"
            value={formState.age}
            onChange={onChange}
            placeholder="19"
            required
          />
        </label>

        <label>
          Course
          <input
            name="course"
            value={formState.course}
            onChange={onChange}
            placeholder="Computer Networks"
            required
          />
        </label>

        <label>
          Grade
          <select name="grade" value={formState.grade} onChange={onChange} required>
            <option value="">Select grade</option>
            {gradeOptions.map((grade) => (
              <option key={grade} value={grade}>
                {grade}
              </option>
            ))}
          </select>
        </label>

        <div className="form-actions">
          <button className="primary-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : isEditing ? "Update Student" : "Add Student"}
          </button>
          {isEditing ? (
            <button className="secondary-button" type="button" onClick={onCancel}>
              Cancel
            </button>
          ) : null}
        </div>
      </form>
    </section>
  );
}
