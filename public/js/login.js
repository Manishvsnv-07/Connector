document.querySelector("form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.querySelector("input[name='username']").value;
    const password = document.querySelector("input[name='password']").value;

    const res = await fetch("/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    });

    const data = await res.json();
    if (data.success) {
        window.location.href = "/home";
    } else {
        const errorDiv = document.getElementById("errorMsg");
        const te = document.querySelector(".te");
        te.textContent = data.message;
        errorDiv.classList.remove("hidden");
        setTimeout(() => {
            errorDiv.classList.add("hidden");
        }, 1500);
        return;
    }
});


let toggleviewoff = document.getElementById("toggleviewoff")
let toggleviewon = document.getElementById("toggleviewon")
let inputpassword = document.getElementById("password")
toggleviewoff?.addEventListener("click", () => {
    inputpassword.type = "text"
    toggleviewon.classList.remove("hidden")
    toggleviewoff.classList.add("hidden")
})
toggleviewon?.addEventListener("click", () => {
    inputpassword.type = "password"
    toggleviewon.classList.add("hidden")
    toggleviewoff.classList.remove("hidden")
})