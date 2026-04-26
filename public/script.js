document.addEventListener("DOMContentLoaded", () => {

    let musicon = false;
    let videoplay = document.querySelectorAll(".videoplay")
    let soundon = document.querySelectorAll(".playsound")
    let playicon = document.querySelectorAll(".play")
    videoplay.forEach(v => {
        v.addEventListener("click", () => {
            if (v.paused) {
                v.play()
                playicon.forEach(p => {
                    p.classList.add("hidden")
                })
            }
            else {
                v.pause()
                playicon.forEach(p => {
                    p.classList.remove("hidden")
                })
            }
        })
    })
    soundon.forEach((sound) =>
        sound.addEventListener("click", () => {
            if (musicon == false) {
                soundon.forEach((sound) => {
                    sound.setAttribute("src", "/images/playsound.svg")
                })
                musicon = true;
                videoplay.forEach(video => {
                    let rect = video.getBoundingClientRect();
                    let inView = (rect.top >= 0 && rect.top <= window.innerHeight) ||   // top visible
                        (rect.bottom >= 0 && rect.bottom <= window.innerHeight) || // bottom visible
                        (rect.top <= 0 && rect.bottom >= window.innerHeight);

                    if (inView) {
                        video.muted = false;
                    }
                });
            }
            else {
                soundon.forEach((sound) => {
                    sound.setAttribute("src", "/images/offsound.svg")
                })
                musicon = false;
                videoplay.forEach((video) => {
                    let rect = video.getBoundingClientRect();
                    let inview = (rect.top >= 0 && rect.top <= window.innerHeight) ||   // top visible
                        (rect.bottom >= 0 && rect.bottom <= window.innerHeight) || // bottom visible
                        (rect.top <= 0 && rect.bottom >= window.innerHeight);

                    if (inview) {
                        video.muted = true;
                    }
                })
            }
        })
    )
    const viewedVideos = new WeakSet();
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            let video = entry.target;
            if (entry.isIntersecting) {

                video.play()
                playicon.forEach(p => {
                    p.classList.add("hidden")
                })
                if (video.tagName === "VIDEO") {
                    if (!viewedVideos.has(video)) {
                        viewedVideos.add(video)
                        const scheduleView = () => {
                            let t = (video.duration * 30) / 100
                            let view = Math.round(t)
                            setTimeout(() => {
                                let postid = video.dataset.id;
                                fetch("/view/" + postid,
                                    {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json" }
                                    })
                            }, view * 1000);
                        }

                        if (video.duration && !isNaN(video.duration)) {
                            scheduleView();
                        } else {
                            video.addEventListener("loadedmetadata", scheduleView, { once: true });
                        }
                    }
                }

                if (musicon) {
                    video.muted = false;
                }
                else {
                    video.muted = true;
                }
            }
            else {
                video.pause();
                video.muted = true;
            }

        })
    }, { threshold: 0.5 })

    videoplay.forEach(video => {
        observer.observe(video)
    })

    let viewedPosts = new WeakSet()
    let postsimg = document.querySelectorAll(".postsimg")
    const imgobserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            const el = entry.target;
            if (el.tagName === "IMG") {
                if (!viewedPosts.has(el)) {
                    viewedPosts.add(el)
                    let postid = el.dataset.id;
                    fetch("/view/" + postid,
                        {
                            method: "POST",
                            headers: { "Content-Type": "application/json" }
                        })
                }
            }
        })
    }, { threshold: 0.5 })

    postsimg.forEach(img => {
        imgobserver.observe(img)
    })

    let currentIndex = 0;
    const videos = document.querySelectorAll('.videoposts');
    const feed = document.querySelector(".vfeed")
    let isScrolling = false; // prevents rapid firing

    async function goToVideo(index) {
        if (index < 0 || index >= videos.length) return;

        // Pause previous video
        const prevVideo = videos[currentIndex].querySelector('video');
        if (prevVideo) {
            prevVideo.pause();
            prevVideo.currentTime = 0
        }
        currentIndex = index;

        // Scroll to new video
        videos[currentIndex].scrollIntoView({ behavior: 'smooth' });

        // Play new video
        const nextVideo = videos[currentIndex].querySelector('video');
        if (nextVideo) {
            try {
                await nextVideo.play();
            } catch (err) {
                if (err.name !== 'AbortError') {
                    console.error(err);
                }
            }
        }
    }

    feed?.addEventListener('wheel', (e) => {
        e.preventDefault();
        if (isScrolling) return; // debounce
        isScrolling = true;

        if (e.deltaY > 0) {
            goToVideo(currentIndex + 1); // scroll down → next
        } else {
            goToVideo(currentIndex - 1); // scroll up → previous
        }

        setTimeout(() => {
            isScrolling = false;
        }, 800); // cooldown in ms

    }, { passive: false });





});


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

