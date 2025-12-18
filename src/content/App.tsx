import { useTextSelection } from "./hooks/useTextSelection";
import { TranslationPopup } from "./components/TranslationPopup";

export default function App() {
  const { selection, clearSelection } = useTextSelection();

  if (!selection) {
    return null;
  }

  return <TranslationPopup selection={selection} onClose={clearSelection} />;
}
