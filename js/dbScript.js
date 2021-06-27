let dbAccess;
let request = indexedDB.open("Karaoke", 1);
let tbody = document.querySelector("tbody");
let body = document.querySelector("body");

request.addEventListener("success", function () {
    dbAccess = request.result;
});

request.addEventListener("upgradeneeded", function () {
    let db = request.result;
    db.createObjectStore("recordings", { keyPath: "rId" });
});

request.addEventListener("error", function () {
    alert("some error occured");
});

function saveRecording(media, song, startTime, endTime) {
    let tx = dbAccess.transaction("recordings", "readwrite");
    let recordingsObjectStore = tx.objectStore("recordings");

    let totalRecordings = localStorage.getItem("totalRecordings");
    if (totalRecordings == undefined) {
        totalRecordings = 0;
    }
    totalRecordings = parseInt(totalRecordings);
    let title = "recording " + (totalRecordings + 1);
    localStorage.setItem("totalRecordings", totalRecordings + 1);

    let data = {
        rId: Date.now(),
        title,
        media,
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
        song,
        startTime,
        endTime,
    };
    recordingsObjectStore.add(data);
}

function viewMedia() {
    let tx = dbAccess.transaction("recordings", "readonly");
    let recordingsObjectStore = tx.objectStore("recordings");
    let req = recordingsObjectStore.openCursor();

    let counter = 0;
    tbody.innerHTML = "";
    req.addEventListener("success", function () {
        let cursor = req.result;

        if (cursor) {
            counter += 1;
            let tr = document.createElement("tr");
            tr.innerHTML = `<td>${counter}</td>
            <td>${cursor.value.title}</td>
            <td>${cursor.value.date} ${cursor.value.time}</td>
            <td>
                <button type="button" data-src="${window.URL.createObjectURL(cursor.value.media)}" data-id="${cursor.value.rId}" class="btn btn-success recording-listen-btn" data-bs-toggle="modal"
                data-bs-target="#staticBackdrop">
                    Listen
                </button>
                <button type="button" data-id="${cursor.value.rId}" class="btn btn-danger recording-delete-btn">
                    Delete
                </button>
                <div data-id="${cursor.value.rId}" class="recording-configure-btn">
                    <img src="https://img.icons8.com/material-outlined/32/000000/settings--v1.png"/>
                </div>
            </td>`;

            tbody.appendChild(tr);
            cursor.continue();
        }

        let listenBtn = document.querySelector(".recording-listen-btn");
        let deleteBtn = document.querySelector(".recording-delete-btn");

        deleteBtn.addEventListener("click", function (e) {
            let rId = e.currentTarget.getAttribute("data-id");
            e.currentTarget.parentElement.parentElement.remove();

            deleteMediaFromDB(rId);
        })

        listenBtn.addEventListener('click', function (e) {
            let div = document.createElement("div");
            div.innerHTML = `
                <div class="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1"
                    aria-labelledby="staticBackdropLabel" aria-hidden="true">
                    <div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title" id="staticBackdropLabel">${e.currentTarget.parentElement.parentElement.children[1].innerText}.mp3</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body">
                                <audio controls style="width:100%">
                                    <source src="${e.currentTarget.getAttribute("data-src")}" type="audio/mpeg">
                                    Your browser does not support the audio element.
                                </audio>
                            </div>
                            <div class="modal-footer">
                                <button id="close-btn" type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                                <!-- <button type="button" class="btn btn-primary">Understood</button> -->
                            </div>
                        </div>
                    </div>
                </div>`;
            body.appendChild(div);

            let closeBtn = $("#close-modal-btn");
            closeBtn.click(function () {
                body.removeChild(modal[0]);
            })
        })
    })
}

function deleteMediaFromDB(rId) {
    let tx = dbAccess.transaction("recordings", "readwrite");
    let recordingsObjectStore = tx.objectStore("recordings");
    recordingsObjectStore.delete(Number(rId))
    localStorage.setItem("totalRecordings", localStorage.getItem("totalRecordings") - 1);
}