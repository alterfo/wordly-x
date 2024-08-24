export function getWordCount(text: string): number { // оптимизировано и идемпотентно
    const wordsArr = text.trim().split(/[\s,.;]+/);
    for (let i = 0; i < wordsArr.length; i++) {
        if (wordsArr[i] === '') wordsArr.splice(i, 1) && i--;
    }
    return wordsArr.length;
}
