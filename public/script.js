document.addEventListener("DOMContentLoaded", () => {
    let inputfile = document.getElementById("fileInput")
    let uploadedimg = document.getElementById("previwimg")
    let uploadvideo = document.getElementById("videopreview")
    let videobox = document.querySelector(".videobox")
    if (inputfile && uploadedimg) {
        inputfile.addEventListener("change", () => {
            let file = inputfile.files[0]
            if (file) {
                if (file.type.startsWith("image/")) {
                    let reader = new FileReader();
                    reader.onload = function (e) {
                        uploadedimg.setAttribute("src", e.target.result)
                        uploadedimg.classList.remove("hidden")
                        videobox.classList.add("hidden")
                    }
                    reader.readAsDataURL(file)
                }
                else if (file.type.startsWith("video/")) {
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

    const MAX_TAGS = 6;
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



        if (tags.length >= MAX_TAGS) {
            input.disabled = true;
            input.placeholder = '';
            hint.textContent = 'Max 6 tags reached. Remove one to add more.';
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

                if (!viewedVideos.has(video)) {
                    viewedVideos.add(video)
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

    const uploadfile = document.getElementById("fileInput")
    if (uploadfile) {
        uploadfile.onchange = function () {
            let file = this.files[0]
            let isVideo = file.type.startsWith("video/")
            let isImage = file.type.startsWith("image/")
            if (isVideo && file.size > 52428800) {
                alert("Video Size Is Too Big !!")
                this.value = ""
            }
            else if (isImage && file.size > 5242880) {
                alert("Image Size Is Too Big !!")
                this.value = ""
            }

        }
    }


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

});

async function likepost(userid) {
    await fetch("/like/" + userid, {
        credentials: 'include',
        method: "GET"
    }).then(res => res.json()).then(data => {
        let likecount = document.querySelector(`.likecount[data-id = "${userid}"]`)
        likecount.innerText = data.likes;
    })

    let liked = document.querySelector(`.liked[data-id= "${userid}"]`)
    let unliked = document.querySelector(`.unliked[data-id = "${userid}"`)

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
    let l = document.getElementById(`vlikecommentmusic-${coid}`)
    let back = document.querySelector(`.backcomment-${coid}`)
    let up = document.querySelector(`.upcomment-${coid}`)
    commentbox.classList.remove("hidden")
    l.classList.add("hidden")
    back?.addEventListener("click", () => {
        l.classList.remove("hidden")
        commentbox.classList.add("hidden")
    })
    up?.addEventListener("click", () => {
        l.classList.remove("hidden")
        commentbox.classList.add("hidden")
    })
    fetch("/commentbox/" + coid, { method: 'POST' })
}

function vopenmbox(coid) {
    let commentbox = document.getElementById(`commentvbox-${coid}`)
    let l = document.getElementById(`userinteract-${coid}`)
    let back = document.querySelector(`.backvcomment-${coid}`)
    commentbox.classList.remove("hidden")
    l.classList.add("hidden")
    back?.addEventListener("click", () => {
        l.classList.remove("hidden")
        commentbox.classList.add("hidden")
    })
    fetch("/commentbox/" + coid, { method: 'POST' })
}

function openbox(coid) {
    let commentbox = document.getElementById(`commentbox-${coid}`)
    let l = document.getElementById(`userinteract-${coid}`)
    let back = document.querySelector(`.backcomment-${coid}`)
    let up = document.querySelector(`.upcomment-${coid}`)
    commentbox.classList.remove("hidden")
    l.classList.add("hidden")
    back?.addEventListener("click", () => {
        l.classList.remove("hidden")
        commentbox.classList.add("hidden")
    })
    up?.addEventListener("click", () => {
        l.classList.remove("hidden")
        commentbox.classList.add("hidden")
    })
    fetch("/commentbox/" + coid, { method: 'POST' })
}

function sendcomment(commentid, nameofuser) {
    let textarea = document.getElementById(`comment-${commentid}`)

    let comment = textarea.value
    fetch("/send/" + commentid, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment, nameofuser })
    }).then(res => res.json()).then(data => {
        let commentcount = document.querySelector(`.commentcount[data-id = "${commentid}"]`)
        commentcount.innerText = data.comments
    })
    textarea.value = ""
    let cbox = document.querySelector(`.userscommentbox[data-id="${commentid}"]`)
    const cb = document.createElement('div')
    cb.className = "eachcomment border flex justify-start items-start gap-2 px-3 py-2 border-zinc-700 w-full min-h-[11vh]"
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


const Connectphantom2 = async () => {
    const provider = window.solana;

    if (!provider?.isPhantom) {
        alert("Please install Phantom wallet");
        window.open("https://phantom.app/", "_blank");
        return;
    }
    let walletAddress;
    try {
        const resp = await provider.connect();
        walletAddress = resp.publicKey.toString();
    } catch (err) {
        window.open("https://phantom.app/", "_blank");
    }

    const res = await fetch("/profile/Connectphantom", {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ walletAddress })
    });

    const data = await res.json();
};

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

    if (!provider?.isPhantom) {
        alert("Please install Phantom wallet");
        window.open("https://phantom.app/", "_blank");
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
            alert("Wallet connected & verified ✅");
            window.location.href = "/profile";
        } else {
            alert("Verification failed ❌");
        }

    } catch (err) {
        alert(err.message || "Connection failed");
    }
};


function vopensol(soid) {
    let solbox = document.getElementById(`solbox-${soid}`)
    let l = document.getElementById(`vlikecommentmusic-${soid}`)
    let back = document.getElementById(`backsol-${soid}`)
    let up = document.getElementById(`upsol-${soid}`)
    solbox.classList.remove("hidden")
    l.classList.add("hidden")
    back?.addEventListener("click", () => {
        l.classList.remove("hidden")
        solbox.classList.add("hidden")
    })
    up?.addEventListener("click", () => {
        l.classList.remove("hidden")
        solbox.classList.add("hidden")
    })
}

function vopenmsol(soid) {
    let solbox = document.getElementById(`solvbox-${soid}`)
    let l = document.getElementById(`userinteract-${soid}`)
    let back = document.getElementById(`backvsol-${soid}`)
    let up = document.getElementById(`upsol-${soid}`)
    solbox.classList.remove("hidden")
    l.classList.add("hidden")
    back?.addEventListener("click", () => {
        l.classList.remove("hidden")
        solbox.classList.add("hidden")
    })
    up?.addEventListener("click", () => {
        l.classList.remove("hidden")
        solbox.classList.add("hidden")
    })
}

function opensol(soid) {
    let solbox = document.getElementById(`solbox-${soid}`)
    let l = document.getElementById(`userinteract-${soid}`)
    let back = document.getElementById(`backsol-${soid}`)
    let up = document.getElementById(`upsol-${soid}`)
    solbox.classList.remove("hidden")
    l.classList.add("hidden")
    back?.addEventListener("click", () => {
        l.classList.remove("hidden")
        solbox.classList.add("hidden")
    })
    up?.addEventListener("click", () => {
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


async function sendSolToCreator(toWalletAddress, creatorUsername) {
    try {
        const provider = window.solana;
        0
        if (!provider?.isPhantom) {
            alert("Please install Phantom wallet");
            window.open("https://phantom.app/", "_blank");
            return;
        }

        const connection = new solanaWeb3.Connection(
            solanaWeb3.clusterApiUrl("devnet"),
            "confirmed"
        );

        const fromPubkey = provider.publicKey;
        const toPubkey = new solanaWeb3.PublicKey(toWalletAddress);

        if (!selectedAmount) {
            alert("Select Amount Fisrt !");
        }
        const lamports = Math.round(selectedAmount * solanaWeb3.LAMPORTS_PER_SOL);

        const transaction = new solanaWeb3.Transaction().add(
            solanaWeb3.SystemProgram.transfer({ fromPubkey, toPubkey, lamports })
        );

        const { blockhash } = await connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = fromPubkey;

        const signed = await provider.signTransaction(transaction);
        const txid = await connection.sendRawTransaction(signed.serialize());
        await connection.confirmTransaction(txid);

        alert(`✅ ${amountSOL} SOL bhej diya @${creatorUsername} ko!`);

    } catch (err) {
        alert("❌ Transaction fail: " + err.message);
    }
}


async function followuser(followeduser, btn) {
    const res = await fetch("/follow", {
        method: "POST",
        credentials: 'include',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ followeduser })
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
        window.location.href = "/profile"
    }
    else {
        const html = await res.text()
        document.body.innerHTML = html;
    }
}