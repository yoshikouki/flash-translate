import iconUrl from "/icons/icon-32.png";

export function PopupHeader() {
  return (
    <header className="flex items-center gap-2 px-3 py-2.5 border-b border-gray-100 bg-white">
      <img src={iconUrl} alt="" className="w-5 h-5" />
      <span className="text-sm font-medium text-gray-800">Flash Translate</span>
    </header>
  );
}