async function likevpost(userid) {
    await fetch("/like/" + userid, {
        credentials: 'include',
        method: "GET"
    }).then(res => res.json()).then(data => {
        let likecount = document.querySelector(`.likevcount[data-id = "${userid}"]`)
        likecount.innerText = data.likes;
    })

    let liked = document.querySelector(`.likedv[data-id= "${userid}"]`)
    let unliked = document.querySelector(`.unlikedv[data-id = "${userid}"`)

    liked.classList.toggle("hidden")
    unliked.classList.toggle("hidden")

}

function vopenbox(coid) {
    let commentbox = document.getElementById(`commentbox-${coid}`)
    let vallcommentbox = document.querySelectorAll(".commentbox")
    let l = document.getElementById(`userinteract-${coid}`)
    let back = document.querySelector(`.vbackcomment-${coid}`)
    commentbox.classList.remove("hidden")
    l.classList.add("hidden")
    back?.addEventListener("click", () => {
        l.classList.remove("hidden")
        commentbox.classList.add("hidden")
    })
}


function openbox(coid) {
    let commentbox = document.getElementById(`commentbox-${coid}`)
    let l = document.getElementById(`userinteract-${coid}`)
    let back = document.querySelector(`.backcomment-${coid}`)
    commentbox.classList.remove("hidden")
    l.classList.add("hidden")
    commentbox.addEventListener("wheel", () => {
        commentbox.classList.add("hidden")
    })
    back?.addEventListener("click", () => {
        l.classList.remove("hidden")
        commentbox.classList.add("hidden")
    })
}

async function sendcomment(commentid, nameofuser, userid) {
    let textarea = document.getElementById(`comment-${commentid}`)
    let comment = textarea.value
    const res = await fetch("/send/" + commentid, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment, nameofuser, userid })
    })
    let data = await res.json();
    if (data.success) {
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
                                                    <img src="images/send.svg" onclick="reply('${commentid}','${data.cid}','${nameofuser}')" class="w-7 h-7 outline-none rounded-full bg-white border-white border" alt="">
                                                </div>
                                            </div>`
        cbox.prepend(cb)
    }

}

function description(pid) {
    let description = document.getElementById(`description-${pid}`)
    description.classList.toggle("line-clamp-2")
    description.classList.toggle("overflow-y-scroll")
    description.classList.toggle("font-thin")
}

function postdescription(pid) {
    let description = document.getElementById(`postdescription-${pid}`)
    description.classList.toggle("line-clamp-2")
    description.classList.toggle("overflow-y-scroll")
    description.classList.toggle("[scrollbar-width:none]")
    description.classList.toggle("[-ms-overflow-style:none]")
    description.classList.toggle("[&::-webkit-scrollbar]:hidden")
    description.classList.toggle("font-thin")
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

function vopensol(soid) {
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


async function reply(postid, commentid, username) {
    let textarea = document.getElementById(`reply-${commentid}`)
    let reply = textarea.value
    const response = await fetch(`/reply/${postid}/${commentid}`, {
        "method": "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ reply })
    })
    let data = await response.json()
    if (data.success) {
        textarea.value = "";
        let ucomment = document.querySelector(`.ucomment-${commentid}`)
        let rp = document.createElement('div');
        rp.className = `flex gap-2 px-3 py-2 h-7 w-full items-center`
        rp.innerHTML = `<h1 class="text-blue-500">→ ${username}</h1>
                                                    <p>${reply}</p>`
        ucomment.insertAdjacentElement("afterend", rp)
    }
}