let dbtn = document.querySelector(".deletebtn")
let deletebox = document.querySelector(".deletepopup")
dbtn?.addEventListener("click", () => {
    deletebox?.classList.toggle("hidden")
})
let canceldelete = document.querySelector(".cancel")
canceldelete?.addEventListener("click", (req, res) => {
    deletebox?.classList.toggle("hidden")
})


let edit = document.querySelector(".edit")
let editpostbtn = document.querySelector(".editpost")
let close = document.getElementById("close")
edit?.addEventListener("click", () => {
    editpostbtn?.classList.remove("hidden")
    close?.addEventListener("click", () => {
        editpostbtn.classList.add("hidden")
    })
})

let playsound = document.querySelector(".playsound")
let videoplay = document.querySelector(".videoplay")
playsound?.addEventListener("click",()=>{
    if(videoplay.muted){
        videoplay.muted = false;
        playsound.src = "/images/playsound.svg"
    }
    else{
        videoplay.muted = true;
        playsound.src = "/images/offsound.svg"
    }
})

function postdescription(pid) {
    let description = document.getElementById(`postdescription-${pid}`)
    description.classList.toggle("line-clamp-2")
    description.classList.toggle("overflow-y-scroll")
    description.classList.toggle("[scrollbar-width:none]")
    description.classList.toggle("[-ms-overflow-style:none]")
    description.classList.toggle("[&::-webkit-scrollbar]:hidden")
    description.classList.toggle("font-thin")
}


async function editpost(mypostid) {
    let udescription = document.getElementById("udescription").value
    if (!udescription) {
        const errorDiv = document.getElementById("errorMsg");
        const te = document.querySelector(".te");
        te.textContent = "Empty Not Allowed ✕";
        errorDiv.classList.remove("hidden");

        setTimeout(() => {
            errorDiv.classList.add("hidden");
        }, 1500);
        return;
    }
    const res = await fetch("/updatepost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ mypostid, udescription })
    })
    let data = await res.json();
    if (data.success) {
        const successMsg = document.getElementById("successMsg");
        const ts = document.querySelector(".ts");
        ts.textContent = "Post Updated ✓";
        successMsg.classList.remove("hidden");

        setTimeout(() => {
            successMsg.classList.add("hidden");
            window.location.href = `/profile/viewpost/${mypostid}`
        }, 1500);
    }
    else {
        const errorDiv = document.getElementById("errorMsg");
        const te = document.querySelector(".te");
        te.textContent = "Update Failed ✕";
        errorDiv.classList.remove("hidden");

        setTimeout(() => {
            errorDiv.classList.add("hidden");
        }, 1500);
        return;
    }
}
