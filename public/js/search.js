let timer;
let searchInput = document.getElementById("searchinput")
let searchedUsers = document.querySelector(".searchedusers")
searchInput?.addEventListener("input", () => {
    const query = searchInput.value.trim()
    let timer;
    clearTimeout(timer)

    if (query === "") {
        searchedUsers.innerHTML = "";
        return
    }

    timer = setTimeout(async () => {
        const res = await fetch(`/search/user?q=${encodeURIComponent(query)}`)
        const user = await res.json()

        if (user.length === 0) {
            searchedUsers.innerHTML = `<p class="text-zinc-600">No User Find</p>`
        }
        else {
            searchedUsers.innerHTML = user.map(u =>
                `<div onclick="searcheduserprofile('${u._id}')" class="matcheduser w-full p-3 h-16 border-zinc-700 border flex items-center gap-5 my-2 rounded-md hover:scale-[1.02] hover:cursor-pointer">
                        <img src="${u.image}" class="w-7 h-7 rounded-full" alt="">
                        <h1>${u.username}</h1>
                </div>`
            ).join('');
        }
    }, 300);
})


async function searcheduserprofile(searcheduserid) {
    try {
        window.location.href = "/Search/" + searcheduserid;
    } catch (error) {
        console.log("No User Exists")
    }
}