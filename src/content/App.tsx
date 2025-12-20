import { useTextSelection } from "./hooks/useTextSelection";
import { TranslationCard } from "./components/TranslationCard";

export default function App() {
  const { selection, clearSelection } = useTextSelection();

  if (!selection) {
    return null;
  }

  return <TranslationCard selection={selection} onClose={clearSelection} />;
}
