import iconUrl from "/icons/icon-32.png";

export function PopupHeader() {
  return (
    <header className="flex items-center gap-2 border-gray-100 border-b bg-white px-3 py-2.5">
      <img alt="" className="h-5 w-5" height={20} src={iconUrl} width={20} />
      <span className="font-medium text-gray-800 text-sm">Flash Translate</span>
    </header>
  );
}
