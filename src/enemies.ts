import { AreaComp, Comp, GameObj, KAPLAYCtx, KEventController, PosComp, SpriteComp, Vec2 } from "kaplay";
import { FLOOR_Y, GRAVITY, movement_comp, MovementComp } from "./movement";


interface HealthComp {
    health: number,
}

function health_comp(starting_health: number) {
    return { health: starting_health } satisfies HealthComp;
}

function start_x() {
    let side = Math.round(Math.random());
    return Math.random() * 300 + side * 660;
}

function apply_impulse(direction: string, obj: GameObj<MovementComp>) {
    if (direction == "down") {
        obj.velocity.y /= 2;
        obj.velocity.y += 300;
    }
    if (direction == "up") {
        obj.velocity.y /= 2;
        obj.velocity.y -= 300;
    }
    if (direction == "left") {
        obj.velocity.y /= 2;
        obj.velocity.y -= 100;
        obj.velocity.x /= 2;
        obj.velocity.x -= 300;
    }
    if (direction == "right") {
        obj.velocity.y /= 2;
        obj.velocity.y -= 100;
        obj.velocity.x /= 2;
        obj.velocity.x += 300;
    }

}

function enemy_health(k: KAPLAYCtx, enemy: GameObj<HealthComp>, size: Vec2): (obj: GameObj<any>) => KEventController {
    let starting_health = enemy.health;
    let background = enemy.add([
        k.pos(size.x / 2 - 11, size.y + 4),
        k.rect(22, 6),
        k.color(0, 0, 0),
    ])
    let foreground = enemy.add([
        k.pos(size.x / 2 - 10, size.y + 5),
        k.rect(20, 4),
        k.area(),
        k.color(255, 0, 0),
    ])
    let prev_attack = 0;
    return ((obj: GameObj<{ attack_id: number, move_dir: string }>) => {
        if (obj.attack_id != prev_attack) {
            if ((enemy as any).velocity) {
                apply_impulse(obj.move_dir, enemy as any);
            }
            prev_attack = obj.attack_id;
            let dh = -10 * (k.get("player")[0]).attack_damage_multiplier;
            enemy.health += dh;
            if (enemy.health - dh > 0 && enemy.health <= 0) {
                (k.get("player")[0] as any).register_kill();
                enemy.destroy();
            }
            else {
                foreground.width = 20 * enemy.health / starting_health;
            }
        }
    }) as ((obj: GameObj<any>) => KEventController);
}

function summon_soda_particle(k: KAPLAYCtx, pos: Vec2) {
    k.play("fizz");
    let particle = k.add([
        k.pos(pos.x, pos.y),
        movement_comp(k, { jump_vel: 400, width: 32, height: 32, max_speed: 400 }),
        k.sprite("soda_particle",),
        k.scale(2),
        k.area(),
        k.rotate(),
        k.anchor("center"),
        "damage_fragile",
        { damage: 5 },
    ]);
    let target = (k.get("player")[0] as GameObj<PosComp>).pos;
    let vel_y = (Math.random() * 400 + 400);
    let air_time = 2 * vel_y / GRAVITY + (FLOOR_Y - pos.y) / vel_y;
    let vel_x = (target.x - pos.x) / air_time + 20 - 40 * Math.random() + vel_y / 100;
    particle.velocity.x = vel_x;
    particle.velocity.y = -vel_y;
    particle.onUpdate(() => {
        particle.run_physics(k.time());
        particle.angle = Math.atan2(particle.velocity.y, particle.velocity.x) * 180 / Math.PI - 180;
        if (particle.pos.y >= FLOOR_Y - 32) {
            particle.destroy();
        }
    })

}

function summon_soda(k: KAPLAYCtx, health: number): GameObj<HealthComp> {
    let soda = k.add([
        "jumpable",
        k.pos(start_x(), -64),
        movement_comp(k, { jump_vel: 600, width: 76, height: 100, max_speed: 400 }),
        k.sprite("soda"),
        k.scale(2),
        k.area(),
        k.timer(),
        health_comp(health),
    ]);
    soda.onCollideUpdate("bat", enemy_health(k, soda, k.vec2(36, 48)));
    let time = 0;
    soda.onUpdate(() => {
        soda.run_physics(k.time());
        if (k.time() % 1.3 < 0.1 && time % 1.3 > 0.1) {
            let event = Math.floor(Math.random() * 3);
            if (event == 0 || event == 1) {
                soda.play("stand");
                if (soda.pos.x + 48 > 960 / 2) {
                    soda.loop(0.0166, soda.move_left, 10);
                }
                else {
                    soda.loop(0.01666, soda.move_right, 10);
                }
            }
            else {
                soda.play("fizz");
                let rand_num = Math.floor(Math.random() * 3.5);
                for (let i = 0; i < rand_num; i++) {
                    soda.wait(0.3 + i * 0.2 + Math.random() * 0.05, () => {
                        summon_soda_particle(k, k.vec2(soda.pos.x + 48 - 16, soda.pos.y));
                    });
                }
                // Shoot drops
            }
        }
        time = k.time();
    });
    return soda;
}
function summon_popcorn_particle(k: KAPLAYCtx, pos: Vec2) {
    k.play("pop");
    let target = (k.get("player")[0] as GameObj<PosComp>).pos.add(48, 64);
    let particle = k.add([
        "jumpable",
        k.pos(pos.x, pos.y),
        movement_comp(k, { jump_vel: 400, width: 32, height: 32, max_speed: 400 }),
        k.sprite("kernel"),
        k.scale(2),
        k.area(),
        k.rotate(),
        k.anchor("center"),
        k.move(target.angle(pos), 300 + Math.random() * 100),
        "damage_fragile",
        { damage: 5 },
    ]);
    particle.onUpdate(() => {
        if (particle.pos.x < -30 || particle.pos.x > 1000 || particle.pos.y >= FLOOR_Y - 16 || particle.pos.y <= -16) {
            particle.destroy();
        }
    });
}

