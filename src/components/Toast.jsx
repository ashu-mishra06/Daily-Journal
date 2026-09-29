import { useStore } from "../lib/store";

export default function Toast() {
  const { toastMsg } = useStore();
  return (
    <div className={"toast" + (toastMsg ? " show" : "")} role="status" aria-live="polite">
      {toastMsg}
    </div>
  );
}
