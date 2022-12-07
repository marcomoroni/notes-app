export default class ScrollLine {
    static bind(lineEl, scrollableEl) {
        scrollableEl.addEventListener("scroll", () => {
            const lineShouldBeVisible = scrollableEl.scrollTop > 0;
            if (lineShouldBeVisible) {
                lineEl.classList.add("line__visible");
            }
            else {
                lineEl.classList.remove("line__visible");
            }
        })
    }
}