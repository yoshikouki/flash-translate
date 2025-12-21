import { LanguageSettings } from "./components/LanguageSettings";
import { TranslationBehaviorSettings } from "./components/TranslationBehaviorSettings";
import { ExclusionSettings } from "./components/ExclusionSettings";
import { Footer } from "./components/Footer";

export default function App() {
  return (
    <div className="min-w-72 bg-white max-h-[400px] overflow-y-auto flex flex-col">
      <div className="flex-1">
        <LanguageSettings />
        <TranslationBehaviorSettings />
        <ExclusionSettings />
      </div>
      <Footer />
    </div>
  );
}
