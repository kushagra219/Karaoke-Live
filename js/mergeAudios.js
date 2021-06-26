function mergeAudios(source1, source2) {

    var sources = [source1, source2];
    var context;
    var recorder;
    // var div = document.querySelector("div");
    var duration = 60000;
    var chunks = [];
    var audio = new AudioContext();
    var mixedAudio = audio.createMediaStreamDestination();
    var player = new Audio();
    player.controls = "controls";

    function get(src) {
        return fetch(src)
            .then(function (response) {
                return response.arrayBuffer();
            })
    }

    function stopMix(duration, ...media) {
        setTimeout(function (media) {
            media.forEach(function (node) {
                node.stop()
            })
        }, duration, media)
    }

    Promise.all(sources.map(get)).then(function (data) {
        var len = Math.max.apply(Math, data.map(function (buffer) {
            return buffer.byteLength
        }));
        context = new OfflineAudioContext(2, len, 44100);
        return Promise.all(data.map(function (buffer) {
            return audio.decodeAudioData(buffer)
                .then(function (bufferSource) {
                    var source = context.createBufferSource();
                    source.buffer = bufferSource;
                    source.connect(context.destination);
                    return source.start()
                })
        }))
            .then(function () {
                return context.startRendering()
            })
            .then(function (renderedBuffer) {
                return new Promise(function (resolve) {
                    var mix = audio.createBufferSource();
                    mix.buffer = renderedBuffer;
                    mix.connect(audio.destination);
                    mix.connect(mixedAudio);
                    recorder = new MediaRecorder(mixedAudio.stream);
                    recorder.start(0);
                    mix.start(0);
                    // div.innerHTML = "playing and recording tracks..";
                    // stop playback and recorder in 60 seconds
                    stopMix(duration, mix, recorder)

                    recorder.ondataavailable = function (e) {
                        chunks.push(e.data);
                    };

                    recorder.onstop = function (event) {
                        var blob = new Blob(chunks, {
                            "type": "audio/ogg; codecs=opus"
                        });
                        console.log("recording complete");
                        resolve(blob)
                    };
                })
            })
            .then(function (blob) {
                console.log(blob);
                // div.innerHTML = "mixed audio tracks ready for download..";
                var audioDownload = URL.createObjectURL(blob);
                var a = document.createElement("a");
                a.download = description + "." + blob.type.replace(/.+\/|;.+/g, "");
                a.href = audioDownload;
                a.click();
                a.remove();
                // a.innerHTML = a.download;
                // document.body.appendChild(a);
                // a.insertAdjacentHTML("afterend", "<br>");
                // player.src = audioDownload;
                // document.body.appendChild(player);
            })
    })
        .catch(function (e) {
            console.log(e)
        });
}
