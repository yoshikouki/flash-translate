import { LanguageSettings } from "./components/LanguageSettings";
import { ExclusionSettings } from "./components/ExclusionSettings";

export default function App() {
  return (
    <div className="min-w-72 bg-white max-h-[400px] overflow-y-auto">
      <LanguageSettings />
      <ExclusionSettings />
    </div>
  );
}
