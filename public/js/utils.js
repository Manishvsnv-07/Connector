async function sendcomment(commentid, nameofuser, userid) {
    let textarea = document.getElementById(`comment-${commentid}`)
    let comment = textarea.value
    const res = await fetch("/send/" + commentid, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment, nameofuser, userid })
    })
    let data = await res.json();
    if(data.success){
        let commentcount = document.querySelector(`.commentcount[data-id = "${commentid}"]`)
        commentcount.innerText = data.comments
        textarea.value = ""
        let cbox = document.querySelector(`.userscommentbox[data-id="${commentid}"]`)
        const cb = document.createElement('div')
        cb.className = "eachcomment border flex flex-col overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden border-zinc-700 w-full shrink-0 max-h-[15vh]"
        cb.innerHTML = `<div class="ucomment-${data.cid} flex justify-start items-start gap-2 px-3 py-2">
                                                <h1 class="nameofuser text-blue-600 shrink-0">
                                                    ${nameofuser}
                                                </h1>
                                                <p class="usercomment wrap-break-word">
                                                    ${comment}
                                                </p>
                                            </div>
                                            
                                            <div class="reply px-3 py-2">
                                                <div class="flex items-center gap-2">
                                                    <textarea name="reply" id="reply-${data.cid}" placeholder="Reply" class="replybox resize-none w-full rounde-md h-11 border border-zinc-700 px-2"></textarea>
                                                    <img src="/images/send.svg" onclick="reply('${commentid}','${data.cid}','${nameofuser}')" class="w-7 h-7 outline-none rounded-full bg-white border-white border" alt="">
                                                </div>
                                            </div>`
        cbox.prepend(cb)
    }

}

async function followuser(followeduser, btn) {
    const res = await fetch("/follow/" + followeduser, {
        method: "POST",
        credentials: 'include',
        headers: {
            "Content-Type": "application/json"
        },
    })

    const data = await res.json();
    if (data.following) {
        btn.textContent = "Unfollow"
        btn.className = "px-2 bg-transparent border border-zinc-700 rounded-md font-semibold text-white hover:scale-[1.07] hover:cursor-pointer"
    }
    else {
        btn.textContent = "Follow"
        btn.className = "px-2 bg-transparent border border-zinc-700 rounded-md font-semibold text-white hover:scale-[1.07] hover:cursor-pointer"
    }
}


async function reply(postid,commentid,username) {
    let textarea = document.getElementById(`reply-${commentid}`)
    let reply = textarea.value
    const response = await fetch(`/reply/${postid}/${commentid}`,{
        "method":"POST",
        headers:{"Content-Type":"application/json"},
        credentials:"include",
        body:JSON.stringify({reply})
    })
    let data = await response.json()
    if(data.success){
        textarea.value = "";
        let ucomment = document.querySelector(`.ucomment-${commentid}`)
        let rp = document.createElement('div');
        rp.className = `flex gap-2 px-3 py-2 h-7 w-full items-center`
        rp.innerHTML = `<h1 class="text-blue-500">→ ${username}</h1>
                                                    <p>${reply}</p>`
        ucomment.insertAdjacentElement("afterend",rp)
    }
}

async function likepost(postlikeid) {
    await fetch("/like/" + postlikeid, {
        credentials: 'include',
        method: "GET"
    }).then(res => res.json()).then(data => {
        let likecount = document.querySelector(`.likecount[data-id = "${postlikeid}"]`)
        likecount.innerText = data.likes;
    })

    let liked = document.querySelector(`.liked[data-id= "${postlikeid}"]`)
    let unliked = document.querySelector(`.unliked[data-id = "${postlikeid}"`)

    liked.classList.toggle("hidden")
    unliked.classList.toggle("hidden")

}

function openbox(coid) {
    let commentbox = document.getElementById(`commentbox-${coid}`)
    let l = document.getElementById(`userinteract-${coid}`)
    let back = document.querySelector(`.backcomment-${coid}`)
    commentbox.classList.remove("hidden")
    l.classList.add("hidden")
    back?.addEventListener("click", () => {
        l.classList.remove("hidden")
        commentbox.classList.add("hidden")
    })
}

function opensol(soid) {
    let solbox = document.getElementById(`solbox-${soid}`)
    let l = document.getElementById(`userinteract-${soid}`)
    let back = document.getElementById(`backsol-${soid}`)
    solbox.classList.remove("hidden")
    l.classList.add("hidden")
    back?.addEventListener("click", () => {
        l.classList.remove("hidden")
        solbox.classList.add("hidden")
    })
}