import { LanguageSettings } from "./components/LanguageSettings";
import { TranslationBehaviorSettings } from "./components/TranslationBehaviorSettings";
import { ExclusionSettings } from "./components/ExclusionSettings";

export default function App() {
  return (
    <div className="min-w-72 bg-white max-h-[400px] overflow-y-auto">
      <LanguageSettings />
      <TranslationBehaviorSettings />
      <ExclusionSettings />
    </div>
  );
}
