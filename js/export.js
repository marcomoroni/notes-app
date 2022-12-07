export default class Export {
    static export(fileName, fileContent) {
        // Create a dummy tag that can be used to download the file.
        var dummyEl = document.createElement("a");
        dummyEl.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(fileContent));
        dummyEl.setAttribute("download", fileName);
        dummyEl.style.display = 'none';
        document.body.appendChild(dummyEl);

        dummyEl.click();

        document.body.removeChild(dummyEl);
    }
}