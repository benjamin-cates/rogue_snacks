import kaplay, { AudioPlay, GameObj } from "kaplay";
import { add_player } from "./player";
import { add_sounds, add_sprites } from "./sprites";
import { run_arena, sleep } from "./arena";
import { add_leaderboard, add_main_menu, k_sprite_button, push_score } from "./ui";


const k = kaplay({
    width: 960,
    height: 540,
});

k.loadRoot("./"); // A good idea for Itch.io publishing later

add_sprites(k);
add_sounds(k);
k.setVolume(0.8);

k.scene("game", () => {
    let stadium = k.add([
        "stadium",
        k.sprite("stadium", { frame: 0 }),
        k.pos(0, 0),
        k.scale(2),
    ]);
    let arena_id = 0;
    let scene = k.add(["scene", {
        play_id: 0,
        music: undefined as AudioPlay | undefined,
        async die(this) {
            scene.play_id += 1;
            await sleep(200);
            let text = k.add([
                k.pos(960 / 3 - 150, 540 / 2),
                k.text("You died!", { width: 300, align: "center", size: 30 }),
                k.color(255, 255, 255),
            ]);
            let leaderboard: Promise<GameObj> | undefined;
            k_sprite_button(k, 960 / 3, 540 / 2 + 60, "Menu", () => {
                if (leaderboard) {
                    leaderboard.then(obj => obj.destroy());
                }
                k.go("game");
            });
            let button = k_sprite_button(k, 960 * 2 / 3, 540 / 2 + 60, "Add Score", () => {
                let name = prompt("Please enter three letter initials");
                if (!name || name.length != 3) {
                    alert("Name must be three characters");
                    return;
                }
                else {
                    button.destroy();
                    let score = (k.get("player")[0]).score;
                    push_score(name, score);
                    leaderboard = add_leaderboard(k);
                }
            });
        },
        async win_arena(this) {
            if (navigator.userActivation.hasBeenActive) {
                if (scene.music) {
                    scene.music.stop();
                }
                k.play("sting").then(() => {
                    scene.music = k.play("background", { loop: true });
                });
                if (Math.random() < 0.3) {
                    k.play("cheer1");
                }
                else {
                    k.play("cheer2");
                }
            }
            stadium.play("wave", { speed: 5, loop: true });
            let text = k.add([
                k.text(arena_id == 0 ? "Welcome" : ("Arena " + arena_id + " complete"), { align: "center", width: 500, }),
                k.pos(960 / 2 - 250, 540 / 2 - 175),
            ]);
            arena_id += 1;
            k.get("player")[0].combo_timer_enabled = false;
            await sleep(1000);
            await new Promise(resolve => {
                // Skip card picking on first round
                if (arena_id == 1) return resolve(0);
                text.text = "Choose a Card";
                let options = [
                    "card_heal_half_health",
                    Math.random() < 0.3 ? "card_faster_attack" : (Math.random() < 0.5 ? "card_more_attack_damage" : "card_longer_attack_distance"),
                    Math.random() < 0.2 ? "card_inc_jump_height" : (Math.random() < 0.5 ? "card_inc_speed" : "card_longer_timer"),
                ];
                let items_list: GameObj[] = [];
                for (let i = 0; i < 3; i++) {
                    let item = k.add([
                        k.pos(960 / 2 - 200 + 200 * i, 600),
                        k.scale(3),
                        k.sprite(options[i]),
                        k.timer(),
                        //k.rotate(Math.random() < 0.5 ? 8 : -8),
                        k.anchor("center"),
                        k.area(),
                    ]);
                    item.tween(0 as number, 1, 0.4, v => {
                        item.pos.y = 600 - v * 250;
                    }, v => 1 - (1 - v) ** 2);
                    item.wait(0.4, () => {
                        item.onHover(() => {
                            item.tween(0 as number, 1, 0.1, v => item.pos.y = 350 - v * 20);
                        })
                        item.onHoverEnd(() => {
                            item.tween(0 as number, 1, 0.1, v => item.pos.y = 330 + v * 20);
                        })
                    })
                    items_list.push(item);
                    item.onClick(() => {
                        let player = k.get("player")[0] as any;
                        if (options[i] == "card_heal_half_health") {
                            player.delta_health(50);
                        }
                        if (options[i] == "card_faster_attack_speed") {
                            player.attack_speed_multiplier *= 1.15;
                        }
                        if (options[i] == "card_more_attack_damage") {
                            player.attack_damage_multiplier *= 1.15;
                        }
                        if (options[i] == "card_inc_speed") {
                            player.speed_multiplier *= 1.15;
                        }
                        if (options[i] == "card_inc_jump_height") {
                            player.jump_multiplier *= 1.15;
                        }
                        if (options[i] == "card_longer_timer") {
                            player.timer_multiplier *= 1.2;
                        }
                        if (options[i] == "card_longer_attack_distance") {
                            player.attack_distance_multiplier *= 1.15;
                        }
                        for (let item of items_list) {
                            item.destroy();
                        }
                        resolve(0);
                    })
                }
            })
            text.text = "3..";
            await sleep(500);
            text.text = "2..";
            await sleep(500);
            text.text = "1..";
            await sleep(500);
            text.text = "GO!!!";
            run_arena(k, arena_id);
            await sleep(500);
            text.destroy();
            await sleep(2000);
            stadium.play("no_wave");
        }
    }]);
    add_player(k);
    let menu = add_main_menu(k);
    let leaderboard = add_leaderboard(k);
    let button = k_sprite_button(k, 960 / 2 - 20, 481, "Play!", () => {
        menu.destroy();
        button.destroy();
        leaderboard.then((lb) => {
            lb.destroy();
        });
        scene.win_arena();
    });
});
k.go("game");