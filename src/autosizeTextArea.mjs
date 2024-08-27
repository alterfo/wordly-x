export function autosizeTextArea(newVar = this) {
    const scrollLeft = window.scrollX;
    const scrollTop = window.scrollY;
    if (newVar) {
        newVar.style.overflow = 'hidden';
        newVar.style.height = "auto";
        newVar.style.height = `${Math.max(
            newVar.scrollHeight,
            160
        )}px`;
    }
    window.scrollTo(scrollLeft, scrollTop);
}
