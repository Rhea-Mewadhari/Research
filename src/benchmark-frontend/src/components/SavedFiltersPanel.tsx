import { useRef, useState } from 'react';
import { useFilterContext } from '../context/FilterContext';

export default function SavedFiltersPanel() {
  const { savedFilters, saveCurrentFilters, restoreFilter, deleteFilter } = useFilterContext();
  const [isAdding, setIsAdding] = useState(false);
  const [inputName, setInputName] = useState('');
  const [validationError, setValidationError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const openForm = () => {
    setIsAdding(true);
    // focus the input after it renders
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const handleSave = () => {
    const name = inputName.trim();
    if (!name) {
      setValidationError('Name cannot be empty');
      inputRef.current?.focus();
      return;
    }
    saveCurrentFilters(name);
    setInputName('');
    setIsAdding(false);
    setValidationError('');
  };

  const handleCancel = () => {
    setIsAdding(false);
    setInputName('');
    setValidationError('');
  };

  return (
    <div className="saved-filters-panel">
      <h3>Saved filters</h3>

      {savedFilters.length > 0 ? (
        <ul aria-label="Saved filter sets" className="saved-filters-list">
          {savedFilters.map((filter) => (
            <li key={filter.id} className="saved-filter-entry">
              <span className="saved-filter-name">{filter.name}</span>
              <button
                type="button"
                aria-label={`Restore filter set "${filter.name}"`}
                onClick={() => restoreFilter(filter.id)}
              >
                Restore
              </button>
              <button
                type="button"
                aria-label={`Delete filter set "${filter.name}"`}
                onClick={() => deleteFilter(filter.id)}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="saved-filters-empty">No saved filters.</p>
      )}

      {isAdding ? (
        <div className="save-filter-form">
          <label htmlFor="save-filter-name">Name</label>
          <input
            ref={inputRef}
            id="save-filter-name"
            type="text"
            value={inputName}
            onChange={(e) => {
              setInputName(e.target.value);
              setValidationError('');
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave();
              if (e.key === 'Escape') handleCancel();
            }}
            placeholder="Filter set name"
            aria-describedby={validationError ? 'save-filter-error' : undefined}
            aria-invalid={validationError ? 'true' : 'false'}
          />
          {validationError && (
            <span id="save-filter-error" role="alert" className="validation-error">
              {validationError}
            </span>
          )}
          <button type="button" onClick={handleSave}>
            Save
          </button>
          <button type="button" onClick={handleCancel}>
            Cancel
          </button>
        </div>
      ) : (
        <button type="button" onClick={openForm}>
          Save current
        </button>
      )}
    </div>
  );
}
