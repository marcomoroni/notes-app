export default class Search {
    static needleShouldBeIgnored(needle) {
        return /^\s*$/.test(needle);
    }

    // ---- it should be ALL words in any combination (not ANY of the words)
    static search(needle, haystack) {
        var result = [];

        // Replace the " "s with "|" so that we can find every word individually.
        // The filter is to fix situations like this: "f " will be split into ["f", ""], and
        // "" is not a desired string.
        const words = needle.split(" ").filter(word => word != "");

        const pattern = new RegExp(words.join("|"), "gim");

        const match = haystack.match(pattern);
        const matchCount = match != null ? match.length : 0;

        for (let i = 0; i < matchCount; i++) {
            // Keep calling `exec()` to find every match.
            const execResult = pattern.exec(haystack);

            const firstCharIndex = execResult.index;
            // `[0]` is the matching string.
            const charCount = execResult[0].length;

            result.push({
                firstCharIndex: firstCharIndex,
                charCount: charCount,
            });
        }

        return result;
    }
}