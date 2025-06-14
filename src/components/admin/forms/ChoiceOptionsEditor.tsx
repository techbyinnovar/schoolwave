import React from 'react';

interface ChoiceOptionsEditorProps {
  options: string[];
  setOptions: (opts: string[]) => void;
  multiple?: boolean;
}

export default function ChoiceOptionsEditor({ options, setOptions, multiple }: ChoiceOptionsEditorProps) {
  function handleOptionChange(idx: number, value: string) {
    setOptions(options.map((opt, i) => (i === idx ? value : opt)));
  }
  function addOption() {
    setOptions([...options, '']);
  }
  function removeOption(idx: number) {
    setOptions(options.filter((_, i) => i !== idx));
  }
  return (
    <div className="space-y-2 mt-2">
      <div className="font-medium text-sm mb-1">{multiple ? 'Checkbox Options' : 'Radio Options'}</div>
      {options.map((opt, idx) => (
        <div key={idx} className="flex gap-2 items-center">
          <input
            className="input input-bordered flex-1"
            placeholder={`Option ${idx + 1}`}
            value={opt}
            onChange={e => handleOptionChange(idx, e.target.value)}
          />
          <button type="button" className="btn btn-xs btn-error" onClick={() => removeOption(idx)} disabled={options.length <= 1}>Remove</button>
        </div>
      ))}
      <button type="button" className="btn btn-xs btn-outline mt-1" onClick={addOption}>Add Option</button>
    </div>
  );
}
