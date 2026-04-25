let removeFollowerTab = document.getElementById("removeFollowerTab")
let followersTab = document.querySelector(".followersTab")
let followers = document.querySelector(".followers")
let removeFollowingTab = document.getElementById("removeFollowingTab")
let followingTab = document.querySelector(".followingTab")
let following = document.querySelector(".following")

followers?.addEventListener("click", () => {
    followingTab.classList.add("hidden")
    followersTab.classList.remove("hidden")
})
removeFollowerTab?.addEventListener("click", () => {
    followersTab.classList.add("hidden")
})


following?.addEventListener("click", () => {
    followersTab.classList.add("hidden")
    followingTab.classList.remove("hidden")
})
removeFollowingTab?.addEventListener("click", () => {
    followingTab.classList.add("hidden")
})


async function removefollower(userid){
    let followyou = document.getElementById(`followyou-${userid}`)
    const res = await fetch("/removeFollower/"+userid,{
        method:"POST",
        headers:{"Content-Types":"application/json"},
        credentials:"include"
    })
    let data = await res.json()
    if(data.success){
        followyou.classList.add("hidden")
    }
    else{
        const errorDiv = document.getElementById("errorMsg");
        const te = document.querySelector(".te");
        te.textContent = "Something Went Wrong";
        errorDiv.classList.remove("hidden");

        setTimeout(() => {
            errorDiv.classList.add("hidden");
            window.location.href= "/profile"
        }, 1500);
        return;
    }
}

async function removefollowing(userid){
    let youfollow = document.getElementById(`youfollow-${userid}`)
    const res = await fetch("/removeFollowing/"+userid,{
        method:"POST",
        headers:{"Content-Types":"application/json"},
        credentials:"include"
    })
    let data = await res.json()
    if(data.success){
        youfollow.classList.add("hidden")
    }
    else{
        const errorDiv = document.getElementById("errorMsg");
        const te = document.querySelector(".te");
        te.textContent = "Something Went Wrong";
        errorDiv.classList.remove("hidden");

        setTimeout(() => {
            errorDiv.classList.add("hidden");
            window.location.href= "/profile"
        }, 1500);
        return;
    }
}

async function searcheduserprofile(searcheduserid) {
    const res = await fetch("/Search/" + searcheduserid, { method: "GET", credentials: "include" })
    if (res.type === "opaqueredirect") {
        window.location.href = "/home"
    }
    else {
        const html = await res.text()
        document.body.innerHTML = html;
    }
}