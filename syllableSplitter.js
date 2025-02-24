export function initializeSyllableSplitter() {
    const syllableButton = document.getElementById("syllableButton");

    syllableButton.addEventListener("click", () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                function: () => {
                    function breakIntoSyllables(word) {
                        const wordEndingRule = /(?<=ck)(?=le)|(?=\w(?<![aeiou]|ck)le)/g;
                        const consonantRule = /(?<=[aeiouy]\w?)(?=\w(?<!sh|ch|th|wh|ck|ph|ng)[aeiouy])/g;

                        const [mainWord, wordEnding] = word.split(wordEndingRule);
                        const syllables = mainWord.split(consonantRule);
                        if (wordEnding) syllables.push(wordEnding);

                        return syllables;
                    }

                    const selection = window.getSelection();
                    if (selection.rangeCount > 0) {
                        const range = selection.getRangeAt(0);
                        const selectedText = selection.toString().trim();

                        if (selectedText) {
                            const words = selectedText.split(/\s+/); // Split by spaces
                            const syllableWords = words.map(word => breakIntoSyllables(word).join("-"));
                            const syllableText = syllableWords.join(" ");

                            range.deleteContents();
                            range.insertNode(document.createTextNode(syllableText));
                        }
                    }
                }
            });
        });
    });
}