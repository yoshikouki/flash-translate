import { LanguageSettings } from "./components/LanguageSettings";
import { TranslationBehaviorSettings } from "./components/TranslationBehaviorSettings";
import { ExclusionSettings } from "./components/ExclusionSettings";
import { Footer } from "./components/Footer";
import { PopupHeader } from "./components/PopupHeader";

export default function App() {
  return (
    <div className="min-w-96 max-h-[400px] overflow-y-auto flex flex-col bg-white/90 backdrop-blur-sm">
      <PopupHeader />
      <div className="flex-1 divide-y divide-gray-100">
        <section className="bg-white">
          <LanguageSettings />
        </section>
        <section className="bg-gray-50/50">
          <TranslationBehaviorSettings />
        </section>
        <section className="bg-white">
          <ExclusionSettings />
        </section>
      </div>
      <Footer />
    </div>
  );
}
