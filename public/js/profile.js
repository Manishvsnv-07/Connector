let removeFollowerTab = document.getElementById("removeFollowerTab")
let followersTab = document.querySelector(".followersTab")
let followers = document.querySelector(".followers")
let removeFollowingTab = document.getElementById("removeFollowingTab")
let followingTab = document.querySelector(".followingTab")
let following = document.querySelector(".following")

console.log({
    removeFollowerTab: document.getElementById("removeFollowerTab"),
    followersTab: document.querySelector(".followersTab"),
    followers: document.querySelector(".followers"),
    removeFollowingTab: document.getElementById("removeFollowingTab"),
    followingTab: document.querySelector(".followingTab"),
    following: document.querySelector(".following")
})

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


let bio = document.getElementById("bio")
if(bio){
    bio?.addEventListener("click",()=>{
        bio.classList.toggle("line-clamp-1")
    })
}


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

function searcheduserprofile(searcheduserid) {
     window.location.href = "/Search/" + searcheduserid;
}