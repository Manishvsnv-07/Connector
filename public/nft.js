let tbox = document.querySelector(".tbox")
let tcircle = document.querySelector(".tcircle")
let isNFT = false;
tbox.addEventListener("click", () => {
    tcircle.classList.toggle("left-0")
    tbox.classList.toggle("bg-green-500")
    tbox.classList.toggle("bg-zinc-700")
    tcircle.classList.toggle("right-0")

    isNFT = !isNFT;
    console.log(isNFT)
})

let uploadp = document.getElementById("upload")
async function handleUpload() {
    uploadp.textContent = "Posting...."
    const description = document.getElementById("description").value;
    const imageFile = document.getElementById("fileInput").files[0]
    const tags = document.getElementById("tagsData").value
    const formdata = new FormData()
    formdata.append("description", description)
    formdata.append("media", imageFile)
    formdata.append("tgs", tags)
    formdata.append("isMintNft", String(isNFT));
    const res = await fetch("/post", {
        method: "POST",
        body: formdata
    })
    let data = await res.json();
    if (data.message) {
        const errorDiv = document.getElementById("errorMsg");
        errorDiv.textContent = data.message;
        errorDiv.classList.remove("hidden");

        setTimeout(() => {
            errorDiv.classList.add("hidden");
        }, 3000);
        return;
    }
    if (data.success) {
        const successMsg = document.getElementById("successMsg");
        successMsg.textContent = data.success;
        successMsg.classList.remove("hidden");

        setTimeout(() => {
            successMsg.classList.add("hidden");
        }, 3000);
        return;
    }

    if (isNFT) {
        await mintNFT(data.post._id, data.post.description, data.post.imageUri)
    }
    else {
        window.location.href = "/profile"
    }
}

async function mintNFT(postid, postdescription, postimg) {
    try {
        if (!window.solana || !window.solana.isPhantom) {
            alert("Please install Phantom wallet");
            window.open("https://phantom.app/", "_blank");
            return;
        }
        await window.solana.connect()
        const walletAddress = window.solana.publicKey.toString()
    
        const res = await fetch("/nft/mint", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ postid, postdescription, postimg ,walletAddress})
        })
    
       let data = await res.json();
       if(data.success){
        const successMsg = document.getElementById("successMsg");
        successMsg.textContent = data.success;
        successMsg.classList.remove("hidden");

        setTimeout(() => {
            successMsg.classList.add("hidden");
        }, 3000);
        window.location.href = "/post"
        return;
       }
       else{
        alert("Nft Unsuccessed ❌"+data.error)
       }
    } catch (error) {
        console.error("Minting failed:", err)
        alert("Mint nahi hua: " + err.message)
    }

}