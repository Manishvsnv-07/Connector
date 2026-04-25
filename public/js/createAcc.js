let uname = document.getElementById("username")
uname?.addEventListener("input", (e) => {
    const regex = /^[a-zA-Z][a-zA-Z0-9._]*[a-zA-Z0-9]$/
    if (!regex.test(e.target.value)) {
        let validusername = document.querySelector(".validusername")
        validusername.classList.remove("hidden")
        validusername.classList.remove("text-zinc-500")
        validusername.classList.add("text-red-500")
        validusername.innerHTML = `In Special Characters Use Only <span class="text-zinc-300">.</span> or <span
                        class="text-zinc-300">_</span> (e.g. creator_07)`
    }
    if (regex.test(e.target.value)) {
        let validusername = document.querySelector(".validusername")
        validusername.classList.remove("hidden")
        validusername.classList.add("text-zinc-500")
        validusername.textContent = "Valid Syntax Username ✔️"
        validusername.classList.remove("text-red-500")
    }
})

let backindex = document.querySelector(".backindex")
backindex?.addEventListener("click", () => {
    window.location.href = "/"
})
let lgbackindex = document.querySelector(".lgbackindex")
lgbackindex?.addEventListener("click", () => {
    window.location.href = "/mobilestart"
})

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



let sendotp = document.querySelector(".sendotp")
let username1 = false;
let name1 = false;
let email1 = false;
let password1 = false;

function checkall() {
    if (username1 && name1 && email1 && password1) {
        sendotp.classList.remove("hidden")
    }
    else {
        sendotp.classList.add("hidden")
    }
}
document.getElementById("name")?.addEventListener("input", () => {
    name1 = true;
    checkall()
})
document.getElementById("email")?.addEventListener("input", () => {
    email1 = true;
    checkall()
})
document.getElementById("password")?.addEventListener("input", () => {
    password1 = true;
    checkall()
})
document.getElementById("username")?.addEventListener("input", () => {
    username1 = true;
    checkall()
})

sendotp?.addEventListener("click", async () => {
    try {     
        const name = document.getElementById("name").value;
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const username = document.getElementById("username").value;
        sendotp.textContent = "Verifying..."
        const res = await fetch("/sendotp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, username, password, email })
        })
        const data = await res.json();
        if (res.ok) {
            let verifyotp = document.querySelector(".verifyotp")
            let dataform = document.querySelector(".dataform")
            let logo3 = document.querySelector(".logo3")
            let logo2 = document.querySelector(".logo2")
            let main = document.querySelector(".main")
            verifyotp.classList.remove("hidden")
            dataform.classList.add("hidden")
            logo2.classList.add("hidden")
            logo3.classList.remove("hidden")
            main.classList.remove("bg-[url('/images/logo2.png')]")
            main.classList.add("bg-[url('/images/logo3.png')]")
        }
        if (!res.ok) {
            const errorDiv = document.getElementById("errorMsg");
            errorDiv.textContent = data.message;
            errorDiv.classList.remove("hidden");
    
            setTimeout(() => {
                errorDiv.classList.add("hidden");
                sendotp.textContent = "Verify"
            }, 3000);
            return;
        }
    } catch (error) {
        return window.location.hrer = "/error"
    }
})


let verifybtn = document.querySelector(".verifybtn")
verifybtn?.addEventListener("click", async () => {
    const otp = document.getElementById("otp").value
    const response = await fetch("/create/account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp })
    })
    const data = await response.json();
    if (response.ok) {
        window.location.href = "/home"
    }
    else {
        const errorDiv = document.getElementById("errorMsg");
        errorDiv.textContent = data.message;
        errorDiv.classList.remove("hidden");

        setTimeout(() => {
            errorDiv.classList.add("hidden");
        }, 3000);
    }
})



let backcreate = document.querySelector(".backcreate")
backcreate?.addEventListener("click", () => {
    window.location.href = "/create"
})