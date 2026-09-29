import { useStore } from "../lib/store";
import PillGroup from "../components/PillGroup";

// Comfort settings: theme, text size, ruled lines, thought-prompt frequency.
// See FEATURES_AND_FLOWS.md §9.
export default function SettingsPage() {
  const { state, actions } = useStore();
  const c = state.comfort;
  return (
    <div className="card" style={{ maxWidth: 640 }}>
      <h3 style={{ marginTop: 0 }}>Page</h3>
      <PillGroup
        name="theme"
        value={c.theme}
        onChange={(v) => actions.setComfort("theme", v)}
        options={[
          { value: "auto", label: "Match my device" },
          { value: "light", label: "Day" },
          { value: "dark", label: "Night" },
        ]}
      />
      <h3>Text size</h3>
      <PillGroup
        name="textSize"
        value={c.textSize}
        onChange={(v) => actions.setComfort("textSize", v)}
        options={[
          { value: "regular", label: "Regular" },
          { value: "large", label: "Large" },
        ]}
      />
      <h3>Ruled lines</h3>
      <PillGroup
        name="ruledLines"
        value={c.ruledLines ? "on" : "off"}
        onChange={(v) => actions.setComfort("ruledLines", v === "on")}
        options={[
          { value: "on", label: "Show lines" },
          { value: "off", label: "Plain paper" },
        ]}
      />
      <h3>Thought prompts about your partner</h3>
      <PillGroup
        name="thoughtFrequency"
        value={c.thoughtFrequency}
        onChange={(v) => actions.setComfort("thoughtFrequency", v)}
        options={[
          { value: "occasional", label: "Occasional" },
          { value: "rare", label: "Rare" },
          { value: "off", label: "Off" },
        ]}
      />
    </div>
  );
}
