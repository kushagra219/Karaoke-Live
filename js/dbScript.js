let dbAccess;
let request = indexedDB.open("Karaoke", 1);
let container = document.querySelector(".container")

request.addEventListener("success", function () {
    dbAccess = request.result;
});

request.addEventListener("upgradeneeded", function () {
    let db = request.result;
    db.createObjectStore("recordings", { keyPath: "mId" });
});

request.addEventListener("error", function () {
    alert("some error occured");
});

function saveRecording(media, song, startTime, endTime) {
    let tx = dbAccess.transaction("recordings", "readwrite");
    let recordingsObjectStore = tx.objectStore("recordings");
    let data = {
        mId: Date.now(),
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

    req.addEventListener("success", function () {
        let cursor = req.result;

        let counter = 1;
        if (cursor) {
            let tr = document.createElement("tr");
            tr.innerHTML = `<td>${counter}</td>
            <td>002 Bulleya</td>
            <td>25th June, 2021</td>
            <td>
                <button type="button" data-id = "${cursor.value.mId} class="btn btn-success">
                    Listen
                </button>
                <button type="button" data-id = "${cursor.value.mId} class="btn btn-danger">
                    Delete
                </button>
            </td>`;
            counter += 1;

            let listenBtn = $("#listen")[0];
            let deleteBtn = $("#delete")[0];

            deleteBtn.addEventListener("click", function (e) {
                let mId = e.currentTarget.getAttribute("data-id");
                e.currentTarget.parentElement.parentElement.remove();

                deleteMediaFromDB(mId);
            })
            
            listenBtn.addEventListener('click', function(e) {

            })

            container.appendChild(tr);
            cursor.continue();
        }
    })
}


function deleteMediaFromDB(mId) {
    let tx = dbAccess.transaction("recordings", "readwrite");
    let recordingsObjectStore = tx.objectStore("recordings");
    recordingsObjectStore.delete(Number(mId))
}