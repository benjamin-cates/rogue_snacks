import { initializeApp } from "firebase/app";
import { addDoc, collection, doc, getDocs, getFirestore, limit, orderBy, query, setDoc } from "firebase/firestore";
import firebase from "firebase/compat/app";
import { GameObj, KAPLAYCtx } from "kaplay";
const firebaseConfig = {
    apiKey: "AIzaSyDeUcrEnVK83RMZA6zwCwNCRWOqr-Apf9U",
    authDomain: "rogue-snacks.firebaseapp.com",
    databaseURL: "https://rogue-snacks-default-rtdb.firebaseio.com",
    projectId: "rogue-snacks",
    storageBucket: "rogue-snacks.firebasestorage.app",
    messagingSenderId: "1048145752477",
    appId: "1:1048145752477:web:980c85c25ce0e78a443f74"
};

async function push_score(name: string, score: number) {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    await setDoc(doc(db, "scores", name + "_" + Math.floor(Math.random() * 10000)), { score: score });
}

function k_button(k: KAPLAYCtx, x: number, y: number, width: number, height: number, text: string, onclick: () => void): GameObj {
    let background = k.add([
        k.pos(x, y),
        k.rect(width, height, { radius: 3 }),
        k.color(0, 0, 0),
    ]);
    let button = background.add([
        k.pos(1, 1),
        k.rect(width - 2, height - 2, { radius: 2 }),
        k.color(255, 255, 255),
        k.area({ collisionIgnore: ["*"] }),
    ]);
    background.add([
        k.pos(0, height / 2 - 10),
        k.text(text, { align: "center", width: width, size: 20 }),
        k.color(0, 0, 0),
    ]);
    button.onHover(() => {
        button.color.r = 230;
        button.color.b = 230;
        button.color.g = 230;
    });
    button.onHoverEnd(() => {
        button.color.r = 255;
        button.color.b = 255;
        button.color.g = 255;
    });
    button.onClick(() => {
        onclick();
    });
    return background;
}
function k_sprite_button(k: KAPLAYCtx, x: number, y: number, text: string, onclick: () => void): GameObj {
    let button = k.add([
        k.sprite("button", { width: 240, height: 45, frame: 0 }),
        k.pos(x - 120, y - Math.floor(45 / 2)),
        k.area(),
    ]);
    button.add([
        k.text(text, { align: "center", width: 240, size: 30 }),
        k.pos(0, 7.5),
        k.color(0, 0, 0),
    ]);
    button.onHover(() => {
        button.frame = 1;
    });
    button.onHoverEnd(() => {
        button.frame = 0;
    })
    button.onClick(onclick);
    return button;

}

function add_main_menu(k: KAPLAYCtx): GameObj {
    let menu = k.add([]);
    menu.add([
        k.pos(0, 0),
        k.rect(960, 100),
        k.color(128, 183, 195),
    ]);
    menu.add([
        k.sprite("controls"),
        k.pos(40, 180),
        k.scale(3),
    ]);
    menu.add([
        k.sprite("logo_text"),
        k.scale(3),
        k.pos(960 / 2 - 107 * 3 / 2, 50),
    ])
    return menu;
}
async function add_leaderboard(k: KAPLAYCtx): Promise<GameObj> {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    let docs = await getDocs(query(collection(db, "scores"), limit(10), orderBy("score", "desc")));
    let lb_text = docs.docs.map(doc => {
        return doc.id.split("_")[0].toUpperCase() + ": " + (doc.data().score ?? 0).toString().padStart(7, "0")
    }).join("\n");
    let box_height = (lb_text.split("\n").length + 1) * 20;
    let background = k.add([
        k.color(34, 32, 52),
        k.pos(960 * 4 / 5 - 100, 540 / 2 - box_height / 2 - 10),
        k.rect(200, box_height + 20),
    ])
    background.add([
        k.text("Leaderboard\n" + lb_text, { align: "center", width: 200, size: 20, font: "monospace" }),
        k.pos(0, 10),
        k.color(255, 255, 255),
    ]);
    return background;
}

export { k_button, add_main_menu, k_sprite_button, add_leaderboard, push_score };