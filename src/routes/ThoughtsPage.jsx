import ThoughtCard from "../components/ThoughtCard";

export default function ThoughtsPage({ goTo }) {
  return (
    <div className="card">
      <ThoughtCard onGoToLinking={() => goTo("link")} />
    </div>
  );
}
