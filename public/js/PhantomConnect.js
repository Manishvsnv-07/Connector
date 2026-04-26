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
            const PhantomMsg = document.getElementById("PhantomMsg");
            const p = document.querySelector(".p");
            p.textContent = "Wallet connected & verified ✅";
            PhantomMsg.classList.remove("hidden");
            setTimeout(() => {
                PhantomMsg.classList.add("hidden");
                window.location.href = "/profile"
            }, 2000);
            
        } else {
            const errorDiv = document.getElementById("errorMsg");
            const te = document.querySelector(".te");
            te.textContent = "Verification failed ❌";
            errorDiv.classList.remove("hidden");

            setTimeout(() => {
                errorDiv.classList.add("hidden");
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

async function sendSolToCreator(toWalletAddress, creatorUsername, postid,senderId,senderUsername) {
    try {
        let sendbtn = document.getElementById("sendbtn")
        sendbtn.disabled = true;
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


        const connection = new solanaWeb3.Connection(
            solanaWeb3.clusterApiUrl("devnet"),
            "confirmed"
        );

        const fromPubkey = provider.publicKey;
        console.log(fromPubkey);
        
        const toPubkey = new solanaWeb3.PublicKey(toWalletAddress);
        console.log(toPubkey);
        
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
            let div = document.createElement('div')
            div.className = `senderdata border border-zinc-700 my-2 w-full h-[11vh] px-2 flex items-center justify-start gap-5 shrink-0`
            div.innerHTML = `<img src="images/nft_verified.svg" class="w-7" alt="">
                                            <p class="[15px]"><strong class="text-yellow-200">
                                                    ${selectedAmount}
                                                </strong> Sol Send
                                                By<strong onclick="searcheduserprofile('${senderId}')"
                                                    class="text-purple-300 hover:text-zinc-50 hover:cursor-pointer">
                                                    ${senderUsername}
                                                </strong></p>`
            solsenders.prepend(div)
            const PhantomMsg = document.getElementById("PhantomMsg");
            const p = document.querySelector(".p");
            p.textContent = `🎉 ${selectedAmount} SOL sent to @${creatorUsername}!`;
            PhantomMsg.classList.remove("hidden");

            setTimeout(() => {
                PhantomMsg.classList.add("hidden");
            }, 2000);
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