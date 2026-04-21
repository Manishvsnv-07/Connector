<div id="errorMsg" class="hidden fixed left-1/2 top-7 -translate-x-1/2 -translate-y-1/2 h-[5vh] rounded-md  bg-black  border border-zinc-600  flex items-center justify-center z-50 px-2"><span class="te text-white"></span>
</div>

<div id="successMsg" class="hidden fixed left-1/2 top-7 -translate-x-1/2 -translate-y-1/2 h-[5vh] rounded-md  bg-black  border border-zinc-600  flex items-center justify-center z-50 px-2"><span class="ts text-white"></span>
</div>





------ Success Pop Up
const successMsg = document.getElementById("successMsg");
        const ts = document.querySelector(".ts");
        ts.textContent = "Post Updated ✓";
        successMsg.classList.remove("hidden");

        setTimeout(() => {
            successMsg.classList.add("hidden");
            window.location.href = `/profile/viewpost/${mypostid}`
        }, 1500);

------- Error Pop Up

const errorDiv = document.getElementById("errorMsg");
        const te = document.querySelector(".te");
        te.textContent = "Empty Not Allowed ✕";
        errorDiv.classList.remove("hidden");

        setTimeout(() => {
            errorDiv.classList.add("hidden");
        }, 1500);
        return;