function summon_popcorn(k: KAPLAYCtx, health: number): GameObj<HealthComp> {
    let popcorn = k.add([
        "jumpable",
        k.pos(start_x(), -64),
        movement_comp(k, { jump_vel: 600, width: 66, height: 90, max_speed: 400 }),
        k.sprite("popcorn"),
        k.scale(2),
        k.area(),
        k.timer(),
        health_comp(health),
    ]);
    popcorn.onCollideUpdate("bat", enemy_health(k, popcorn, k.vec2(31, 43)));
    let time = 0;
    popcorn.onUpdate(() => {
        popcorn.run_physics(k.time());
        if (k.time() % 2 < 0.1 && time % 2 > 0.1) {
            let event = Math.floor(Math.random() * 3);
            if (event == 0 || event == 1) {
                popcorn.play("stand");
                if (popcorn.pos.x + 48 > 960 / 2) {
                    popcorn.loop(0.0166, popcorn.move_left, Math.floor(Math.random() * 5 + 10));
                }
                else {
                    popcorn.loop(0.01666, popcorn.move_right, Math.floor(Math.random() * 5 + 10));
                }
                if (event == 1) {
                    popcorn.jump();
                }
            }
            else {
                popcorn.play("pop");
                let rand_num = Math.floor(Math.random() * 3);
                for (let i = 0; i < rand_num; i++) {
                    popcorn.wait(0.5 + i * 0.3 + Math.random() * 0.08, () => {
                        summon_popcorn_particle(k, k.vec2(popcorn.pos.x + 48, popcorn.pos.y + 64));
                    });
                }
                // Shoot drops
            }
        }
        time = k.time();

    });
    return popcorn;
}

function summon_hotdog(k: KAPLAYCtx, health: number): GameObj<HealthComp> {
    let hotdog = k.add([
        "jumpable",
        "damage",
        k.pos(start_x(), -64),
        movement_comp(k, { jump_vel: 600, width: 80, height: 132, max_speed: 100 + health }),
        k.sprite("hotdog"),
        k.scale(2),
        k.area(),
        k.timer(),
        { running: "no" },
        { damage: 3 },
        health_comp(health),
    ]);
    hotdog.onCollideUpdate("bat", enemy_health(k, hotdog, k.vec2(40, 64)));
    let time = 0;
    hotdog.onUpdate(() => {
        hotdog.run_physics(k.time());
        if (k.time() % 1 < 0.1 && time % 1 > 0.1) {
            if (Math.random() < 0.7) {
                hotdog.play("walk");
                let dir = (k.get("player")[0].pos.x < hotdog.pos.x) ? "left" : "right";
                hotdog.running = dir;
                hotdog.flipX = dir == "right";
            }
            else {
                hotdog.play("stand");
                hotdog.running = "no";
            }
        }
        if (hotdog.running == "left") {
            hotdog.move_left();
        }
        if (hotdog.running == "right") {
            hotdog.move_right();
        }
        time = k.time();

    });

    return hotdog;
}

function summon_churro(k: KAPLAYCtx, health: number): GameObj<HealthComp> {
    let left = Math.random() < 0.5;
    let churro = k.add([
        "jumpable",
        "damage",
        k.pos(left ? -80 : 970, 250 + Math.random() * 50),
        k.sprite("churro", { flipX: !left }),
        k.scale(2),
        k.area(),
        { damage: 3 },
        { vel: left ? 200 : -200 },
        health_comp(health),
    ]);
    churro.onCollideUpdate("bat", enemy_health(k, churro, k.vec2(53, 13)));
    churro.onUpdate(() => {
        churro.pos.x += churro.vel * k.dt();
        if (churro.pos.x < 32) {
            churro.flipX = false;
            churro.vel = 200;
        }
        if (churro.pos.x > 960 - 32 - 53) {
            churro.flipX = true;
            churro.vel = -200;
        }
    });
    return churro;
}

function summon_baseball(k: KAPLAYCtx): GameObj {
    let baseball = k.add([
        k.pos(Math.random() * 200 - 100 + 960 / 2, 0),
        k.sprite("baseball"),
        k.scale(2),
        k.rotate(),
        k.anchor("center"),
        k.area(),
        movement_comp(k, { jump_vel: 0, height: -300, width: 0, max_speed: 0, gravity: 400 }),
    ])
    baseball.onUpdate(() => {
        baseball.angle += 180 * k.dt();
        baseball.run_physics(k.time());
        if (baseball.pos.y >= 550) {
            baseball.destroy();
        }
    });
    baseball.onCollide("bat", () => {
        k.play("baseball_hit");
        baseball.velocity.y = -2000;
        baseball.velocity.x = Math.random() * 200 - 100;
        k.wait(1, () => {
            baseball.destroy();
        });
        (k.get("player")[0]).baseball_hit();
    });
    return baseball;
}

export { summon_soda, summon_popcorn, summon_hotdog, summon_churro, summon_baseball };
export type { HealthComp };