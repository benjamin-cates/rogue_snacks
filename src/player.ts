import { KAPLAYCtx } from "kaplay";
import { FLOOR_Y, movement_comp } from "./movement";

function add_player(k: KAPLAYCtx) {
    const PLAYER_HEIGHT = 64;
    const PLAYER_WIDTH = 48;
    k.add([k.pos(16, 16), k.rect(208, 24), k.color(0, 0, 0)]);
    let health_bar = k.add([k.pos(20, 20), k.rect(200, 16), k.color(255, 0, 0)]);
    k.add([k.pos(960 / 2 - 104, 16), k.rect(208, 24), k.color(0, 0, 0)]);
    let combo_bar = k.add([k.pos(960 / 2 - 100, 20), k.rect(0, 16), k.color(223, 113, 38)]);
    let combo_text = k.add([
        k.text("1x", { size: 25, font: "monospace" }),
        k.pos(960 / 2 + 120, 17.5)
    ]);
    let score_text = k.add([
        k.text("Score: 0", { align: "right", width: 300, size: 25, font: "monospace" }),
        k.pos(960 - 16 - 300, 17.5),
    ])
    let player = k.add([
        "player",
        k.pos(960 / 2 - 50, FLOOR_Y - PLAYER_HEIGHT),
        k.sprite("player"),
        k.scale(2),
        k.area(),
        movement_comp(k, { height: 92, width: 64, jump_vel: 800, max_speed: 300, terminal: 200, }),
        {
            health: 100,
            total_health: 100,
            attack_speed_multiplier: 1,
            attack_damage_multiplier: 1,
            jump_multiplier: 1,
            speed_multiplier: 1,
            timer_multiplier: 1,
            attack_distance_multiplier: 1,
            score: 0,
            delta_health(dh: number) {
                if (dh < 0) {
                    k.play("hurt");
                }
                if (dh + player.health <= 0 && player.health > 0) {
                    (k.get("scene")[0] as any).die();
                }
                player.health = Math.max(0, Math.min(player.health + dh, player.total_health));
                health_bar.width = player.health / player.total_health * 200;
            }
        },
        {
            combo: 1,
            combo_timer: 0,
            combo_timer_enabled: false,
            add_points_text(points: number) {
                let starting_y = player.pos.y - 20;
                let text = k.add([
                    k.text("+" + points, { size: 20 }),
                    k.timer(),
                    k.color(255, 255, 255),
                    k.pos(player.pos.x + 13, starting_y),
                    k.opacity(1),
                ]);
                text.tween(0 as number, 1, 0.8, v => {
                    text.pos.y = starting_y - 100 * v;
                    text.opacity = Math.min(2 - 2 * v, 1);
                })
                text.wait(1, () => text.destroy());
            },
            register_kill() {
                k.play("point");
                if (player.health <= 0) return;
                player.add_points_text(player.combo);
                player.score += player.combo;
                score_text.text = "Score: " + player.score.toString().padStart(5, "0");
                player.combo_timer = 100;
                player.combo += 1;
                combo_text.text = player.combo + "x";
            },
            baseball_hit() {
                k.play("point");
                if (player.health <= 0) return;
                player.add_points_text(player.combo * 10);
                player.score += player.combo * 10;
                score_text.text = "Score: " + player.score.toString().padStart(5, "0");
                player.combo_timer = 100;
                player.combo += 1;
                combo_text.text = player.combo + "x";
            }
        }
    ]);
    player.onUpdate(() => {
        if (player.combo_timer_enabled) {
            player.combo_timer = Math.max(player.combo_timer - k.dt() * 50 / player.timer_multiplier, 0);
        }
        if (player.combo_timer == 0) {
            player.combo = 1;
            combo_text.text = player.combo + "x";
        }
        combo_bar.width = 2 * player.combo_timer;
    })

    let bat = player.add([
        "bat",
        k.pos(25, 25),
        k.sprite("bat"),
        k.rotate(),
        k.area(),
        k.anchor(k.vec2(-0.5, 0)),
        k.timer(),
        {
            move_dir: "none",
            is_left: false,
            throw_dist: 50,
            damage: 10,
            attack_id: 0,
        },
    ]);

    bat.onKeyDown("left", () => {
        if (bat.move_dir == "none" && player.health > 0) {
            bat.attack_id += 1;
            bat.move_dir = "left";
            bat.wait(0.3 / player.attack_speed_multiplier,
                () => {
                    bat.move_dir = "none"
                    bat.angle = 180;
                });
            bat.angle = 180;
            bat.is_left = true;
            bat.tween(0 as number, 1, 0.28 / player.attack_speed_multiplier, v => {
                let ang = Math.PI * 0.7 + Math.PI * 0.6 * v;
                let radius = player.attack_distance_multiplier * 30 * (1 - Math.abs(2 * v - 1) ** 2.8);
                bat.pos.x = 15 - 10 + radius * Math.cos(ang);
                bat.pos.y = 25 + radius * Math.sin(ang);
                bat.angle = 180 - 50 * Math.cos(Math.PI * v) ** 3;
            });
        }
    })
    bat.onKeyDown("right", () => {
        if (bat.move_dir == "none" && player.health > 0) {
            bat.attack_id += 1;
            bat.move_dir = "right";
            bat.wait(0.3 / player.attack_speed_multiplier, () => {
                bat.move_dir = "none"
                bat.angle = 0;
            });
            bat.flipX = false;
            bat.angle = 0;
            bat.is_left = false;
            bat.tween(0 as number, 1, 0.28 / player.attack_speed_multiplier, v => {
                let ang = Math.PI * 0.3 - Math.PI * 0.6 * v;
                let radius = player.attack_distance_multiplier * 30 * (1 - Math.abs(2 * v - 1) ** 2.8);
                bat.pos.x = 15 + 10 + radius * Math.cos(ang);
                bat.pos.y = 25 + radius * Math.sin(ang);
                bat.angle = 50 * Math.cos(Math.PI * v) ** 3;
            });
        }
    })
    bat.onKeyDown("down", () => {
        if (bat.move_dir == "none" && player.health > 0) {
            bat.attack_id += 1;
            bat.move_dir = "down";
            bat.wait(0.2 / player.attack_speed_multiplier, () => bat.move_dir = "none");
            bat.flipX = false;
            bat.angle = 0;
            let starting_angle = bat.is_left ? Math.PI : 0;
            let angle_sweep = bat.is_left ? -Math.PI : Math.PI;
            bat.is_left = !bat.is_left;
            bat.tween(0 as number, 1, 0.18 / player.attack_speed_multiplier, v => {
                let ang = starting_angle + angle_sweep * v;
                bat.angle = ang * 180 / Math.PI;
                let radius = 10 + player.attack_distance_multiplier * 20 * (1 - (2 * v - 1) ** 4);
                bat.pos.x = 15 + radius * Math.cos(ang);
                bat.pos.y = 25 + radius * Math.sin(ang);

            }, (t) => 0.5 - 0.5 * Math.cos(t * Math.PI))
        }
    });
    bat.onKeyDown("up", () => {
        if (bat.move_dir == "none" && player.health > 0) {
            bat.attack_id += 1;
            bat.move_dir = "up";
            bat.wait(0.2 / player.attack_speed_multiplier, () => bat.move_dir = "none");
            let starting_angle = bat.is_left ? Math.PI : Math.PI * 2;
            let angle_sweep = bat.is_left ? Math.PI : -Math.PI;
            bat.is_left = !bat.is_left;
            bat.tween(0 as number, 1, 0.18 / player.attack_speed_multiplier, v => {
                let ang = starting_angle + angle_sweep * v;
                bat.angle = ang * 180 / Math.PI;
                let radius = 10 + player.attack_distance_multiplier * 20 * (1 - (2 * v - 1) ** 4);
                bat.pos.x = 15 + radius * Math.cos(ang);
                bat.pos.y = 25 + radius * Math.sin(ang);

            }, (t) => 0.5 - 0.5 * Math.cos(t * Math.PI))
        }
    });
    bat.onCollide("jumpable", () => {
        if (bat.move_dir == "down" && (k.get("player")[0] as any).pos.y < FLOOR_Y - PLAYER_HEIGHT * 1.25) {
            (k.get("player")[0] as any).velocity.y = -600;
            (k.get("player")[0] as any).velocity.x /= 2;
        }
    })
    player.onCollide("damage_fragile", (obj) => {
        player.delta_health(-(obj as any).damage);
        obj.destroy();
    })
    player.onCollide("damage", (obj) => {
        player.delta_health(-(obj as any).damage);
    })
    player.onUpdate(() => {
        player.run_physics(k.time());
    });
    let a_time: number | undefined;
    let a_off_time: number | undefined;
    player.onKeyDown("a", () => {
        d_time = undefined;
        d_off_time = undefined;
        if (player.getCurAnim()?.name != "walk_left") player.play("walk_left");
        if (player.health > 0 && a_off_time && a_off_time > k.time() - 0.15) {
            player.dash_left(player.speed_multiplier);
            a_off_time = undefined;
        }
        if (!a_time) {
            a_off_time = undefined;
            a_time = k.time();
        }
        if (player.health > 0) player.move_left(player.speed_multiplier);
    });
    player.onKeyRelease("a", () => {
        player.play("stand");
        if (a_time && !a_off_time && a_time > k.time() - 0.15) {
            a_off_time = k.time();
            a_time = undefined;
        }
        if (a_time) {
            a_time = undefined;
        }
    });
    let d_time: number | undefined;
    let d_off_time: number | undefined;
    player.onKeyDown("d", () => {
        a_time = undefined;
        a_off_time = undefined;
        if (player.getCurAnim()?.name != "walk_right") player.play("walk_right");
        if (player.health > 0 && d_off_time && d_off_time > k.time() - 0.15) {
            player.dash_right(player.speed_multiplier);
            d_off_time = undefined;
        }
        if (!d_time) {
            d_off_time = undefined;
            d_time = k.time();
        }
        if (player.health > 0) player.move_right(player.speed_multiplier);
    });
    player.onKeyRelease("d", () => {
        player.play("stand");
        if (d_time && !d_off_time && d_time > k.time() - 0.15) {
            d_off_time = k.time();
            d_time = undefined;
        }
        if (d_time) {
            d_time = undefined;
        }
    });
    player.onCollide("kernel", (obj, col) => {
        obj.destroy();
    });
    player.onCollide("soda", (obj, col) => {
        obj.destroy();
    });
    player.onKeyRelease("space", () => {
        if (player.health > 0) player.jump_release();
    })
    player.onKeyPress("space", () => {
        if (player.health > 0) player.jump(player.jump_multiplier);
    })


}

export { add_player }