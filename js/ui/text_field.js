import Icons from "../icons.js";

export default class TextField {
    static create(placeholder, onValueChange) {
        const containerEl = document.createElement("div");
        containerEl.classList.add("text_field");

        const inputEl = document.createElement("input");
        inputEl.classList.add("text_field__input");
        inputEl.type = "text";
        inputEl.placeholder = placeholder;
        containerEl.appendChild(inputEl);

        const btnClearEl = document.createElement("button");
        btnClearEl.classList.add("text_field__clear");
        btnClearEl.type = "button";
        containerEl.appendChild(btnClearEl);

        const btnClearIconEl = document.createElement("div");
        btnClearIconEl.classList.add("button__icon");
        btnClearIconEl.innerHTML = Icons.clear();
        btnClearEl.appendChild(btnClearIconEl);

        btnClearEl.addEventListener("click", () => {
            inputEl.value = "";
            onValueChange(inputEl.value);
            TextField._updateBtnClearVsibility(btnClearEl, inputEl);
        });
        inputEl.addEventListener("input", () => {
            onValueChange(inputEl.value);
            TextField._updateBtnClearVsibility(btnClearEl, inputEl);
        });
        TextField._updateBtnClearVsibility(btnClearEl, inputEl);

        return {
            el: containerEl
        };
    }

    static _updateBtnClearVsibility(btnClearEl, inputEl) {
        btnClearEl.style.display = inputEl.value == "" ? "none" : "flex";
    }
}