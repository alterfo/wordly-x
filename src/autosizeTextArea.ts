export function autosizeTextArea(this: HTMLTextAreaElement) {
    const scrollLeft = window.scrollX;
    const scrollTop = window.scrollY;
    if (this) {
        this.style.overflow = 'hidden';
        this.style.height = "auto";
        this.style.height = `${Math.max(
            this.scrollHeight,
            160
        )}px`;
    }
    window.scrollTo(scrollLeft, scrollTop);
}
