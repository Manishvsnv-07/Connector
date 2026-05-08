let tbox = document.querySelector(".tbox")
let tcircle = document.querySelector(".tcircle")
let isNFT = false;
tbox.addEventListener("click", () => {
    tcircle.classList.toggle("left-0")
    tbox.classList.toggle("bg-green-500")
    tbox.classList.toggle("bg-zinc-700")
    tcircle.classList.toggle("right-0")

    isNFT = !isNFT;
})

let uploadp = document.getElementById("upload")
async function handleUpload() {
    try {
        const description = document.getElementById("description").value;
        const mediaFile = document.getElementById("fileInput").files[0]
        const tags = document.getElementById("tagsData").value
        const thumbnail = document.getElementById("thumbnail").files[0]
        if (!mediaFile) {
            const errorDiv = document.getElementById("errorMsg");
            const te = document.querySelector(".te");
            te.textContent = "Select Post First";
            errorDiv.classList.remove("hidden");

            setTimeout(() => {
                errorDiv.classList.add("hidden");
            }, 1500);
            return;
        }
        if (isNFT) {
            if (!window.solana || !window.solana.isPhantom) {
                const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent);

                if (isMobile) {
                    const currentUrl = encodeURIComponent(window.location.href);
                    window.location.href = `https://phantom.app/ul/browse/${currentUrl}?ref=${currentUrl}`;
                    return;
                }

                const PhantomMsg = document.getElementById("PhantomMsg");
                const p = document.querySelector(".p");
                p.textContent = "Phantom Not Installed ✕";
                PhantomMsg.classList.remove("hidden");
                setTimeout(() => {
                    PhantomMsg.classList.add("hidden");
                    window.open("https://phantom.app/", "_blank");
                    window.location.reload();
                }, 2000);
                return;
            }
            if (!window.solana.isConnected) {
                const PhantomMsg = document.getElementById("PhantomMsg");
                const p = document.querySelector(".p");
                p.textContent = "Phantom Not Connected ✕";
                PhantomMsg.classList.remove("hidden");

                setTimeout(() => {
                    PhantomMsg.classList.add("hidden");
                    window.location.href = "/profile"
                }, 1500);
                return;
            }
            if (mediaFile.type.startsWith("video/")) {
                const errorDiv = document.getElementById("errorMsg");
                const te = document.querySelector(".te");
                te.textContent = "Video As A NFT Not Allowed";
                errorDiv.classList.remove("hidden");

                setTimeout(() => {
                    errorDiv.classList.add("hidden");
                }, 2000);
                return;
            }
        }
        uploadp.innerHTML = `
  <div class="flex items-center justify-center gap-2 w-auto">
    <span>Posting...</span>
    <img src = "images/rocket.svg" class="w-9" style="animation: rocketLaunch 0.5s infinite alternate">
  </div>
`
        const formdata = new FormData()
        formdata.append("description", description)
        formdata.append("media", mediaFile)
        formdata.append("thumbnail", thumbnail)
        formdata.append("tgs", tags)
        formdata.append("isMintNft", String(isNFT));
        const res = await fetch("/post", {
            method: "POST",
            body: formdata
        })
        let data = await res.json();
        if (!isNFT) {
            if (data.error) {
                const errorDiv = document.getElementById("errorMsg");
                const te = document.querySelector(".te");
                te.textContent = data.error;
                errorDiv.classList.remove("hidden");
                uploadp.textContent = "Post It"
                setTimeout(() => {
                    errorDiv.classList.add("hidden");
                }, 2000);
                return;
            }
            if (data.message) {
                const errorDiv = document.getElementById("errorMsg");
                const te = document.querySelector(".te");
                te.textContent = data.message;
                errorDiv.classList.remove("hidden");
                uploadp.textContent = "Post It"
                setTimeout(() => {
                    errorDiv.classList.add("hidden");
                }, 2000);
                return;
            }
            else if (data.success) {
                const successMsg = document.getElementById("successMsg");
                const ts = document.querySelector(".ts");
                ts.textContent = "Post Successfully ✓";
                successMsg.classList.remove("hidden");
                uploadp.textContent = `Post It`
                setTimeout(() => {
                    successMsg.classList.add("hidden");
                    window.location.href = "/profile"
                }, 2000);
            }
        }

        if (isNFT) {
            await mintNFT(data.post._id, data.post.description, data.post.imageUri)
        }
    } catch (error) {
        const errorDiv = document.getElementById("errorMsg");
        const te = document.querySelector(".te");
        te.textContent = error.message;
        errorDiv.classList.remove("hidden");
        uploadp.textContent = "Post It"
        setTimeout(() => {
            errorDiv.classList.add("hidden");
        }, 2000);
        return;
    }
}

async function mintNFT(postid, postdescription, postimg) {
    try {
        await window.solana.connect()
        const walletAddress = window.solana.publicKey.toString()
        const res = await fetch("/nft/mint", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ postid, postdescription, postimg, walletAddress })
        })

        let data = await res.json();
        if (data.success) {
            const successMsg = document.getElementById("successMsg");
            const ts = document.querySelector(".ts");
            ts.textContent = "Post Upload As NFT ✓";
            successMsg.classList.remove("hidden");

            setTimeout(() => {
                successMsg.classList.add("hidden");
                window.location.href = `/profile`
            }, 1500);
        }
        else {
            const errorDiv = document.getElementById("errorMsg");
            const te = document.querySelector(".te");
            te.textContent = "NFT Post Failed ✕";
            errorDiv.classList.remove("hidden");

            setTimeout(() => {
                errorDiv.classList.add("hidden");
            }, 1500);
            return;
        }
    } catch (error) {
        res.status(500).send("Internal Error")
    }

}