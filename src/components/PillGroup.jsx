export default function PillGroup({ name, value, onChange, options }) {
  return (
    <fieldset className="pillgroup" style={{ border: 0, padding: 0, margin: "0 0 20px" }}>
      {options.map((opt) => (
        <label className="pill" key={opt.value}>
          <input
            type="radio"
            name={name}
            value={opt.value}
            checked={value === opt.value}
            onChange={() => onChange(opt.value)}
          />
          <span>{opt.label}</span>
        </label>
      ))}
    </fieldset>
  );
}
