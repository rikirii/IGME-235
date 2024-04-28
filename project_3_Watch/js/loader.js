WebFont.load({
    google: {
        families: ['Press Start 2P']
    },
    active: e => {
        console.log("font loaded!");
        // pre-load the images
        app.loader.
            add([
                "assets/uninfected.png",
                "assets/attack_ready.png",
                "assets/attack_cd.png",
                "assets/enemy.png"
            ]);
        app.loader.onProgress.add(e => { console.log(`progress=${e.progress}`) });
        app.loader.onComplete.add(setup);
        app.loader.load();
    }
});