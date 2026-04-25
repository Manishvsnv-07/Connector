let file = document.getElementById("fileInputatprofile");
let profileimg = document.getElementById("previewimgatprofile");

if (file && profileimg) {
    file.addEventListener("change", () => {
        let img = file.files[0];

        if (img) {
            let reader = new FileReader();
            reader.onload = function (e) {
                profileimg.setAttribute("src", e.target.result)
            };
            reader.readAsDataURL(img);
        }
        else {
            profileimg.setAttribute("src", "")
        }

    });
}

let disconnect = document.querySelector(".disconnect")
let dissure = document.querySelector(".dissure")
let canceldisconnect = document.querySelector(".canceldisconnect")
disconnect?.addEventListener("click", () => {
    dissure.classList.remove("hidden")
    canceldisconnect?.addEventListener("click", () => {
        dissure.classList.add("hidden")
    })
})


let logoutbtn = document.querySelector(".logoutbtn")
let logoutsure = document.querySelector(".logoutsure")
let cancellogout = document.querySelector(".cancellogout")
logoutbtn?.addEventListener("click", () => {
    logoutsure.classList.remove("hidden")
    cancellogout?.addEventListener("click", () => {
        logoutsure.classList.add("hidden")
    })
})