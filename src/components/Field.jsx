export default function Field({ label, as = "input", error, hint, ...rest }) {
  const Tag = as;
  return (
    <label className={"field" + (error ? " err" : "")}>
      <span>{label}</span>
      <Tag {...rest} />
      {hint && <p className="sub" style={{ margin: "4px 0 0" }}>{hint}</p>}
    </label>
  );
}
