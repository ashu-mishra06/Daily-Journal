export default function Button({ variant = "secondary", children, ...rest }) {
  const cls = {
    primary: "btn btn-primary",
    secondary: "btn",
    quiet: "btn btn-quiet",
    danger: "btn btn-danger",
  }[variant] || "btn";
  return (
    <button className={cls} type={rest.type || "button"} {...rest}>
      {children}
    </button>
  );
}
