let inputfile = document.getElementById("fileInput")
let uploadedimg = document.getElementById("previewimg")
let uploadvideo = document.getElementById("videopreview")
let videobox = document.querySelector(".videobox")
let thumbnailpreview = document.getElementById("thumbnailpreview")
if (inputfile) {
    inputfile.onchange = function () {
        let file = this.files[0]
        let isVideo = file.type.startsWith("video/")
        let isImage = file.type.startsWith("image/")
        if (isVideo && file.size > 52428800) {
            this.value = ""
            uploadedimg.src = "images/upload.jpeg"
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
                    thumbnailpreview.classList.add("hidden")
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
                thumbnailpreview.classList.add("hidden")
            }
        }
        else {
            uploadedimg.src = "images/upload.jpeg"
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