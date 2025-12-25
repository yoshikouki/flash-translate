import { ExclusionSettings } from "./components/ExclusionSettings";
import { Footer } from "./components/Footer";
import { LanguageSettings } from "./components/LanguageSettings";
import { PopupHeader } from "./components/PopupHeader";
import { TranslationBehaviorSettings } from "./components/TranslationBehaviorSettings";

export default function App() {
  return (
    <div className="flex max-h-[400px] min-w-96 flex-col overflow-y-auto bg-white/90 backdrop-blur-sm">
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
