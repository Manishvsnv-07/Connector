document.addEventListener("DOMContentLoaded", () => {

    let inputfile = document.getElementById("fileInput")
    let uploadedimg = document.getElementById("previwimg")
    let uploadvideo = document.getElementById("videopreview")
    let videobox = document.querySelector(".videobox")
    let thumbnailpreview = document.getElementById("thumbnailpreview")
    if (inputfile) {
        inputfile.onchange = function () {
            let file = this.files[0]
            let isVideo = file.type.startsWith("video/")
            let isImage = file.type.startsWith("image/")
            if (isVideo && file.size > 52428800) {
                this.value = "images/upload.jpeg"
                const errorDiv = document.getElementById("errorMsg");
                const te = document.querySelector(".te");
                te.textContent = "Video Size Is Too Big !";
                errorDiv.classList.remove("hidden");

                setTimeout(() => {
                    errorDiv.classList.add("hidden");
                }, 1500);
                return;
            }
            else if (isImage && file.size > 5242880) {
                const errorDiv = document.getElementById("errorMsg");
                const te = document.querySelector(".te");
                te.textContent = "Image Size Is Too Big !";
                errorDiv.classList.remove("hidden");

                setTimeout(() => {
                    errorDiv.classList.add("hidden");
                }, 1500);
                return;
                this.value = ""
            }

        }
    }

    if (inputfile && uploadedimg) {
        inputfile.addEventListener("change", () => {
            let file = inputfile.files[0]
            if (file) {
                if (file.type.startsWith("image/")) {
                    if (file.size > 5242880) {
                        const errorDiv = document.getElementById("errorMsg");
                        const te = document.querySelector(".te");
                        te.textContent = "Image Size Is Too Big !";
                        errorDiv.classList.remove("hidden");

                        setTimeout(() => {
                            errorDiv.classList.add("hidden");
                        }, 1500);
                        return;
                    }
                    let reader = new FileReader();
                    reader.onload = function (e) {
                        uploadedimg.setAttribute("src", e.target.result)
                        uploadedimg.classList.remove("hidden")
                        videobox.classList.add("hidden")
                    }
                    reader.readAsDataURL(file)
                }
                else if (file.type.startsWith("video/")) {
                    if (file.size > 52428800) {
                        this.value = "images/upload.jpeg"
                        const errorDiv = document.getElementById("errorMsg");
                        const te = document.querySelector(".te");
                        te.textContent = "Video Size Is Too Big !";
                        errorDiv.classList.remove("hidden");

                        setTimeout(() => {
                            errorDiv.classList.add("hidden");
                        }, 1500);
                        return;
                    }
                    uploadvideo.src = URL.createObjectURL(file)
                    videobox.classList.remove("hidden")
                    uploadedimg.classList.add("hidden")
                }
            }
            else {
                uploadedimg.src = "images/upload.png"
                uploadvideo.src = ""
            }
        })
    }
    let vid = document.getElementById("videopreview")
    let v = document.querySelector(".vmusicoff")
    let thumbnail = document.getElementById("thumbnail")
    if (thumbnail) {
        thumbnail.onchange = function () {
            let t = this.files[0];
            let isImg = t.type.startsWith("image/")
            if (isImg && t.size < 5242880) {
                let read = new FileReader();
                read.onload = function (e) {
                    thumbnailpreview.setAttribute("src", e.target.result)
                    uploadedimg.classList.add("hidden")
                    videobox.classList.add("hidden")
                    thumbnailpreview.classList.remove("hidden")
                    vid.muted = true;
                }
                read.readAsDataURL(t)
            }
            else {
                return alert("Invalid Input")
            }
        }
    }
    v?.addEventListener("click", () => {
        if (vid.muted) {
            v.src = "images/playsound.svg"
            vid.muted = false;
        }
        else {
            v.src = "images/offsound.svg"
            vid.muted = true
        }
    })


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

    const MAX_TAGS = 5;
    window.tags = [];
    const container = document.getElementById('maintagcontainer');
    const input = document.getElementById('tagInput');
    const hint = document.getElementById('hintText');

    function addTag(value) {
        const val = value.trim().replace(/,/g, '');
        if (!val || tags.includes(val) || tags.length >= MAX_TAGS) return;
        tags.push(val);
        renderTags();
    }

    window.removeTag = function (index) {
        tags.splice(index, 1);
        renderTags();
    }

    function renderTags() {
        const pillsContainer = document.getElementById('tagPills');
        pillsContainer.innerHTML = '';
        tags.forEach((tag, i) => {
            const el = document.createElement('div');
            el.className = 'tag-pill flex items-center gap-1 bg-transparent border border-zinc-700 text-white text-sm px-3 py-1 rounded-md';
            el.innerHTML = `<span>${tag}</span><button type="button" onclick="removeTag(${i})" class="text-gray-400 hover:text-gray-700 font-medium">&times;</button>`;
            pillsContainer.appendChild(el);
        });

        let tagsdata = document.getElementById('tagsData')
        tagsdata.value = JSON.stringify(tags);
        console.log(tagsdata.value);


        if (tags.length >= MAX_TAGS) {
            input.disabled = true;
            input.placeholder = '';
            hint.textContent = 'Max 5 tags reached.';
            hint.className = 'text-xs text-yellow-500 mt-1';
        } else {
            input.disabled = false;
            input.placeholder = 'Type a tag and press Enter...';
            hint.innerHTML = 'Press <strong>Enter</strong> or <strong>,</strong> to add a tag';
            hint.className = 'text-xs text-gray-400 mt-1';
        }
    }

    input?.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addTag(input.value);
            input.value = '';
        }
        if (e.key === 'Backspace' && input.value === '' && tags.length > 0) {
            removeTag(tags.length - 1);
        }
    });

    let fromdata = document.querySelector("form")
    fromdata?.addEventListener("submit", () => {
        let tdata = document.getElementById("tagsData")
        tdata.value = JSON.stringify(tags)
    })


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


    let dbtn = document.querySelector(".deletebtn")
    let deletebox = document.querySelector(".deletepopup")
    dbtn?.addEventListener("click", () => {
        deletebox?.classList.toggle("hidden")
    })
    let canceldelete = document.querySelector(".cancel")
    canceldelete?.addEventListener("click", (req, res) => {
        deletebox?.classList.toggle("hidden")
    })

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
                        <img src="${u.image}" class="w-7 rounded-full" alt="">
                        <h1>${u.username}</h1>
                </div>`
                ).join('');
            }
        }, 300);
    })


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


    let edit = document.querySelector(".edit")
    let editpost = document.querySelector(".editpost")
    let close = document.getElementById("close")
    edit?.addEventListener("click", () => {
        editpost.classList.remove("hidden")
        close?.addEventListener("click", () => {
            editpost.classList.add("hidden")
        })
    })


});



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
        verifyotp.classList.remove("hidden")
        dataform.classList.add("hidden")
    }
    if (!res.ok) {
        const errorDiv = document.getElementById("errorMsg");
        errorDiv.textContent = data.message;
        errorDiv.classList.remove("hidden");

        setTimeout(() => {
            errorDiv.classList.add("hidden");
        }, 3000);
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
    let verifyotp = document.querySelector(".verifyotp")
    let dataform = document.querySelector(".dataform")
    verifyotp.classList.add("hidden")
    dataform.classList.remove("hidden")
})

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
    console.log(coid);

    let l = document.getElementById(`userinteract-${coid}`)
    let back = document.querySelector(`.backcomment-${coid}`)
    commentbox.classList.remove("hidden")
    l.classList.add("hidden")
    back?.addEventListener("click", () => {
        console.log('hello');

        l.classList.remove("hidden")
        commentbox.classList.add("hidden")
    })
}

function sendcomment(commentid, nameofuser, userid) {
    let textarea = document.getElementById(`comment-${commentid}`)
    console.log(textarea);

    console.log(userid);

    let comment = textarea.value
    console.log(comment);

    fetch("/send/" + commentid, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment, nameofuser, userid })
    }).then(res => res.json()).then(data => {
        let commentcount = document.querySelector(`.commentcount[data-id = "${commentid}"]`)
        commentcount.innerText = data.comments
    })
    textarea.value = ""
    let cbox = document.querySelector(`.userscommentbox[data-id="${commentid}"]`)
    const cb = document.createElement('div')
    cb.className = "eachcomment border flex justify-start items-start gap-2 px-3 py-2 border-zinc-700 w-[80vw] sm:w-[60vw] md:w-[29vw] min-h-[11vh]"
    cb.innerHTML = `<h1 class="nameofuser text-blue-600 shrink-0">${nameofuser}</h1> <p class="usercomment wrap-break-word">${comment}</p>`
    cbox.prepend(cb)

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


window.addEventListener("load", async () => {
    const provider = window.solana;

    if (provider?.isPhantom) {
        try {
            const res = await provider.connect({ onlyIfTrusted: true });
        } catch (err) {
            console.log("Not connected yet");
        }
    }
});


const Connectphantom = async () => {
    const provider = window.solana;

    if (!window.solana || !window.solana.isPhantom) {
        const PhantomMsg = document.getElementById("PhantomMsg");
        const p = document.querySelector(".p");
        p.textContent = "Phantom Not Installed ✕";
        PhantomMsg.classList.remove("hidden");

        setTimeout(() => {
            PhantomMsg.classList.add("hidden");
            window.open("https://phantom.app/", "_blank");
            window.location.reload()
        }, 2000);
        return;
    }

    try {
        // 1. Connect wallet
        const resp = await provider.connect();
        const publicKey = resp.publicKey.toString();
        // 2. Get message from backend
        const msgRes = await fetch("/auth/message", {
            credentials: "include"
        });
        const { message } = await msgRes.json();

        // 3. Sign message
        const encoded = new TextEncoder().encode(message);
        const signed = await provider.signMessage(encoded, "utf8");

        const signature = Array.from(signed.signature);

        // 4. Send to backend for verification + save
        const verifyRes = await fetch("/profile/Connectphantom", {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                publicKey,
                signature,
                message
            })
        });

        const data = await verifyRes.json();

        if (data.success) {
            const successMsg = document.getElementById("successMsg");
            const ts = document.querySelector(".ts");
            ts.textContent = "Wallet connected & verified ✅";
            successMsg.classList.remove("hidden");

            setTimeout(() => {
                successMsg.classList.add("hidden");
                window.location.href = "/profile";
            }, 2000);
        } else {
            const errorDiv = document.getElementById("errorMsg");
            const te = document.querySelector(".te");
            te.textContent = "Verification failed ❌";
            errorDiv.classList.remove("hidden");

            setTimeout(() => {
                errorDiv.classList.add("hidden");
                window.location.href = "/profile";
            }, 2000);
            return;
        }

    } catch (err) {
        if (err.code === 4001) {
            const PhantomMsg = document.getElementById("PhantomMsg");
            const p = document.querySelector(".p");
            p.textContent = err;
            PhantomMsg.classList.remove("hidden");
            setTimeout(() => PhantomMsg.classList.add("hidden"), 2000);
            return;
        }
        else if (err.code === -32603) {
            const PhantomMsg = document.getElementById("PhantomMsg");
            const p = document.querySelector(".p");
            p.textContent = "Wallet Not Created ✕";
            PhantomMsg.classList.remove("hidden");
            setTimeout(() => PhantomMsg.classList.add("hidden"), 2000);
            return;
        }
    }
};

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


let selectedAmount = null;
function selectsol(btn, amount) {
    let allselect = document.querySelectorAll(".amount-btn")
    allselect.forEach((btn) => {
        btn.classList.remove("select")
        btn.classList.remove("bg-zinc-700")
    })
    btn.classList.add("select");
    btn.classList.add("bg-zinc-700")
    selectedAmount = amount;

}


async function sendSolToCreator(toWalletAddress, creatorUsername, postid) {
    try {
        console.log(toWalletAddress, creatorUsername, postid);

        let sendbtn = document.getElementById("sendbtn")
        sendbtn.disabled = true;
        const provider = window.solana;
        0

        if (!window.solana || !window.solana.isPhantom) {
            const PhantomMsg = document.getElementById("PhantomMsg");
            const p = document.querySelector(".p");
            p.textContent = "Phantom Not Installed ✕";
            PhantomMsg.classList.remove("hidden");

            setTimeout(() => {
                PhantomMsg.classList.add("hidden");
                window.open("https://phantom.app/", "_blank");
                window.location.reload()
            }, 2000);
            return;
        }


        const connection = new solanaWeb3.Connection(
            solanaWeb3.clusterApiUrl("devnet"),
            "confirmed"
        );

        const fromPubkey = provider.publicKey;
        const toPubkey = new solanaWeb3.PublicKey(toWalletAddress);

        if (!selectedAmount) {
            const PhantomMsg = document.getElementById("PhantomMsg");
            const p = document.querySelector(".p");
            p.textContent = `Select Amount First ¿`;
            PhantomMsg.classList.remove("hidden");

            setTimeout(() => {
                PhantomMsg.classList.add("hidden");
                window.location.reload()
            }, 2000);
            return;
        }
        const lamports = Math.round(selectedAmount * solanaWeb3.LAMPORTS_PER_SOL);

        const transaction = new solanaWeb3.Transaction().add(
            solanaWeb3.SystemProgram.transfer({ fromPubkey, toPubkey, lamports })
        );

        const LatestBlockhash = await connection.getLatestBlockhash();
        transaction.recentBlockhash = LatestBlockhash.blockhash;
        transaction.feePayer = fromPubkey;

        const isDev = true;
        const signed = await provider.signTransaction(transaction);
        const txid = await connection.sendRawTransaction(signed.serialize(), {
            skipPreflight: isDev,
            preflightCommitment: 'confirmed'
        });
        await connection.confirmTransaction({
            blockhash: LatestBlockhash.blockhash,
            signature: txid,
            lastValidBlockHeight: LatestBlockhash.lastValidBlockHeight
        });
        const res = await fetch("/sendSol", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ selectedAmount, toWalletAddress, postid })
        })
        let data = await res.json()
        if (data.success) {
            let solsenders = document.getElementById(`solsenders-${postid}`)
            console.log(solsenders);

            let div = document.createElement('div')
            div.className = `senderdata border border-zinc-700 my-2 w-full h-[11vh] px-2 flex items-center justify-center shrink-0`
            div.innerHTML = `<p class="text-[17px]"><strong class="text-yellow-300">${selectedAmount}</strong> Sol Send
                                                            By <strong class="text-purple-300">${creatorUsername}</strong></p>`
            solsenders.prepend(div)
            const PhantomMsg = document.getElementById("PhantomMsg");
            const p = document.querySelector(".p");
            p.textContent = `🎉 ${selectedAmount} SOL sent to @${creatorUsername}!`;
            PhantomMsg.classList.remove("hidden");

            setTimeout(() => {
                PhantomMsg.classList.add("hidden");
            }, 2000);
            return;
        }


    } catch (err) {
        const errorDiv = document.getElementById("errorMsg");
        const te = document.querySelector(".te");
        te.textContent = "Transaction Failed !";
        errorDiv.classList.remove("hidden");

        setTimeout(() => {
            errorDiv.classList.add("hidden");
        }, 1500);
        return;
    }
    finally {
        sendbtn.disabled = false;
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
    console.log(udescription)
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
